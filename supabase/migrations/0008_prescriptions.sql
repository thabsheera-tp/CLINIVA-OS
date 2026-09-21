-- 0008_prescriptions.sql — Electronic prescriptions & MAR

-- Medication master (formulary — pre-seeded per clinic)
CREATE TABLE medications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  generic_name    TEXT NOT NULL,
  brand_name      TEXT,
  strength        TEXT,      -- e.g. '500mg', '10mg/5ml'
  form            TEXT,      -- tablet, capsule, syrup, injection, cream
  is_controlled   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(tenant_id, generic_name, strength, form)
);

-- Prescription header (from doctor to pharmacy)
CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id),
  appointment_id  UUID REFERENCES appointments(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  prescribed_by   UUID NOT NULL REFERENCES profiles(id), -- doctor
  dispensed_by    UUID REFERENCES profiles(id),          -- pharmacist

  status          rx_status NOT NULL DEFAULT 'pending',
  is_ip_order     BOOLEAN NOT NULL DEFAULT FALSE,  -- inpatient MAR vs outpatient Rx
  notes           TEXT,

  prescribed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispensed_at    TIMESTAMPTZ
);

-- Prescription line items
CREATE TABLE prescription_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_id   UUID NOT NULL REFERENCES medications(id),
  dosage          TEXT NOT NULL,       -- e.g. '500mg'
  route           TEXT NOT NULL,       -- PO, IV, IM, topical
  frequency       TEXT NOT NULL,       -- 'once daily', 'TID', 'BD'
  duration_days   INTEGER,
  quantity        INTEGER,
  instructions    TEXT,                -- 'take with food', 'avoid alcohol'
  drug_interaction_flag BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX rx_tenant_patient_idx ON prescriptions(tenant_id, patient_id);
CREATE INDEX rx_status_idx ON prescriptions(tenant_id, status);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_rx" ON prescriptions
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('doctor', 'pharmacist', 'nurse', 'admin')
  );

CREATE POLICY "doctor_create_rx" ON prescriptions
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'doctor'
  );

CREATE POLICY "pharmacist_update_rx" ON prescriptions
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'pharmacist'
  );

CREATE POLICY "patient_read_own_rx" ON prescriptions
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "staff_read_medications" ON medications
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );
