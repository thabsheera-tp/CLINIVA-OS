-- 0006_vitals.sql — Patient vitals & nursing observations

CREATE TABLE patient_vitals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  recorded_by    UUID NOT NULL REFERENCES profiles(id), -- nurse or doctor

  -- Vital signs
  bp_systolic    SMALLINT,  -- mmHg
  bp_diastolic   SMALLINT,  -- mmHg
  heart_rate     SMALLINT,  -- bpm
  spo2           SMALLINT,  -- %
  temperature    NUMERIC(4,1), -- °C or °F (store °F per Stitch design)
  respiratory_rate SMALLINT, -- breaths/min
  weight_kg      NUMERIC(5,1),
  height_cm      NUMERIC(5,1),
  bmi            NUMERIC(4,1) GENERATED ALWAYS AS (
    CASE WHEN height_cm > 0 AND weight_kg > 0
    THEN ROUND((weight_kg / POWER(height_cm / 100.0, 2))::NUMERIC, 1)
    ELSE NULL END
  ) STORED,

  -- Free text notes
  notes          TEXT,

  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX vitals_patient_idx ON patient_vitals(patient_id, recorded_at DESC);
CREATE INDEX vitals_tenant_idx ON patient_vitals(tenant_id, recorded_at DESC);

ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_vitals" ON patient_vitals
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) NOT IN ('patient', 'canteen')
  );

CREATE POLICY "nurse_doctor_insert_vitals" ON patient_vitals
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('nurse', 'doctor')
  );

CREATE POLICY "patient_read_own_vitals" ON patient_vitals
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );
