-- 0012_billing.sql — Invoice, line items, payments

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  appointment_id  UUID REFERENCES appointments(id),

  invoice_number  TEXT NOT NULL,
  UNIQUE(tenant_id, invoice_number),

  subtotal        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance_due     NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,

  payment_status  payment_status NOT NULL DEFAULT 'pending',
  due_date        DATE,

  -- Insurance
  insurance_provider TEXT,
  insurance_claim_id TEXT,
  insurance_approved_amount NUMERIC(12, 2),

  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'service'
    CHECK (category IN ('consultation', 'lab', 'pharmacy', 'room', 'surgery', 'procedure', 'other')),
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price      NUMERIC(10, 2) NOT NULL,
  line_total      NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount          NUMERIC(12, 2) NOT NULL,
  method          TEXT NOT NULL
    CHECK (method IN ('cash', 'card', 'upi', 'net_banking', 'insurance', 'waiver')),
  reference_id    TEXT,  -- UPI transaction ID, card authorization, etc.
  recorded_by     UUID REFERENCES profiles(id),
  paid_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX invoices_tenant_status_idx ON invoices(tenant_id, payment_status);
CREATE INDEX invoices_patient_idx ON invoices(patient_id);
CREATE INDEX payments_invoice_idx ON payments(invoice_id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cashier_admin_manage_invoices" ON invoices
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('cashier', 'admin')
  );

CREATE POLICY "patient_read_own_invoices" ON invoices
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );
