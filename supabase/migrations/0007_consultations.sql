-- 0007_consultations.sql — Doctor consultation notes (SOAP format)
-- Each appointment may produce one consultation note.

CREATE TABLE consultations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  doctor_id       UUID NOT NULL REFERENCES profiles(id),

  -- SOAP Notes
  subjective      TEXT, -- Chief complaint, history
  objective       TEXT, -- Examination findings
  assessment      TEXT, -- Diagnosis / differential
  plan            TEXT, -- Treatment plan, follow-up

  -- ICD-10 codes (array for multiple diagnoses)
  icd10_codes     TEXT[],

  -- Clinical flags
  is_emergency    BOOLEAN NOT NULL DEFAULT FALSE,
  follow_up_in    INTEGER, -- days until follow-up

  -- Timestamps
  started_at      TIMESTAMPTZ,
  signed_at       TIMESTAMPTZ, -- doctor finalized / e-signed
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX consult_patient_idx ON consultations(patient_id, created_at DESC);
CREATE INDEX consult_doctor_idx ON consultations(doctor_id, created_at DESC);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor_manage_own_consults" ON consultations
  USING (
    doctor_id = auth.uid()
    AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "staff_read_consults" ON consultations
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('nurse', 'pharmacist', 'lab_tech', 'admin')
  );

CREATE POLICY "patient_read_own_consults" ON consultations
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );
