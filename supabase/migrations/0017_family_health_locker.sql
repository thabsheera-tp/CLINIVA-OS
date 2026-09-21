-- 0017_family_health_locker.sql — Family Health Locker & Document Vault
-- Stores multi-member family profiles, medical records, prescription uploads, and vaccination history.

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE family_relationship AS ENUM ('self', 'spouse', 'child', 'parent', 'sibling', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE record_category AS ENUM (
    'prescription',
    'lab_report',
    'discharge_summary',
    'vaccine_card',
    'scan_imaging',
    'clinical_note',
    'insurance_doc'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vaccine_status AS ENUM ('administered', 'upcoming', 'overdue');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Family Members Profiles (linked to main user account)
CREATE TABLE IF NOT EXISTS family_members (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  relationship        family_relationship NOT NULL DEFAULT 'other',
  dob                 DATE,
  gender              gender DEFAULT 'prefer_not_to_say',
  blood_group         TEXT,
  allergies           TEXT[] DEFAULT '{}',
  chronic_conditions  TEXT[] DEFAULT '{}',
  emergency_contact   TEXT,
  avatar_color        TEXT DEFAULT 'primary',
  is_primary          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Medical Records & Uploaded Prescriptions
CREATE TABLE IF NOT EXISTS family_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id    UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  primary_user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category            record_category NOT NULL DEFAULT 'prescription',
  title               TEXT NOT NULL,
  doctor_name         TEXT,
  clinic_hospital     TEXT,
  record_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  storage_path        TEXT,                     -- Path in Supabase Storage bucket 'family_health_locker'
  file_name           TEXT NOT NULL,
  file_size_bytes     BIGINT,
  mime_type           TEXT,
  notes               TEXT,
  tags                TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Vaccination History & Immunization Records
CREATE TABLE IF NOT EXISTS family_vaccinations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id    UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  primary_user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vaccine_name        TEXT NOT NULL,
  dose_label          TEXT NOT NULL DEFAULT 'Dose 1',
  status              vaccine_status NOT NULL DEFAULT 'administered',
  administered_date   DATE,
  due_date            DATE,
  clinic_provider     TEXT,
  batch_number        TEXT,
  certificate_path    TEXT,                     -- File path in Supabase Storage
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS family_members_user_idx ON family_members(primary_user_id);
CREATE INDEX IF NOT EXISTS family_records_member_idx ON family_records(family_member_id);
CREATE INDEX IF NOT EXISTS family_records_user_idx ON family_records(primary_user_id);
CREATE INDEX IF NOT EXISTS family_records_category_idx ON family_records(category);
CREATE INDEX IF NOT EXISTS family_vaccinations_member_idx ON family_vaccinations(family_member_id);

-- Enable Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_vaccinations ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies (Users can only access their own family locker)
-- Family Members Policies
CREATE POLICY "family_members_user_all" ON family_members
  FOR ALL
  USING (primary_user_id = auth.uid())
  WITH CHECK (primary_user_id = auth.uid());

-- Family Records Policies
CREATE POLICY "family_records_user_all" ON family_records
  FOR ALL
  USING (primary_user_id = auth.uid())
  WITH CHECK (primary_user_id = auth.uid());

-- Family Vaccinations Policies
CREATE POLICY "family_vaccinations_user_all" ON family_vaccinations
  FOR ALL
  USING (primary_user_id = auth.uid())
  WITH CHECK (primary_user_id = auth.uid());

-- 6. Supabase Storage Bucket Setup for Secure Prescriptions & Health Docs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'family_health_locker',
  'family_health_locker',
  FALSE,
  15728640, -- 15MB limit per file
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];

-- Storage RLS: Users can only upload, read, and delete within their own user folder: <user_id>/...
CREATE POLICY "user_can_read_own_family_docs" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'family_health_locker'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "user_can_upload_own_family_docs" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'family_health_locker'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "user_can_delete_own_family_docs" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'family_health_locker'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
