-- 0004_patients.sql — Patient master record

CREATE TABLE patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  -- Medical Record Number — unique within tenant
  mrn           TEXT NOT NULL,
  UNIQUE (tenant_id, mrn),

  -- Demographics
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  dob           DATE NOT NULL,
  gender        gender NOT NULL,
  blood_group   TEXT,

  -- Contact
  phone         TEXT NOT NULL,
  email         TEXT,
  address       TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,

  -- Insurance
  insurance_provider TEXT,
  insurance_policy   TEXT,

  -- Dietary & clinical flags
  dietary_flag  dietary_flag NOT NULL DEFAULT 'none',
  allergies     TEXT[],           -- free-text allergy list

  -- Portal access (links to auth.users if patient registered)
  auth_user_id  UUID REFERENCES auth.users(id),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX patients_tenant_idx ON patients(tenant_id);
CREATE INDEX patients_mrn_idx ON patients(tenant_id, mrn);
CREATE INDEX patients_name_idx ON patients(tenant_id, last_name, first_name);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Staff (non-patient) can read all patients in their tenant
CREATE POLICY "staff_read_patients" ON patients
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

-- Patient can read only their own record
CREATE POLICY "patient_self_read" ON patients
  FOR SELECT USING (auth_user_id = auth.uid());

-- Front desk can register patients
CREATE POLICY "front_desk_insert_patients" ON patients
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('front_desk', 'admin', 'doctor')
  );
