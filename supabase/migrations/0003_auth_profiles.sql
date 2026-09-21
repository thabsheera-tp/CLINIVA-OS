-- 0003_auth_profiles.sql — Staff & patient user profiles
-- Extends Supabase auth.users with clinical role info.
-- Automatically created via DB trigger on signup.

CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role             user_role NOT NULL,
  display_name     TEXT NOT NULL,
  avatar_url       TEXT,
  department       TEXT,           -- e.g. 'Cardiology', 'Ward A', 'OPD'
  employee_id      TEXT,           -- clinic's internal staff ID
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for frequent lookups
CREATE INDEX profiles_tenant_idx ON profiles(tenant_id);
CREATE INDEX profiles_role_idx ON profiles(role);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Each user can read/update their own profile
CREATE POLICY "profile_self_read" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profile_self_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Staff can read other staff profiles in their clinic (for directory, queue assignment)
CREATE POLICY "tenant_staff_read_profiles" ON profiles
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

-- Admin can manage all profiles in their clinic
CREATE POLICY "admin_manage_profiles" ON profiles
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Trigger: sync display_name into auth.users user_metadata on insert
CREATE OR REPLACE FUNCTION sync_profile_to_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data ||
    jsonb_build_object(
      'role', NEW.role,
      'tenant_id', NEW.tenant_id,
      'display_name', NEW.display_name
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profile_to_user_metadata();
