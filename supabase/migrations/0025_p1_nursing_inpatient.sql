-- ==============================================================================
-- 0025_p1_nursing_inpatient.sql
-- P1 Fix #5: Nursing / Inpatient Workflow Persistence
-- ==============================================================================
-- Changes:
--   1. Update beds RLS: allow nurse, doctor, and admin to manage beds
--      (assign, release, update status) using non-recursive security helpers.
--   2. Update wards RLS: allow all staff to view wards.
--   3. Update patient_vitals RLS: allow nurse, doctor, and admin to insert and
--      read vitals using non-recursive security helpers.
--   4. Enable realtime publication for beds and patient_vitals in supabase_realtime.
-- ==============================================================================

-- ── 1. Beds RLS ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "staff_read_beds" ON beds;
DROP POLICY IF EXISTS "nurse_admin_manage_beds" ON beds;

CREATE POLICY "staff_read_beds" ON beds
  FOR SELECT
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() != 'patient'
  );

CREATE POLICY "nurse_doctor_admin_manage_beds" ON beds
  FOR ALL
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('nurse', 'doctor', 'admin')
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('nurse', 'doctor', 'admin')
  );

-- ── 2. Wards RLS ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "staff_read_wards" ON wards;

CREATE POLICY "staff_read_wards" ON wards
  FOR SELECT
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() != 'patient'
  );

-- ── 3. Patient Vitals RLS ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "staff_read_vitals" ON patient_vitals;
DROP POLICY IF EXISTS "nurse_doctor_insert_vitals" ON patient_vitals;

CREATE POLICY "staff_read_vitals" ON patient_vitals
  FOR SELECT
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() NOT IN ('patient', 'canteen')
  );

CREATE POLICY "nurse_doctor_admin_manage_vitals" ON patient_vitals
  FOR ALL
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('nurse', 'doctor', 'admin')
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('nurse', 'doctor', 'admin')
  );

-- ── 4. Realtime Publication Sync ──────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'cliniva_realtime') THEN
    BEGIN
      ALTER PUBLICATION cliniva_realtime ADD TABLE beds, patient_vitals;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE beds, patient_vitals;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;
