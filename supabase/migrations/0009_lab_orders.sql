-- 0009_lab_orders.sql — Lab test orders, samples, results

-- Test catalog (pre-seeded)
CREATE TABLE lab_tests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  test_code        TEXT NOT NULL,    -- e.g. 'CBC', 'LFT', 'RBS'
  test_name        TEXT NOT NULL,
  sample_type      TEXT NOT NULL,    -- Blood, Urine, Stool, CSF, Sputum
  turnaround_hrs   SMALLINT,         -- expected TAT in hours
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(tenant_id, test_code)
);

-- Lab order (from doctor to lab)
CREATE TABLE lab_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id),
  appointment_id   UUID REFERENCES appointments(id),
  ordered_by       UUID NOT NULL REFERENCES profiles(id), -- doctor
  collected_by     UUID REFERENCES profiles(id),          -- nurse/lab tech
  resulted_by      UUID REFERENCES profiles(id),          -- lab tech

  status           lab_order_status NOT NULL DEFAULT 'ordered',
  is_stat          BOOLEAN NOT NULL DEFAULT FALSE,         -- STAT vs routine
  sample_collected_at TIMESTAMPTZ,
  resulted_at      TIMESTAMPTZ,
  reported_at      TIMESTAMPTZ,

  -- Clinical notes
  clinical_info    TEXT,
  ordered_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual test results within an order
CREATE TABLE lab_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id     UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  lab_test_id      UUID NOT NULL REFERENCES lab_tests(id),

  -- Result value (numeric or text)
  result_value     TEXT NOT NULL,
  result_unit      TEXT,
  ref_range_low    TEXT,
  ref_range_high   TEXT,
  severity         lab_severity NOT NULL DEFAULT 'normal',

  -- Critical value — triggers realtime notification to doctor
  is_critical      BOOLEAN NOT NULL DEFAULT FALSE,
  critical_notified_at TIMESTAMPTZ,

  resulted_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX lab_orders_patient_idx ON lab_orders(patient_id, ordered_at DESC);
CREATE INDEX lab_orders_status_idx ON lab_orders(tenant_id, status);
CREATE INDEX lab_results_order_idx ON lab_results(lab_order_id);

ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_lab_orders" ON lab_orders
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('doctor', 'nurse', 'lab_tech', 'admin')
  );

CREATE POLICY "lab_tech_update_orders" ON lab_orders
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'lab_tech'
  );

CREATE POLICY "patient_read_own_lab" ON lab_orders
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "patient_read_own_results" ON lab_results
  FOR SELECT USING (
    lab_order_id IN (
      SELECT lo.id FROM lab_orders lo
      JOIN patients p ON p.id = lo.patient_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
