-- 0005_appointments.sql — OPD Queue & Appointments

CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES profiles(id),

  -- Queue token — issued by front desk, monotonic per clinic per day
  queue_token     INTEGER,
  scheduled_at    TIMESTAMPTZ NOT NULL,

  -- Status lifecycle
  status          appt_status NOT NULL DEFAULT 'scheduled',
  checked_in_at   TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  -- Clinical context
  chief_complaint  TEXT,
  visit_type       TEXT NOT NULL DEFAULT 'opd'
    CHECK (visit_type IN ('opd', 'follow_up', 'emergency', 'telehealth', 'ip_admission')),
  notes            TEXT,

  -- Telehealth
  meeting_url      TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX appt_tenant_date_idx ON appointments(tenant_id, scheduled_at);
CREATE INDEX appt_doctor_date_idx ON appointments(doctor_id, scheduled_at);
CREATE INDEX appt_patient_idx ON appointments(patient_id);
CREATE INDEX appt_status_idx ON appointments(tenant_id, status);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Staff read appointments in their tenant
CREATE POLICY "staff_read_appts" ON appointments
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

-- Doctor can update their own appointments (start, complete consultations)
CREATE POLICY "doctor_update_appts" ON appointments
  FOR UPDATE USING (
    doctor_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'doctor'
  );

-- Front desk can insert and update appointment status
CREATE POLICY "front_desk_manage_appts" ON appointments
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('front_desk', 'admin')
  );

-- Patient can read their own appointments
CREATE POLICY "patient_read_own_appts" ON appointments
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );
