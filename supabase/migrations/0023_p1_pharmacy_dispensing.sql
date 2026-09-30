-- ==============================================================================
-- 0023_p1_pharmacy_dispensing.sql
-- P1 Fix #3: Complete Pharmacy Dispensing & Stock Persistence
-- ==============================================================================
-- Changes:
--   1. Fix pharmacy_inventory RLS: add WITH CHECK for inventory deductions/updates
--      and use get_auth_tenant_id() / get_auth_role() helpers.
--   2. Fix prescriptions update RLS: allow pharmacists and admins to update
--      prescription status to 'dispensed' with WITH CHECK.
--   3. Enable realtime publication for pharmacy_inventory.
-- ==============================================================================

-- ── 1. Pharmacy Inventory RLS ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "pharmacist_admin_manage_inventory" ON pharmacy_inventory;

CREATE POLICY "pharmacist_admin_manage_inventory" ON pharmacy_inventory
  FOR ALL
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('pharmacist', 'admin', 'doctor')
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('pharmacist', 'admin', 'doctor')
  );

DROP POLICY IF EXISTS "staff_read_pharmacy_inventory" ON pharmacy_inventory;

CREATE POLICY "staff_read_pharmacy_inventory" ON pharmacy_inventory
  FOR SELECT USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() != 'patient'
  );

-- ── 2. Prescriptions Update RLS ───────────────────────────────────────────────

DROP POLICY IF EXISTS "pharmacist_update_rx" ON prescriptions;

CREATE POLICY "pharmacist_update_rx" ON prescriptions
  FOR UPDATE
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('pharmacist', 'admin')
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('pharmacist', 'admin')
  );

-- ── 3. Realtime Publication Sync ──────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'cliniva_realtime') THEN
    BEGIN
      ALTER PUBLICATION cliniva_realtime ADD TABLE pharmacy_inventory;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE pharmacy_inventory;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;
