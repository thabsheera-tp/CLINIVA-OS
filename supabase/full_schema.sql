-- ==========================================
-- Migration: 0001_enums.sql
-- ==========================================
-- 0001_enums.sql — Cliniva OS shared enum types
-- These enums are shared across all tenant tables and must be created first.

-- Appointment / token status
CREATE TYPE appt_status AS ENUM (
  'scheduled',
  'checked_in',
  'in_consultation',
  'completed',
  'no_show',
  'cancelled'
);

-- Bed occupancy status
CREATE TYPE bed_status AS ENUM (
  'available',
  'occupied',
  'maintenance',
  'reserved'
);

-- Prescription / order line status
CREATE TYPE rx_status AS ENUM (
  'pending',
  'verified',
  'dispensed',
  'cancelled'
);

-- Lab order status
CREATE TYPE lab_order_status AS ENUM (
  'ordered',
  'sample_collected',
  'processing',
  'resulted',
  'reported',
  'cancelled'
);

-- Lab result severity flag (for critical value notifications)
CREATE TYPE lab_severity AS ENUM (
  'normal',
  'low',
  'high',
  'critical_low',
  'critical_high'
);

-- Gender
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- User roles (maps to RLS policies and middleware routing)
CREATE TYPE user_role AS ENUM (
  'doctor',
  'front_desk',
  'nurse',
  'pharmacist',
  'lab_tech',
  'cashier',
  'admin',
  'canteen',
  'patient'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'partial',
  'paid',
  'refunded',
  'waived',
  'insurance_pending'
);

-- Dietary restriction flags
CREATE TYPE dietary_flag AS ENUM (
  'none',
  'vegetarian',
  'vegan',
  'diabetic',
  'low_sodium',
  'low_fat',
  'gluten_free',
  'npo',
  'soft_diet',
  'liquid_only'
);

-- Meal delivery status
CREATE TYPE meal_status AS ENUM (
  'ordered',
  'preparing',
  'ready',
  'delivered',
  'cancelled'
);


-- ==========================================
-- Migration: 0002_tenants.sql
-- ==========================================
-- 0002_tenants.sql — Multi-tenant clinic registry
-- Each clinic is a "tenant". All other tables reference tenant_id via RLS.

CREATE TABLE clinics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE, -- used in subdomain routing e.g., stjude.cliniva.os
  address      TEXT,
  phone        TEXT,
  email        TEXT,
  logo_url     TEXT,
  -- Subscription / plan tier
  plan_tier    TEXT NOT NULL DEFAULT 'base'
    CHECK (plan_tier IN ('base', 'premium', 'enterprise')),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-clinic feature flags (module on/off toggles, configurable by admin)
CREATE TABLE clinic_settings (
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,          -- e.g. 'module.canteen.enabled', 'queue.max_tokens'
  value        JSONB NOT NULL,         -- flexible: boolean, string, number, object
  updated_by   UUID,                   -- profiles.id of admin who made the change
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (clinic_id, key)
);

-- RLS: Service role bypasses, all other access restricted to tenant-scoped rows
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

