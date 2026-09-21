-- ==============================================================================
-- 0016_patient_queue.sql — Live OPD Waiting List & Queue Time Predictor
-- ==============================================================================

-- 1. Create the patient_queue table
CREATE TABLE IF NOT EXISTS patient_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name VARCHAR(255) NOT NULL,
  token_number INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'waiting' 
    CHECK (status IN ('waiting', 'in-consultation', 'completed', 'cancelled', 'no-show')),
  priority VARCHAR(20) NOT NULL DEFAULT 'routine' 
    CHECK (priority IN ('routine', 'urgent', 'emergency')),
  department VARCHAR(100) NOT NULL DEFAULT 'General Medicine',
  doctor_id UUID REFERENCES auth_profiles(id) ON DELETE SET NULL,
  chief_complaint TEXT,
  
  -- Time prediction & tracking fields
  estimated_wait_minutes INT NOT NULL DEFAULT 15,
  estimated_consultation_time TIMESTAMPTZ,
  consultation_started_at TIMESTAMPTZ,
  consultation_completed_at TIMESTAMPTZ,
  
  -- Multi-tenancy & audit
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for high-performance ordering and real-time filtering
CREATE INDEX IF NOT EXISTS idx_patient_queue_tenant_status 
  ON patient_queue(tenant_id, status, token_number ASC);

CREATE INDEX IF NOT EXISTS idx_patient_queue_dept_status 
  ON patient_queue(department, status, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_patient_queue_doctor 
  ON patient_queue(doctor_id, status);

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_patient_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_patient_queue_timestamp ON patient_queue;
CREATE TRIGGER trg_patient_queue_timestamp
  BEFORE UPDATE ON patient_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_queue_timestamp();

-- 4. Row Level Security (RLS)
ALTER TABLE patient_queue ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policy: clinic staff can view and manage their clinic's queue
CREATE POLICY "patient_queue_tenant_isolation"
  ON patient_queue
  FOR ALL
  USING (
    tenant_id IS NULL OR 
    tenant_id = (SELECT tenant_id FROM auth_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    tenant_id IS NULL OR 
    tenant_id = (SELECT tenant_id FROM auth_profiles WHERE id = auth.uid())
  );

-- Anonymous / Demo Read Access (for public queue display boards and demo mode)
CREATE POLICY "patient_queue_public_read"
  ON patient_queue
  FOR SELECT
  USING (true);

-- 5. Add to Supabase Realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'cliniva_realtime') THEN
    ALTER PUBLICATION cliniva_realtime ADD TABLE patient_queue;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
