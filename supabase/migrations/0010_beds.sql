-- 0010_beds.sql — Ward, bed, and IP admission management

CREATE TABLE wards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,   -- e.g. 'Ward A', 'ICU', 'Maternity'
  floor       TEXT,
  capacity    SMALLINT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE beds (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  ward_id        UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  bed_number     TEXT NOT NULL,
  status         bed_status NOT NULL DEFAULT 'available',

  -- Current occupant
  current_patient_id UUID REFERENCES patients(id),
  admitted_at    TIMESTAMPTZ,
  expected_discharge_at TIMESTAMPTZ,

  last_sanitized_at TIMESTAMPTZ,
  UNIQUE(tenant_id, ward_id, bed_number)
);

CREATE INDEX beds_tenant_status_idx ON beds(tenant_id, status);
CREATE INDEX beds_ward_idx ON beds(ward_id);

ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_wards" ON wards
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

CREATE POLICY "staff_read_beds" ON beds
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

CREATE POLICY "nurse_admin_manage_beds" ON beds
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('nurse', 'admin')
  );