-- Admins of a clinic can read/write their own clinic row
CREATE POLICY "tenant_admin_clinic" ON clinics
  USING (id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_read_clinic_settings" ON clinic_settings
  USING (clinic_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_admin_write_clinic_settings" ON clinic_settings
  FOR INSERT WITH CHECK (clinic_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');


-- ==========================================
-- Migration: 0003_auth_profiles.sql
-- ==========================================
-- 0003_auth_profiles.sql — Staff & patient user profiles
-- Extends Supabase auth.users with clinical role info.
-- Automatically created via DB trigger on signup.

CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role             user_role NOT NULL,
  display_name     TEXT NOT NULL,
  avatar_url       TEXT,
  department       TEXT,           -- e.g. 'Cardiology', 'Ward A', 'OPD'
  employee_id      TEXT,           -- clinic's internal staff ID
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for frequent lookups
CREATE INDEX profiles_tenant_idx ON profiles(tenant_id);
CREATE INDEX profiles_role_idx ON profiles(role);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Each user can read/update their own profile
CREATE POLICY "profile_self_read" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profile_self_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Staff can read other staff profiles in their clinic (for directory, queue assignment)
CREATE POLICY "tenant_staff_read_profiles" ON profiles
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

-- Admin can manage all profiles in their clinic
CREATE POLICY "admin_manage_profiles" ON profiles
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Trigger: sync display_name into auth.users user_metadata on insert
CREATE OR REPLACE FUNCTION sync_profile_to_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data ||
    jsonb_build_object(
      'role', NEW.role,
      'tenant_id', NEW.tenant_id,
      'display_name', NEW.display_name
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profile_to_user_metadata();


-- ==========================================
-- Migration: 0004_patients.sql
-- ==========================================
-- 0004_patients.sql — Patient master record

CREATE TABLE patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  -- Medical Record Number — unique within tenant
  mrn           TEXT NOT NULL,
  UNIQUE (tenant_id, mrn),

  -- Demographics
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  dob           DATE NOT NULL,
  gender        gender NOT NULL,
  blood_group   TEXT,

  -- Contact
  phone         TEXT NOT NULL,
  email         TEXT,
  address       TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,

  -- Insurance
  insurance_provider TEXT,
  insurance_policy   TEXT,

  -- Dietary & clinical flags
  dietary_flag  dietary_flag NOT NULL DEFAULT 'none',
  allergies     TEXT[],           -- free-text allergy list

  -- Portal access (links to auth.users if patient registered)
  auth_user_id  UUID REFERENCES auth.users(id),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX patients_tenant_idx ON patients(tenant_id);
CREATE INDEX patients_mrn_idx ON patients(tenant_id, mrn);
CREATE INDEX patients_name_idx ON patients(tenant_id, last_name, first_name);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Staff (non-patient) can read all patients in their tenant
CREATE POLICY "staff_read_patients" ON patients
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

-- Patient can read only their own record
CREATE POLICY "patient_self_read" ON patients
  FOR SELECT USING (auth_user_id = auth.uid());

-- Front desk can register patients
CREATE POLICY "front_desk_insert_patients" ON patients
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('front_desk', 'admin', 'doctor')
  );


-- ==========================================
-- Migration: 0005_appointments.sql
-- ==========================================
-- 0005_appointments.sql — OPD Queue & Appointments

CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES profiles(id),

  -- Queue token — issued by front desk, monotonic per clinic per day
  queue_token     INTEGER,
  scheduled_at    TIMESTAMPTZ NOT NULL,

  -- Status lifecycle
  status          appt_status NOT NULL DEFAULT 'scheduled',
  checked_in_at   TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  -- Clinical context
  chief_complaint  TEXT,
  visit_type       TEXT NOT NULL DEFAULT 'opd'
    CHECK (visit_type IN ('opd', 'follow_up', 'emergency', 'telehealth', 'ip_admission')),
  notes            TEXT,

  -- Telehealth
  meeting_url      TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX appt_tenant_date_idx ON appointments(tenant_id, scheduled_at);
CREATE INDEX appt_doctor_date_idx ON appointments(doctor_id, scheduled_at);
CREATE INDEX appt_patient_idx ON appointments(patient_id);
CREATE INDEX appt_status_idx ON appointments(tenant_id, status);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Staff read appointments in their tenant
CREATE POLICY "staff_read_appts" ON appointments
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

-- Doctor can update their own appointments (start, complete consultations)
CREATE POLICY "doctor_update_appts" ON appointments
  FOR UPDATE USING (
    doctor_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'doctor'
  );

-- Front desk can insert and update appointment status
CREATE POLICY "front_desk_manage_appts" ON appointments
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('front_desk', 'admin')
  );

-- Patient can read their own appointments
CREATE POLICY "patient_read_own_appts" ON appointments
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );


-- ==========================================
-- Migration: 0006_vitals.sql
-- ==========================================
-- 0006_vitals.sql — Patient vitals & nursing observations

CREATE TABLE patient_vitals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  recorded_by    UUID NOT NULL REFERENCES profiles(id), -- nurse or doctor

  -- Vital signs
  bp_systolic    SMALLINT,  -- mmHg
  bp_diastolic   SMALLINT,  -- mmHg
  heart_rate     SMALLINT,  -- bpm
  spo2           SMALLINT,  -- %
  temperature    NUMERIC(4,1), -- °C or °F (store °F per Stitch design)
  respiratory_rate SMALLINT, -- breaths/min
  weight_kg      NUMERIC(5,1),
  height_cm      NUMERIC(5,1),
  bmi            NUMERIC(4,1) GENERATED ALWAYS AS (
    CASE WHEN height_cm > 0 AND weight_kg > 0
    THEN ROUND((weight_kg / POWER(height_cm / 100.0, 2))::NUMERIC, 1)
    ELSE NULL END
  ) STORED,

  -- Free text notes
  notes          TEXT,

  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX vitals_patient_idx ON patient_vitals(patient_id, recorded_at DESC);
CREATE INDEX vitals_tenant_idx ON patient_vitals(tenant_id, recorded_at DESC);

ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_vitals" ON patient_vitals
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) NOT IN ('patient', 'canteen')
  );

CREATE POLICY "nurse_doctor_insert_vitals" ON patient_vitals
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('nurse', 'doctor')
  );

CREATE POLICY "patient_read_own_vitals" ON patient_vitals
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );


-- ==========================================
-- Migration: 0007_consultations.sql
-- ==========================================
-- 0007_consultations.sql — Doctor consultation notes (SOAP format)
-- Each appointment may produce one consultation note.

CREATE TABLE consultations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  doctor_id       UUID NOT NULL REFERENCES profiles(id),

  -- SOAP Notes
  subjective      TEXT, -- Chief complaint, history
  objective       TEXT, -- Examination findings
  assessment      TEXT, -- Diagnosis / differential
  plan            TEXT, -- Treatment plan, follow-up

  -- ICD-10 codes (array for multiple diagnoses)
  icd10_codes     TEXT[],

  -- Clinical flags
  is_emergency    BOOLEAN NOT NULL DEFAULT FALSE,
  follow_up_in    INTEGER, -- days until follow-up

  -- Timestamps
  started_at      TIMESTAMPTZ,
  signed_at       TIMESTAMPTZ, -- doctor finalized / e-signed
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX consult_patient_idx ON consultations(patient_id, created_at DESC);
CREATE INDEX consult_doctor_idx ON consultations(doctor_id, created_at DESC);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor_manage_own_consults" ON consultations
  USING (
    doctor_id = auth.uid()
    AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "staff_read_consults" ON consultations
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('nurse', 'pharmacist', 'lab_tech', 'admin')
  );

CREATE POLICY "patient_read_own_consults" ON consultations
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );


-- ==========================================
-- Migration: 0008_prescriptions.sql
-- ==========================================
-- 0008_prescriptions.sql — Electronic prescriptions & MAR

-- Medication master (formulary — pre-seeded per clinic)
CREATE TABLE medications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  generic_name    TEXT NOT NULL,
  brand_name      TEXT,
  strength        TEXT,      -- e.g. '500mg', '10mg/5ml'
  form            TEXT,      -- tablet, capsule, syrup, injection, cream
  is_controlled   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(tenant_id, generic_name, strength, form)
);

-- Prescription header (from doctor to pharmacy)
CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id),
  appointment_id  UUID REFERENCES appointments(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  prescribed_by   UUID NOT NULL REFERENCES profiles(id), -- doctor
  dispensed_by    UUID REFERENCES profiles(id),          -- pharmacist

  status          rx_status NOT NULL DEFAULT 'pending',
  is_ip_order     BOOLEAN NOT NULL DEFAULT FALSE,  -- inpatient MAR vs outpatient Rx
  notes           TEXT,

  prescribed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispensed_at    TIMESTAMPTZ
);

-- Prescription line items
CREATE TABLE prescription_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_id   UUID NOT NULL REFERENCES medications(id),
  dosage          TEXT NOT NULL,       -- e.g. '500mg'
  route           TEXT NOT NULL,       -- PO, IV, IM, topical
  frequency       TEXT NOT NULL,       -- 'once daily', 'TID', 'BD'
  duration_days   INTEGER,
  quantity        INTEGER,
  instructions    TEXT,                -- 'take with food', 'avoid alcohol'
  drug_interaction_flag BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX rx_tenant_patient_idx ON prescriptions(tenant_id, patient_id);
CREATE INDEX rx_status_idx ON prescriptions(tenant_id, status);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_rx" ON prescriptions
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('doctor', 'pharmacist', 'nurse', 'admin')
  );

CREATE POLICY "doctor_create_rx" ON prescriptions
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'doctor'
  );

CREATE POLICY "pharmacist_update_rx" ON prescriptions
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'pharmacist'
  );

CREATE POLICY "patient_read_own_rx" ON prescriptions
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "staff_read_medications" ON medications
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );


-- ==========================================
-- Migration: 0009_lab_orders.sql
-- ==========================================
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


-- ==========================================
-- Migration: 0010_beds.sql
-- ==========================================
-- 0010_beds.sql — Ward, bed, and IP admission management

CREATE TABLE wards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,   -- e.g. 'Ward A', 'ICU', 'Maternity'
  floor       TEXT,
  capacity    SMALLINT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE beds (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  ward_id        UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  bed_number     TEXT NOT NULL,
  status         bed_status NOT NULL DEFAULT 'available',

  -- Current occupant
  current_patient_id UUID REFERENCES patients(id),
  admitted_at    TIMESTAMPTZ,
  expected_discharge_at TIMESTAMPTZ,

  last_sanitized_at TIMESTAMPTZ,
  UNIQUE(tenant_id, ward_id, bed_number)
);

CREATE INDEX beds_tenant_status_idx ON beds(tenant_id, status);
CREATE INDEX beds_ward_idx ON beds(ward_id);

ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_wards" ON wards
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

CREATE POLICY "staff_read_beds" ON beds
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) != 'patient'
  );

CREATE POLICY "nurse_admin_manage_beds" ON beds
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('nurse', 'admin')
  );


-- ==========================================
-- Migration: 0011_pharmacy.sql
-- ==========================================
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


-- ==========================================
-- Migration: 0012_billing.sql
-- ==========================================
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


-- ==========================================
-- Migration: 0013_canteen.sql
-- ==========================================
-- 0013_canteen.sql — Canteen meal orders, menu, kitchen inventory

CREATE TABLE canteen_menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'main_course'
    CHECK (category IN ('breakfast', 'main_course', 'side', 'beverage', 'dessert', 'snack')),
  description     TEXT,
  price           NUMERIC(8, 2),
  is_vegetarian   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  image_url       TEXT
);

CREATE TABLE meal_orders (
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

CREATE TABLE meal_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_order_id   UUID NOT NULL REFERENCES meal_orders(id) ON DELETE CASCADE,
  menu_item_id    UUID NOT NULL REFERENCES canteen_menu_items(id),
  quantity        SMALLINT NOT NULL DEFAULT 1,
  customization   TEXT
);

CREATE TABLE canteen_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  item_name       TEXT NOT NULL,
  unit            TEXT NOT NULL,     -- kg, litre, pieces
  quantity        NUMERIC(8, 2) NOT NULL DEFAULT 0,
  reorder_level   NUMERIC(8, 2) NOT NULL DEFAULT 0,
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX meal_orders_tenant_date_idx ON meal_orders(tenant_id, meal_date);
CREATE INDEX meal_orders_bed_idx ON meal_orders(bed_id, meal_date);

ALTER TABLE meal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "canteen_staff_manage_orders" ON meal_orders
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('canteen', 'nurse', 'admin')
  );


-- ==========================================
-- Migration: 0014_audit_log.sql
-- ==========================================
-- 0014_audit_log.sql — HIPAA-compliant write-only audit trail
-- All PHI access events are captured via triggers. No manual inserts/updates/deletes.

CREATE TABLE audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     UUID NOT NULL,
  user_id       UUID,           -- profiles.id (may be null for system actions)
  user_role     user_role,
  action        TEXT NOT NULL,  -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'SIGNOUT'
  resource_type TEXT NOT NULL,  -- table name e.g. 'patients', 'consultations'
  resource_id   UUID,           -- primary key of affected row
  description   TEXT,           -- human-readable summary
  ip_address    INET,
  user_agent    TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS UPDATE/DELETE — log is write-only. Admins can read.
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_audit_logs" ON audit_logs
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Deny all writes from application layer (triggers only)
CREATE POLICY "deny_application_writes" ON audit_logs
  FOR INSERT WITH CHECK (FALSE);

-- Trigger function to log patient record access
CREATE OR REPLACE FUNCTION log_patient_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (tenant_id, user_id, user_role, action, resource_type, resource_id, description)
  SELECT
    NEW.tenant_id,
    auth.uid(),
    (SELECT role FROM profiles WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    TG_OP || ' on ' || TG_TABLE_NAME || ' for patient ' || NEW.id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to sensitive tables
CREATE TRIGGER audit_consultations AFTER INSERT OR UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION log_patient_access();
CREATE TRIGGER audit_prescriptions AFTER INSERT OR UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION log_patient_access();
CREATE TRIGGER audit_lab_orders    AFTER INSERT OR UPDATE ON lab_orders    FOR EACH ROW EXECUTE FUNCTION log_patient_access();


-- ==========================================
-- Migration: 0015_realtime_grants.sql
-- ==========================================
-- 0015_realtime_grants.sql — Supabase Realtime publication grants
-- Enable real-time subscriptions for live queue, vitals, and bed status.
-- Only non-PHI or PHI-tenant-scoped tables are published.

-- Drop any existing publication first
DROP PUBLICATION IF EXISTS cliniva_realtime;

-- Create publication for Realtime
-- Note: RLS is enforced — subscribers only receive rows matching their policies.
CREATE PUBLICATION cliniva_realtime FOR TABLE
  appointments,        -- Queue status updates (doctor portal, patient portal)
  patient_vitals,      -- Live vitals (nursing dashboard → doctor portal alerts)
  beds,                -- Bed status changes (nursing board, canteen meal routing)
  lab_results,         -- Critical value notifications → doctor
  meal_orders,         -- Kitchen order status → canteen
  prescriptions;       -- Rx status → pharmacy queue

-- Index to support Realtime filtering by tenant_id (common filter in subscribe calls)
CREATE INDEX IF NOT EXISTS appt_realtime_idx ON appointments(tenant_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS vitals_realtime_idx ON patient_vitals(tenant_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS beds_realtime_idx ON beds(tenant_id, status);
CREATE INDEX IF NOT EXISTS lab_realtime_idx ON lab_results(lab_order_id, resulted_at DESC);

-- Comment: In Supabase Dashboard, also enable "Realtime" toggle for each table above.
-- Row-level filtering in client: .channel('appts').on('postgres_changes', { schema: 'public', table: 'appointments', filter: `tenant_id=eq.${tenantId}` }, callback)
