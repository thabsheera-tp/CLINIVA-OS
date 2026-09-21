-- ========================================================
-- CLINIVA OS — COMPLETE DATABASE SETUP & SEED SCRIPT
-- Paste this entire file into Supabase SQL Editor and click RUN
-- Idempotent & safe to re-run
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN CREATE TYPE appt_status AS ENUM ('scheduled', 'checked_in', 'in_consultation', 'completed', 'no_show', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bed_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE rx_status AS ENUM ('pending', 'verified', 'dispensed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lab_order_status AS ENUM ('ordered', 'sample_collected', 'processing', 'resulted', 'reported', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lab_severity AS ENUM ('normal', 'low', 'high', 'critical_low', 'critical_high'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('doctor', 'front_desk', 'nurse', 'pharmacist', 'lab_tech', 'cashier', 'admin', 'canteen', 'patient'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'waived', 'insurance_pending'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE dietary_flag AS ENUM ('none', 'vegetarian', 'vegan', 'diabetic', 'low_sodium', 'low_fat', 'gluten_free', 'npo', 'soft_diet', 'liquid_only'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE meal_status AS ENUM ('ordered', 'preparing', 'ready', 'delivered', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. CLINICS & TENANCY
CREATE TABLE IF NOT EXISTS clinics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  address      TEXT,
  phone        TEXT,
  email        TEXT,
  logo_url     TEXT,
  plan_tier    TEXT NOT NULL DEFAULT 'base' CHECK (plan_tier IN ('base', 'premium', 'enterprise')),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinic_settings (
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  value        JSONB NOT NULL,
  updated_by   UUID,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (clinic_id, key)
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

-- 4. PROFILES (Staff & Patients)
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY,
  tenant_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role             user_role NOT NULL,
  display_name     TEXT NOT NULL,
  avatar_url       TEXT,
  department       TEXT,
  employee_id      TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_tenant_idx ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. PATIENTS
CREATE TABLE IF NOT EXISTS patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  mrn           TEXT NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  dob           DATE NOT NULL,
  gender        gender NOT NULL,
  blood_group   TEXT,
  phone         TEXT NOT NULL,
  email         TEXT,
  address       TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  insurance_provider TEXT,
  insurance_policy   TEXT,
  dietary_flag  dietary_flag NOT NULL DEFAULT 'none',
  allergies     TEXT[],
  auth_user_id  UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, mrn)
);

CREATE INDEX IF NOT EXISTS patients_tenant_idx ON patients(tenant_id);
CREATE INDEX IF NOT EXISTS patients_mrn_idx ON patients(tenant_id, mrn);
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 6. APPOINTMENTS & QUEUE
CREATE TABLE IF NOT EXISTS appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES profiles(id),
  queue_token     INTEGER,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          appt_status NOT NULL DEFAULT 'scheduled',
  checked_in_at   TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  chief_complaint TEXT,
  visit_type       TEXT NOT NULL DEFAULT 'opd' CHECK (visit_type IN ('opd', 'follow_up', 'emergency', 'telehealth', 'ip_admission')),
  notes            TEXT,
  meeting_url      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS appt_tenant_date_idx ON appointments(tenant_id, scheduled_at);
CREATE INDEX IF NOT EXISTS appt_doctor_date_idx ON appointments(doctor_id, scheduled_at);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 7. PATIENT VITALS
CREATE TABLE IF NOT EXISTS patient_vitals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  recorded_by    UUID NOT NULL REFERENCES profiles(id),
  bp_systolic    SMALLINT,
  bp_diastolic   SMALLINT,
  heart_rate     SMALLINT,
  spo2           SMALLINT,
  temperature    NUMERIC(4,1),
  respiratory_rate SMALLINT,
  weight_kg      NUMERIC(5,1),
  height_cm      NUMERIC(5,1),
  bmi            NUMERIC(4,1) GENERATED ALWAYS AS (
    CASE WHEN height_cm > 0 AND weight_kg > 0
    THEN ROUND((weight_kg / POWER(height_cm / 100.0, 2))::NUMERIC, 1)
    ELSE NULL END
  ) STORED,
  notes          TEXT,
  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vitals_patient_idx ON patient_vitals(patient_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS vitals_tenant_idx ON patient_vitals(tenant_id, recorded_at DESC);
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;

-- 8. CONSULTATIONS
CREATE TABLE IF NOT EXISTS consultations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  doctor_id       UUID NOT NULL REFERENCES profiles(id),
  subjective      TEXT,
  objective       TEXT,
  assessment      TEXT,
  plan            TEXT,
  icd10_codes     TEXT[],
  is_emergency    BOOLEAN NOT NULL DEFAULT FALSE,
  follow_up_in    INTEGER,
  started_at      TIMESTAMPTZ,
  signed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- 9. MEDICATIONS & PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS medications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  generic_name    TEXT NOT NULL,
  brand_name      TEXT,
  strength        TEXT,
  form            TEXT,
  is_controlled   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(tenant_id, generic_name, strength, form)
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id),
  appointment_id  UUID REFERENCES appointments(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  prescribed_by   UUID NOT NULL REFERENCES profiles(id),
  dispensed_by    UUID REFERENCES profiles(id),
  status          rx_status NOT NULL DEFAULT 'pending',
  is_ip_order     BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  prescribed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispensed_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_id   UUID NOT NULL REFERENCES medications(id),
  dosage          TEXT NOT NULL,
  route           TEXT NOT NULL,
  frequency       TEXT NOT NULL,
  duration_days   INTEGER,
  quantity        INTEGER,
  instructions    TEXT,
  drug_interaction_flag BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;

-- 10. LAB ORDERS & TESTS
CREATE TABLE IF NOT EXISTS lab_tests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  test_code        TEXT NOT NULL,
  test_name        TEXT NOT NULL,
  sample_type      TEXT NOT NULL,
  turnaround_hrs   SMALLINT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(tenant_id, test_code)
);

CREATE TABLE IF NOT EXISTS lab_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id),
  appointment_id   UUID REFERENCES appointments(id),
  ordered_by       UUID NOT NULL REFERENCES profiles(id),
  collected_by     UUID REFERENCES profiles(id),
  resulted_by      UUID REFERENCES profiles(id),
  status           lab_order_status NOT NULL DEFAULT 'ordered',
  is_stat          BOOLEAN NOT NULL DEFAULT FALSE,
  sample_collected_at TIMESTAMPTZ,
  resulted_at      TIMESTAMPTZ,
  reported_at      TIMESTAMPTZ,
  clinical_info    TEXT,
  ordered_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id     UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  lab_test_id      UUID NOT NULL REFERENCES lab_tests(id),
  result_value     TEXT NOT NULL,
  result_unit      TEXT,
  ref_range_low    TEXT,
  ref_range_high   TEXT,
  severity         lab_severity NOT NULL DEFAULT 'normal',
  is_critical      BOOLEAN NOT NULL DEFAULT FALSE,
  critical_notified_at TIMESTAMPTZ,
  resulted_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- 11. WARDS & BEDS
CREATE TABLE IF NOT EXISTS wards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  floor       TEXT,
  capacity    SMALLINT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS beds (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  ward_id        UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  bed_number     TEXT NOT NULL,
  status         bed_status NOT NULL DEFAULT 'available',
  current_patient_id UUID REFERENCES patients(id),
  admitted_at    TIMESTAMPTZ,
  expected_discharge_at TIMESTAMPTZ,
  last_sanitized_at TIMESTAMPTZ,
  UNIQUE(tenant_id, ward_id, bed_number)
);

ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;

-- 12. PHARMACY INVENTORY & PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  medication_id   UUID NOT NULL REFERENCES medications(id),
  batch_number    TEXT,
  manufacturer    TEXT,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  reorder_level   INTEGER NOT NULL DEFAULT 0,
  unit_price      NUMERIC(10, 2),
  expiry_date     DATE,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  location        TEXT,
  UNIQUE(tenant_id, medication_id, batch_number)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  supplier_name   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'received', 'cancelled')),
  total_amount    NUMERIC(12, 2),
  ordered_by      UUID NOT NULL REFERENCES profiles(id),
  ordered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_at     TIMESTAMPTZ,
  received_at     TIMESTAMPTZ
);

ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- 13. BILLING & PAYMENTS
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  appointment_id  UUID REFERENCES appointments(id),
  invoice_number  TEXT NOT NULL,
  subtotal        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance_due     NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  payment_status  payment_status NOT NULL DEFAULT 'pending',
  due_date        DATE,
  insurance_provider TEXT,
  insurance_claim_id TEXT,
  insurance_approved_amount NUMERIC(12, 2),
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'service' CHECK (category IN ('consultation', 'lab', 'pharmacy', 'room', 'surgery', 'procedure', 'other')),
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price      NUMERIC(10, 2) NOT NULL,
  line_total      NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount          NUMERIC(12, 2) NOT NULL,
  method          TEXT NOT NULL CHECK (method IN ('cash', 'card', 'upi', 'net_banking', 'insurance', 'waiver')),
  reference_id    TEXT,
  recorded_by     UUID REFERENCES profiles(id),
  paid_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 14. CANTEEN & DIETARY
CREATE TABLE IF NOT EXISTS canteen_menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'main_course' CHECK (category IN ('breakfast', 'main_course', 'side', 'beverage', 'dessert', 'snack')),
  description     TEXT,
  price           NUMERIC(8, 2),
  is_vegetarian   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  image_url       TEXT
);

CREATE TABLE IF NOT EXISTS meal_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  bed_id          UUID REFERENCES beds(id),
  meal_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_slot       TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  dietary_flag    dietary_flag NOT NULL DEFAULT 'none',
  special_instructions TEXT,
  status          meal_status NOT NULL DEFAULT 'ordered',
  ordered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  prepared_at     TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  prepared_by     UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS meal_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_order_id   UUID NOT NULL REFERENCES meal_orders(id) ON DELETE CASCADE,
  menu_item_id    UUID NOT NULL REFERENCES canteen_menu_items(id),
  quantity        SMALLINT NOT NULL DEFAULT 1,
  customization   TEXT
);

CREATE TABLE IF NOT EXISTS canteen_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  item_name       TEXT NOT NULL,
  unit            TEXT NOT NULL,
  quantity        NUMERIC(8, 2) NOT NULL DEFAULT 0,
  reorder_level   NUMERIC(8, 2) NOT NULL DEFAULT 0,
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE canteen_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_inventory ENABLE ROW LEVEL SECURITY;

-- 15. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     UUID NOT NULL,
  user_id       UUID,
  user_role     user_role,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  description   TEXT,
  ip_address    INET,
  user_agent    TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 16. PERMISSIVE RLS POLICIES (Read & write for authenticated + anon for demo mode)
DO $$ BEGIN
  -- Clinics
  DROP POLICY IF EXISTS "allow_all_clinics" ON clinics;
  CREATE POLICY "allow_all_clinics" ON clinics FOR ALL USING (true) WITH CHECK (true);
  
  -- Settings
  DROP POLICY IF EXISTS "allow_all_settings" ON clinic_settings;
  CREATE POLICY "allow_all_settings" ON clinic_settings FOR ALL USING (true) WITH CHECK (true);

  -- Profiles
  DROP POLICY IF EXISTS "allow_all_profiles" ON profiles;
  CREATE POLICY "allow_all_profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

  -- Patients
  DROP POLICY IF EXISTS "allow_all_patients" ON patients;
  CREATE POLICY "allow_all_patients" ON patients FOR ALL USING (true) WITH CHECK (true);

  -- Appointments
  DROP POLICY IF EXISTS "allow_all_appointments" ON appointments;
  CREATE POLICY "allow_all_appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

  -- Vitals
  DROP POLICY IF EXISTS "allow_all_vitals" ON patient_vitals;
  CREATE POLICY "allow_all_vitals" ON patient_vitals FOR ALL USING (true) WITH CHECK (true);

  -- Consultations
  DROP POLICY IF EXISTS "allow_all_consultations" ON consultations;
  CREATE POLICY "allow_all_consultations" ON consultations FOR ALL USING (true) WITH CHECK (true);

  -- Medications
  DROP POLICY IF EXISTS "allow_all_medications" ON medications;
  CREATE POLICY "allow_all_medications" ON medications FOR ALL USING (true) WITH CHECK (true);

  -- Prescriptions
  DROP POLICY IF EXISTS "allow_all_prescriptions" ON prescriptions;
  CREATE POLICY "allow_all_prescriptions" ON prescriptions FOR ALL USING (true) WITH CHECK (true);

  -- Lab tests & orders & results
  DROP POLICY IF EXISTS "allow_all_lab_tests" ON lab_tests;
  CREATE POLICY "allow_all_lab_tests" ON lab_tests FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "allow_all_lab_orders" ON lab_orders;
  CREATE POLICY "allow_all_lab_orders" ON lab_orders FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "allow_all_lab_results" ON lab_results;
  CREATE POLICY "allow_all_lab_results" ON lab_results FOR ALL USING (true) WITH CHECK (true);

  -- Wards & Beds
  DROP POLICY IF EXISTS "allow_all_wards" ON wards;
  CREATE POLICY "allow_all_wards" ON wards FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "allow_all_beds" ON beds;
  CREATE POLICY "allow_all_beds" ON beds FOR ALL USING (true) WITH CHECK (true);

  -- Pharmacy inventory & purchase orders
  DROP POLICY IF EXISTS "allow_all_pharmacy_inv" ON pharmacy_inventory;
  CREATE POLICY "allow_all_pharmacy_inv" ON pharmacy_inventory FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "allow_all_purchase_orders" ON purchase_orders;
  CREATE POLICY "allow_all_purchase_orders" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);

  -- Invoices & payments
  DROP POLICY IF EXISTS "allow_all_invoices" ON invoices;
  CREATE POLICY "allow_all_invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "allow_all_invoice_items" ON invoice_items;
  CREATE POLICY "allow_all_invoice_items" ON invoice_items FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "allow_all_payments" ON payments;
  CREATE POLICY "allow_all_payments" ON payments FOR ALL USING (true) WITH CHECK (true);

  -- Canteen
  DROP POLICY IF EXISTS "allow_all_canteen_menu" ON canteen_menu_items;
  CREATE POLICY "allow_all_canteen_menu" ON canteen_menu_items FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "allow_all_meal_orders" ON meal_orders;
  CREATE POLICY "allow_all_meal_orders" ON meal_orders FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "allow_all_canteen_inv" ON canteen_inventory;
  CREATE POLICY "allow_all_canteen_inv" ON canteen_inventory FOR ALL USING (true) WITH CHECK (true);

  -- Audit logs
  DROP POLICY IF EXISTS "allow_all_audit" ON audit_logs;
  CREATE POLICY "allow_all_audit" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 17. REALTIME SETUP
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE appointments, patient_vitals, beds, lab_results, meal_orders, prescriptions;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ========================================================
-- 18. SEED DATA
-- ========================================================

-- Clinic
INSERT INTO clinics (id, name, slug, address, phone, email, plan_tier, is_active)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'St. Jude Medical Center',
  'stjude',
  '450 Medical Arts Pavilion, Metro Health District',
  '+1 (555) 019-2831',
  'admin@stjude.cliniva.os',
  'enterprise',
  TRUE
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Clinic Settings
INSERT INTO clinic_settings (clinic_id, key, value) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'module.front_desk.enabled', 'true'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'module.doctor.enabled',     'true'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'module.nursing.enabled',    'true'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'module.pharmacy.enabled',   'true'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'module.lab.enabled',        'true'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'module.billing.enabled',    'true'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'module.canteen.enabled',    'true'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'queue.max_daily_tokens',    '120'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'clinic.timezone',           '"America/New_York"'::jsonb)
ON CONFLICT (clinic_id, key) DO UPDATE SET value = EXCLUDED.value;

