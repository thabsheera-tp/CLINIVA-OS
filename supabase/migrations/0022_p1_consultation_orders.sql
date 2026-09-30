-- ==============================================================================
-- 0022_p1_consultation_orders.sql
-- P1 Fix #2: Persist Doctor Consultation Notes & Order Generation
-- ==============================================================================
-- Changes:
--   1. Fix consultations RLS: add WITH CHECK for doctor insert and use get_auth_tenant_id()
--   2. Fix prescriptions & prescription_items RLS: allow doctors to insert headers & items
--   3. Fix lab_orders RLS: add INSERT policy for doctors and staff
--   4. Enable realtime publication for consultations and lab_orders
-- ==============================================================================

-- ── 1. Consultations RLS ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "doctor_manage_own_consults" ON consultations;

CREATE POLICY "doctor_manage_own_consults" ON consultations
  FOR ALL
  USING (
    tenant_id = get_auth_tenant_id()
    AND (doctor_id = auth.uid() OR get_auth_role() IN ('doctor', 'admin'))
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND (doctor_id = auth.uid() OR get_auth_role() IN ('doctor', 'admin'))
  );

DROP POLICY IF EXISTS "staff_read_consults" ON consultations;

CREATE POLICY "staff_read_consults" ON consultations
  FOR SELECT USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('doctor', 'nurse', 'pharmacist', 'lab_tech', 'admin')
  );

-- ── 2. Prescriptions & Prescription Items RLS ─────────────────────────────────

DROP POLICY IF EXISTS "doctor_create_rx" ON prescriptions;

CREATE POLICY "doctor_create_rx" ON prescriptions
  FOR INSERT WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('doctor', 'admin')
  );

DROP POLICY IF EXISTS "staff_read_rx" ON prescriptions;

CREATE POLICY "staff_read_rx" ON prescriptions
  FOR SELECT USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('doctor', 'pharmacist', 'nurse', 'admin')
  );

DROP POLICY IF EXISTS "staff_manage_prescription_items" ON prescription_items;

CREATE POLICY "staff_manage_prescription_items" ON prescription_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prescriptions p
      WHERE p.id = prescription_items.prescription_id
        AND p.tenant_id = get_auth_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prescriptions p
      WHERE p.id = prescription_items.prescription_id
        AND p.tenant_id = get_auth_tenant_id()
    )
  );

-- ── 3. Lab Orders RLS ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "doctor_create_lab_order" ON lab_orders;

CREATE POLICY "doctor_create_lab_order" ON lab_orders
  FOR INSERT WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('doctor', 'admin')
  );

DROP POLICY IF EXISTS "staff_read_lab_orders" ON lab_orders;

CREATE POLICY "staff_read_lab_orders" ON lab_orders
  FOR SELECT USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('doctor', 'nurse', 'lab_tech', 'admin')
  );

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

-- ── 4. Realtime Publication Sync ──────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'cliniva_realtime') THEN
    BEGIN
      ALTER PUBLICATION cliniva_realtime ADD TABLE consultations, lab_orders;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE consultations, lab_orders;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;
