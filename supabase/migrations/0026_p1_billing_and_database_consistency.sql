-- ==============================================================================
-- 0026_p1_billing_and_database_consistency.sql
-- P1 Controlled Maintenance Pass:
--   1. Add RLS policies for payments & invoice_items
--   2. Add RLS policies for canteen_menu_items, canteen_inventory, meal_order_items
--   3. Secure patient_queue (drop public read, maintain tenant isolation)
--   4. Harmonize patient_queue status check constraint (support in_consultation & in-consultation)
--   5. Sync publications for invoices & payments
-- ==============================================================================

-- ── 1. Payments & Invoice Items RLS ──────────────────────────────────────────

-- Cashier & Admin can manage payments
DROP POLICY IF EXISTS "cashier_admin_manage_payments" ON payments;

CREATE POLICY "cashier_admin_manage_payments" ON payments
  FOR ALL
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('cashier', 'admin')
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('cashier', 'admin')
  );

-- Staff can read payments in their tenant
DROP POLICY IF EXISTS "staff_read_payments" ON payments;

CREATE POLICY "staff_read_payments" ON payments
  FOR SELECT
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() NOT IN ('patient', 'canteen')
  );

-- Patient can read their own payments
DROP POLICY IF EXISTS "patient_read_own_payments" ON payments;

CREATE POLICY "patient_read_own_payments" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN patients p ON p.id = i.patient_id
      WHERE i.id = payments.invoice_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Enable RLS on invoice_items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_manage_invoice_items" ON invoice_items;

CREATE POLICY "staff_manage_invoice_items" ON invoice_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
        AND i.tenant_id = get_auth_tenant_id()
        AND get_auth_role() IN ('cashier', 'admin', 'doctor', 'nurse')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
        AND i.tenant_id = get_auth_tenant_id()
        AND get_auth_role() IN ('cashier', 'admin')
    )
  );

DROP POLICY IF EXISTS "patient_read_own_invoice_items" ON invoice_items;

CREATE POLICY "patient_read_own_invoice_items" ON invoice_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN patients p ON p.id = i.patient_id
      WHERE i.id = invoice_items.invoice_id
        AND p.auth_user_id = auth.uid()
    )
  );


-- ── 2. Canteen Menu, Inventory & Order Items RLS ─────────────────────────────

DROP POLICY IF EXISTS "canteen_menu_items_read" ON canteen_menu_items;

CREATE POLICY "canteen_menu_items_read" ON canteen_menu_items
  FOR SELECT
  USING (
    tenant_id = get_auth_tenant_id()
    OR tenant_id IS NULL
  );

DROP POLICY IF EXISTS "canteen_menu_items_manage" ON canteen_menu_items;

CREATE POLICY "canteen_menu_items_manage" ON canteen_menu_items
  FOR ALL
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('canteen', 'admin')
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('canteen', 'admin')
  );

DROP POLICY IF EXISTS "canteen_inventory_manage" ON canteen_inventory;

CREATE POLICY "canteen_inventory_manage" ON canteen_inventory
  FOR ALL
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('canteen', 'admin')
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('canteen', 'admin')
  );

ALTER TABLE meal_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "canteen_manage_meal_order_items" ON meal_order_items;

CREATE POLICY "canteen_manage_meal_order_items" ON meal_order_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_orders mo
      WHERE mo.id = meal_order_items.meal_order_id
        AND mo.tenant_id = get_auth_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_orders mo
      WHERE mo.id = meal_order_items.meal_order_id
        AND mo.tenant_id = get_auth_tenant_id()
    )
  );


-- ── 3. Secure patient_queue & Harmonize Status Constraint ─────────────────────

-- Drop over-broad public read policy that permitted cross-tenant reads
DROP POLICY IF EXISTS "patient_queue_public_read" ON patient_queue;

-- Ensure tenant isolation policy covers all operations safely
DROP POLICY IF EXISTS "patient_queue_tenant_isolation" ON patient_queue;

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

-- Harmonize status check constraint to support both hyphen and underscore forms
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  -- Find existing status check constraint if present
  SELECT conname INTO v_conname
  FROM pg_constraint
  WHERE conrelid = 'patient_queue'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';

  IF v_conname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE patient_queue DROP CONSTRAINT ' || quote_ident(v_conname);
  END IF;

  ALTER TABLE patient_queue
    ADD CONSTRAINT patient_queue_status_check
    CHECK (status IN (
      'waiting',
      'in_consultation',
      'in-consultation',
      'completed',
      'cancelled',
      'no_show',
      'no-show'
    ));
END $$;


-- ── 4. Realtime Publication Sync ──────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'cliniva_realtime') THEN
    BEGIN
      ALTER PUBLICATION cliniva_realtime ADD TABLE invoices, payments;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE invoices, payments;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;
