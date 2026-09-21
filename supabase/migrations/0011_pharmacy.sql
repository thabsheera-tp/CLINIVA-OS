-- 0011_pharmacy.sql — Pharmacy inventory & stock management

CREATE TABLE pharmacy_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  medication_id   UUID NOT NULL REFERENCES medications(id),
  batch_number    TEXT,
  manufacturer    TEXT,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  reorder_level   INTEGER NOT NULL DEFAULT 0,    -- trigger reorder when stock <= this
  unit_price      NUMERIC(10, 2),
  expiry_date     DATE,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  location        TEXT, -- shelf/bin location in pharmacy
  UNIQUE(tenant_id, medication_id, batch_number)
);

CREATE TABLE purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  supplier_name   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'acknowledged', 'received', 'cancelled')),
  total_amount    NUMERIC(12, 2),
  ordered_by      UUID NOT NULL REFERENCES profiles(id),
  ordered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_at     TIMESTAMPTZ,
  received_at     TIMESTAMPTZ
);

CREATE TABLE purchase_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  medication_id   UUID NOT NULL REFERENCES medications(id),
  quantity        INTEGER NOT NULL,
  unit_price      NUMERIC(10, 2),
  total_price     NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX inv_tenant_med_idx ON pharmacy_inventory(tenant_id, medication_id);
CREATE INDEX inv_expiry_idx ON pharmacy_inventory(tenant_id, expiry_date);

ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pharmacist_admin_manage_inventory" ON pharmacy_inventory
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('pharmacist', 'admin')
  );
