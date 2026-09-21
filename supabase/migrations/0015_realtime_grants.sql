-- 0015_realtime_grants.sql — Supabase Realtime publication grants
-- Enable real-time subscriptions for live queue, vitals, and bed status.
-- Only non-PHI or PHI-tenant-scoped tables are published.

-- Drop any existing publication first
DROP PUBLICATION IF EXISTS cliniva_realtime;

-- Create publication for Realtime
-- Note: RLS is enforced — subscribers only receive rows matching their policies.
CREATE PUBLICATION cliniva_realtime FOR TABLE
  appointments,        -- Queue status updates (doctor portal, patient portal)
  patient_vitals,      -- Live vitals (nursing dashboard → doctor portal alerts)
  beds,                -- Bed status changes (nursing board, canteen meal routing)
  lab_results,         -- Critical value notifications → doctor
  meal_orders,         -- Kitchen order status → canteen
  prescriptions;       -- Rx status → pharmacy queue

-- Index to support Realtime filtering by tenant_id (common filter in subscribe calls)
CREATE INDEX IF NOT EXISTS appt_realtime_idx ON appointments(tenant_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS vitals_realtime_idx ON patient_vitals(tenant_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS beds_realtime_idx ON beds(tenant_id, status);
CREATE INDEX IF NOT EXISTS lab_realtime_idx ON lab_results(lab_order_id, resulted_at DESC);

-- Comment: In Supabase Dashboard, also enable "Realtime" toggle for each table above.
-- Row-level filtering in client: .channel('appts').on('postgres_changes', { schema: 'public', table: 'appointments', filter: `tenant_id=eq.${tenantId}` }, callback)