-- Staff Profiles
INSERT INTO profiles (id, tenant_id, role, display_name, department, employee_id, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'doctor',     'Dr. Sarah Jenkins, MD',   'Cardiology',            'STJ-DOC-01', TRUE),
  ('10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'front_desk', 'Elena Rostova',           'OPD Reception',         'STJ-REC-01', TRUE),
  ('10000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'nurse',      'Nurse Priya Sharma, RN',  'Inpatient Ward A',      'STJ-NUR-01', TRUE),
  ('10000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'pharmacist', 'Marcus Vance, PharmD',    'Central Dispensary',    'STJ-PHA-01', TRUE),
  ('10000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'lab_tech',   'David Kalu, MLS',         'Pathology & Chemistry', 'STJ-LAB-01', TRUE),
  ('10000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'cashier',    'Hannah Brooks',           'Billing & Revenue',     'STJ-BIL-01', TRUE),
  ('10000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'admin',      'Alexander Sterling',      'Executive Operations',  'STJ-ADM-01', TRUE),
  ('10000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'canteen',    'Chef Marco Rossi',        'Dietary & Nutrition',   'STJ-CAN-01', TRUE),
  ('10000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'patient',    'Marcus Delacroix',        'Outpatient Patient',    'MRN-00482910', TRUE)
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Patients
INSERT INTO patients (id, tenant_id, mrn, first_name, last_name, dob, gender, blood_group, phone, email, dietary_flag, allergies) VALUES
  ('20000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '00482910', 'Marcus', 'Delacroix', '1970-04-12', 'male',   'O+', '+1 (555) 201-9481', 'marcus.d@example.com', 'low_sodium', ARRAY['Penicillin', 'Sulfa']),
  ('20000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '00482911', 'Priya',  'Mehta',     '1983-09-24', 'female', 'B+', '+1 (555) 349-1120', 'priya.m@example.com',  'vegetarian', ARRAY['Aspirin']),
  ('20000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '00482912', 'George', 'Tanner',    '1957-11-03', 'male',   'A+', '+1 (555) 884-9021', 'george.t@example.com', 'diabetic',   ARRAY['None Known']),
  ('20000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '00482913', 'Aisha',  'Nkosi',     '1995-02-18', 'female', 'A-', '+1 (555) 441-2983', 'aisha.n@example.com',  'none',       ARRAY['Ibuprofen']),
  ('20000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', '00482914', 'David',  'Chen',      '1972-08-30', 'male',   'AB+', '+1 (555) 672-0091', 'david.c@example.com',  'diabetic',   ARRAY['Latex']),
  ('20000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', '00482915', 'Maria',  'Sanchez',   '1986-06-15', 'female', 'O-', '+1 (555) 912-3847', 'maria.s@example.com',  'none',       ARRAY['None Known']),
  ('20000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', '00482916', 'Ana',    'García',    '1965-10-09', 'female', 'O+', '+1 (555) 782-9901', 'ana.g@example.com',    'low_fat',    ARRAY['Codeine'])
ON CONFLICT (tenant_id, mrn) DO UPDATE SET first_name = EXCLUDED.first_name;

-- Appointments
INSERT INTO appointments (id, tenant_id, patient_id, doctor_id, queue_token, scheduled_at, status, chief_complaint, visit_type) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 7,  now() - interval '20 minutes', 'in_consultation', 'Chest tightness and shortness of breath', 'emergency'),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 8,  now() + interval '10 minutes', 'checked_in',      'High fever (3 days) and persistent cough',   'opd'),
  ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 9,  now() + interval '30 minutes', 'checked_in',      'Diabetes type 2 quarterly follow-up',        'follow_up'),
  ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 10, now() + interval '50 minutes', 'checked_in',      'Heart palpitations upon exertion',           'opd'),
  ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 11, now() + interval '70 minutes', 'checked_in',      'Blood pressure medication review',           'follow_up')
ON CONFLICT (id) DO NOTHING;

-- Vitals
INSERT INTO patient_vitals (tenant_id, patient_id, appointment_id, recorded_by, bp_systolic, bp_diastolic, heart_rate, spo2, temperature, respiratory_rate, weight_kg, height_cm) VALUES
  ('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 128, 82, 74, 98, 98.4, 16, 78.5, 178),
  ('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 118, 76, 88, 97, 101.8, 20, 62.0, 162),
  ('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 136, 88, 70, 96, 98.6, 15, 89.2, 175);

-- Wards & Beds
INSERT INTO wards (id, tenant_id, name, floor) VALUES
  ('30000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Ward A — Acute Medical Care', 'Floor 3'),
  ('30000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Ward B — Post-Op Surgical',  'Floor 4')
ON CONFLICT (id) DO NOTHING;

INSERT INTO beds (tenant_id, ward_id, bed_number, status, current_patient_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'A-01', 'occupied',    '20000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'A-02', 'occupied',    '20000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'A-03', 'available',   NULL),
  ('c0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'A-04', 'occupied',    '20000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'A-05', 'maintenance', NULL),
  ('c0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'A-06', 'occupied',    '20000000-0000-0000-0000-000000000004'),
  ('c0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'B-01', 'available',   NULL),
  ('c0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'B-02', 'occupied',    '20000000-0000-0000-0000-000000000005')
ON CONFLICT (tenant_id, ward_id, bed_number) DO NOTHING;

-- Medications & Formulary
INSERT INTO medications (id, tenant_id, generic_name, brand_name, strength, form) VALUES
  ('40000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Amoxicillin', 'Amoxil', '500mg', 'capsule'),
  ('40000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Lisinopril', 'Prinivil', '10mg', 'tablet'),
  ('40000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Metformin HCl', 'Glucophage', '500mg', 'tablet'),
  ('40000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Atorvastatin Calcium', 'Lipitor', '20mg', 'tablet'),
  ('40000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Albuterol Sulfate', 'Ventolin', '90mcg', 'inhaler')
ON CONFLICT (tenant_id, generic_name, strength, form) DO NOTHING;

-- Pharmacy Inventory
INSERT INTO pharmacy_inventory (tenant_id, medication_id, batch_number, manufacturer, quantity_in_stock, reorder_level, unit_price, expiry_date) VALUES
  ('c0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'BAT-AMX-2026A', 'Pfizer', 420, 100, 14.50, '2027-04-30'),
  ('c0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'BAT-LIS-9912',  'Merck',  840, 150,  8.25, '2027-08-15'),
  ('c0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'BAT-MET-4410',  'Novartis',610, 200,  6.50, '2026-11-20'),
  ('c0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 'BAT-ATO-1124',  'AstraZeneca',18, 50, 18.00, '2026-12-01')
ON CONFLICT (tenant_id, medication_id, batch_number) DO NOTHING;

-- Lab Tests & Orders
INSERT INTO lab_tests (id, tenant_id, test_code, test_name, sample_type, turnaround_hrs) VALUES
  ('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'POTASS', 'Serum Potassium', 'Blood', 2),
  ('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'TROP-I', 'Troponin I (High Sensitivity)', 'Blood', 1),
  ('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'HBA1C',  'Glycated Hemoglobin (HbA1c)', 'Blood', 4)
ON CONFLICT (tenant_id, test_code) DO NOTHING;

INSERT INTO lab_orders (id, tenant_id, patient_id, ordered_by, status, is_stat, clinical_info) VALUES
  ('60000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'resulted', TRUE,  'Suspected hyperkalemia'),
  ('60000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'resulted', TRUE,  'Severe acute chest pain')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab_results (id, lab_order_id, lab_test_id, result_value, result_unit, ref_range_low, ref_range_high, severity, is_critical) VALUES
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '6.2', 'mEq/L', '3.5', '5.0', 'critical_high', TRUE),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '0.08', 'ng/mL', '0.00', '0.04', 'critical_high', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Canteen Menu & Orders
INSERT INTO canteen_menu_items (id, tenant_id, name, category, description, price, is_vegetarian) VALUES
  ('80000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Steamed Salmon & Quinoa Bowl', 'main_course', 'Low-sodium heart healthy meal', 14.00, FALSE),
  ('80000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Low-Sodium Vegetable Medley', 'main_course', 'Fresh steamed organic vegetables', 10.50, TRUE),
  ('80000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Clear Herbal Chicken Broth',  'breakfast',   'Gentle post-op hydration soup', 8.50, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO meal_orders (tenant_id, patient_id, meal_slot, dietary_flag, status, special_instructions) VALUES
  ('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'lunch', 'low_sodium', 'preparing', 'Strict low-sodium per Cardiology order'),
  ('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'lunch', 'diabetic',   'ordered',   'Diabetic diet, no refined sugars');
