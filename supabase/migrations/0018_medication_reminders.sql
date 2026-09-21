-- 0018_medication_reminders.sql — Smart Medication Reminders & Adherence Tracking

CREATE TABLE IF NOT EXISTS patient_medication_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name    TEXT NOT NULL DEFAULT 'Self',
  medicine_name   TEXT NOT NULL,
  dosage          TEXT NOT NULL,               -- e.g. '40mg', '1 tablet'
  frequency       TEXT NOT NULL DEFAULT 'once_daily', -- 'once_daily', 'twice_daily', 'three_times_daily', 'as_needed'
  schedule_times  TEXT[] NOT NULL DEFAULT '{"08:00"}', -- e.g. ARRAY['08:00', '20:00'] (24h HH:mm)
  meal_timing     TEXT DEFAULT 'after_meal',   -- 'before_meal', 'with_meal', 'after_meal', 'empty_stomach'
  instructions    TEXT,                        -- 'Take with full glass of water'
  category        TEXT DEFAULT 'prescription', -- 'prescription', 'supplement', 'otc'
  color_code      TEXT DEFAULT 'emerald',
  total_pills     INTEGER DEFAULT 30,
  pills_remaining INTEGER DEFAULT 30,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dose adherence event log
CREATE TABLE IF NOT EXISTS medication_dose_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id     UUID NOT NULL REFERENCES patient_medication_reminders(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_time  TIME NOT NULL,
  scheduled_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  status          TEXT NOT NULL DEFAULT 'pending', -- 'taken', 'skipped', 'missed', 'snoozed'
  taken_at        TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reminder_id, scheduled_date, scheduled_time)
);

CREATE INDEX IF NOT EXISTS med_reminders_user_idx ON patient_medication_reminders(user_id);
CREATE INDEX IF NOT EXISTS dose_logs_date_idx ON medication_dose_logs(user_id, scheduled_date);

ALTER TABLE patient_medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_dose_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_med_reminders_all" ON patient_medication_reminders
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_dose_logs_all" ON medication_dose_logs
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
