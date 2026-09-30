-- ==============================================================================
-- 0024_p1_lab_result_entry.sql
-- P1 Fix #4: Complete Lab Result Entry & Persistence
-- ==============================================================================
-- Changes:
--   1. Update lab_orders RLS: allow lab_tech, doctor, and admin to update orders
--      (resulted_by, resulted_at, status) with non-recursive helpers and WITH CHECK.
--   2. Update lab_results RLS: allow staff to insert and update results.
--   3. Enable realtime publication for lab_results.
-- ==============================================================================

-- ── 1. Lab Orders Update RLS ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "lab_tech_update_orders" ON lab_orders;

CREATE POLICY "lab_tech_update_orders" ON lab_orders
  FOR UPDATE
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('lab_tech', 'doctor', 'admin')
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('lab_tech', 'doctor', 'admin')
  );

-- ── 2. Lab Results RLS ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "doctor_staff_manage_lab_results" ON lab_results;

CREATE POLICY "doctor_staff_manage_lab_results" ON lab_results
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lab_orders lo
      WHERE lo.id = lab_results.lab_order_id
        AND lo.tenant_id = get_auth_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lab_orders lo
      WHERE lo.id = lab_results.lab_order_id
        AND lo.tenant_id = get_auth_tenant_id()
    )
  );

-- ── 3. Realtime Publication Sync ──────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'cliniva_realtime') THEN
    BEGIN
      ALTER PUBLICATION cliniva_realtime ADD TABLE lab_results;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE lab_results;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;
