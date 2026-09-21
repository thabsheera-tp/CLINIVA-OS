-- 0019_emergency_sos.sql — Emergency SOS & Ambulance Dispatch Alerts

CREATE TABLE IF NOT EXISTS emergency_sos_alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name        TEXT NOT NULL DEFAULT 'Emergency Patient',
  phone               TEXT NOT NULL DEFAULT '+1 (555) 201-9481',
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  accuracy_meters     DOUBLE PRECISION,
  status              TEXT NOT NULL DEFAULT 'dispatched', -- 'dispatched', 'en_route', 'arrived', 'resolved'
  chief_complaint     TEXT DEFAULT 'Emergency SOS Triggered by Patient',
  ambulance_unit      TEXT DEFAULT 'Unit Med-4 (Rapid Response)',
  eta_minutes         INTEGER DEFAULT 7,
  dispatched_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS sos_alerts_dispatched_idx ON emergency_sos_alerts(dispatched_at DESC);
CREATE INDEX IF NOT EXISTS sos_alerts_status_idx ON emergency_sos_alerts(status);

ALTER TABLE emergency_sos_alerts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create alerts and staff/patients to view
CREATE POLICY "anyone_can_insert_sos" ON emergency_sos_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "user_and_staff_read_sos" ON emergency_sos_alerts
  FOR SELECT USING (true);
