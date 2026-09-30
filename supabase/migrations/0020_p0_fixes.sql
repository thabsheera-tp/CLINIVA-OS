-- ==============================================================================
-- 0020_p0_fixes.sql — Critical Security & Schema Corrections
-- ==============================================================================
-- Fixes:
-- 1. profiles RLS infinite recursion using SECURITY DEFINER helper functions
-- 2. patient_queue foreign key corrections (auth_profiles -> profiles, tenants -> clinics)
-- ==============================================================================

-- ── 1. Fix profiles RLS Recursion ──────────────────────────────────────────────

-- Helper functions bypass RLS safely to read tenant_id and role for the current user
CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Drop recursive policies on profiles if they exist
DROP POLICY IF EXISTS "tenant_staff_read_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_manage_profiles" ON profiles;

-- Recreate policies using non-recursive SECURITY DEFINER helper functions
CREATE POLICY "tenant_staff_read_profiles" ON profiles
  FOR SELECT USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() != 'patient'
  );

CREATE POLICY "admin_manage_profiles" ON profiles
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() = 'admin'
  );

-- ── 2. Fix patient_queue Foreign Keys & RLS ───────────────────────────────────

-- Drop broken policies on patient_queue if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'patient_queue') THEN
    DROP POLICY IF EXISTS "patient_queue_tenant_isolation" ON patient_queue;

    -- Drop broken foreign keys if they exist
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'patient_queue_doctor_id_fkey' AND table_name = 'patient_queue'
    ) THEN
      ALTER TABLE patient_queue DROP CONSTRAINT patient_queue_doctor_id_fkey;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'patient_queue_tenant_id_fkey' AND table_name = 'patient_queue'
    ) THEN
      ALTER TABLE patient_queue DROP CONSTRAINT patient_queue_tenant_id_fkey;
    END IF;

    -- Add correct foreign keys to profiles and clinics
    ALTER TABLE patient_queue
      ADD CONSTRAINT patient_queue_doctor_id_fkey
      FOREIGN KEY (doctor_id) REFERENCES profiles(id) ON DELETE SET NULL;

    ALTER TABLE patient_queue
      ADD CONSTRAINT patient_queue_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES clinics(id) ON DELETE CASCADE;

    -- Recreate tenant isolation policy using correct profiles table / helper
    CREATE POLICY "patient_queue_tenant_isolation"
      ON patient_queue
      FOR ALL
      USING (
        tenant_id IS NULL OR 
        tenant_id = get_auth_tenant_id()
      )
      WITH CHECK (
        tenant_id IS NULL OR 
        tenant_id = get_auth_tenant_id()
      );
  END IF;
END $$;

-- ── 3. Realtime Publication Sync ──────────────────────────────────────────────
-- Ensure tables are enabled in cliniva_realtime and the default supabase_realtime
DO $$
BEGIN
  -- 1. Ensure cliniva_realtime publication exists
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'cliniva_realtime') THEN
    CREATE PUBLICATION cliniva_realtime;
  END IF;

  -- 2. Add tables to cliniva_realtime safely
  BEGIN
    ALTER PUBLICATION cliniva_realtime ADD TABLE appointments, patient_vitals, beds, lab_results, meal_orders, prescriptions;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- 3. Also add to default supabase_realtime if present (standard for Supabase JS client)
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE patient_vitals;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE prescriptions;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE beds;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;
