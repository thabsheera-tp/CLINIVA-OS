-- Cliniva OS — Master Database Seed (seed.sql)
-- Multi-tenant clinic with full relational dataset across all 15 migrations.

-- 1. Default Tenant (St. Jude Medical Center)
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

-- 2. Clinic Settings & Active Modules
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

-- 3. Staff & Role Profiles
-- (Note: in local dev without real auth.users foreign key constraints, we ensure profiles are accessible)
INSERT INTO profiles (id, tenant_id, role, display_name, department, employee_id, is_active) VALUES
  ('u0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'doctor',     'Dr. Sarah Jenkins, MD',   'Cardiology',            'STJ-DOC-01', TRUE),
  ('u0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'front_desk', 'Elena Rostova',           'OPD Reception',         'STJ-REC-01', TRUE),
  ('u0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'nurse',      'Nurse Priya Sharma, RN',  'Inpatient Ward A',      'STJ-NUR-01', TRUE),
  ('u0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'pharmacist', 'Marcus Vance, PharmD',    'Central Dispensary',    'STJ-PHA-01', TRUE),
  ('u0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'lab_tech',   'David Kalu, MLS',         'Pathology & Chemistry', 'STJ-LAB-01', TRUE),
  ('u0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'cashier',    'Hannah Brooks',           'Billing & Revenue',     'STJ-BIL-01', TRUE),
  ('u0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'admin',      'Alexander Sterling',      'Executive Operations',  'STJ-ADM-01', TRUE),
  ('u0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'canteen',    'Chef Marco Rossi',        'Dietary & Nutrition',   'STJ-CAN-01', TRUE),
  ('u0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'patient',    'Marcus Delacroix',        'Outpatient Patient',    'MRN-00482910', TRUE)
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- 4. Patients Registry
INSERT INTO patients (id, tenant_id, mrn, first_name, last_name, dob, gender, blood_group, phone, email, dietary_flag, allergies) VALUES
  ('p0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '00482910', 'Marcus', 'Delacroix', '1970-04-12', 'male',   'O+', '+1 (555) 201-9481', 'marcus.d@example.com', 'low_sodium', ARRAY['Penicillin', 'Sulfa']),
  ('p0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '00482911', 'Priya',  'Mehta',     '1983-09-24', 'female', 'B+', '+1 (555) 349-1120', 'priya.m@example.com',  'vegetarian', ARRAY['Aspirin']),
  ('p0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '00482912', 'George', 'Tanner',    '1957-11-03', 'male',   'A+', '+1 (555) 884-9021', 'george.t@example.com', 'diabetic',   ARRAY['None Known']),
  ('p0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '00482913', 'Aisha',  'Nkosi',     '1995-02-18', 'female', 'A-', '+1 (555) 441-2983', 'aisha.n@example.com',  'none',       ARRAY['Ibuprofen']),
  ('p0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', '00482914', 'David',  'Chen',      '1972-08-30', 'male',   'AB+', '+1 (555) 672-0091', 'david.c@example.com',  'diabetic',   ARRAY['Latex']),
  ('p0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', '00482915', 'Maria',  'Sanchez',   '1986-06-15', 'female', 'O-', '+1 (555) 912-3847', 'maria.s@example.com',  'none',       ARRAY['None Known']),
  ('p0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', '00482916', 'Ana',    'García',    '1965-10-09', 'female', 'O+', '+1 (555) 782-9901', 'ana.g@example.com',    'low_fat',    ARRAY['Codeine'])
ON CONFLICT (tenant_id, mrn) DO UPDATE SET first_name = EXCLUDED.first_name;

-- 5. Appointments & OPD Queue Tokens
INSERT INTO appointments (id, tenant_id, patient_id, doctor_id, queue_token, scheduled_at, status, chief_complaint, visit_type) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000001', 7,  now() - interval '20 minutes', 'in_consultation', 'Chest tightness and shortness of breath', 'emergency'),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000001', 8,  now() + interval '10 minutes', 'checked_in',      'High fever (3 days) and persistent cough',   'opd'),
  ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000001', 9,  now() + interval '30 minutes', 'checked_in',      'Diabetes type 2 quarterly follow-up',        'follow_up'),
  ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000001', 10, now() + interval '50 minutes', 'checked_in',      'Heart palpitations upon exertion',           'opd'),
  ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000001', 11, now() + interval '70 minutes', 'checked_in',      'Blood pressure medication review',           'follow_up')
ON CONFLICT (id) DO NOTHING;

-- 6. Live Vitals Telemetry
INSERT INTO patient_vitals (tenant_id, patient_id, appointment_id, recorded_by, bp_systolic, bp_diastolic, heart_rate, spo2, temperature, respiratory_rate, weight_kg, height_cm) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000003', 128, 82, 74, 98, 98.4, 16, 78.5, 178),
  ('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000003', 118, 76, 88, 97, 101.8, 20, 62.0, 162),
  ('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000003', 136, 88, 70, 96, 98.6, 15, 89.2, 175);

-- 7. Wards & Beds Board
INSERT INTO wards (id, tenant_id, name, floor) VALUES
  ('w0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Ward A — Acute Medical Care', 'Floor 3'),
  ('w0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Ward B — Post-Op Surgical',  'Floor 4')
ON CONFLICT (id) DO NOTHING;

INSERT INTO beds (tenant_id, ward_id, bed_number, status, current_patient_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'A-01', 'occupied',    'p0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'A-02', 'occupied',    'p0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'A-03', 'available',   NULL),
  ('c0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'A-04', 'occupied',    'p0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'A-05', 'maintenance', NULL),
  ('c0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 'A-06', 'occupied',    'p0000000-0000-0000-0000-000000000004'),
  ('c0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000002', 'B-01', 'available',   NULL),
  ('c0000000-0000-0000-0000-000000000002', 'w0000000-0000-0000-0000-000000000002', 'B-02', 'occupied',    'p0000000-0000-0000-0000-000000000005');

-- 8. Pharmacy Medication Catalog & Inventory
INSERT INTO pharmacy_inventory (tenant_id, medication_name, generic_name, batch_number, stock_quantity, reorder_threshold, unit_price, expiry_date) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Amoxicillin 500mg',    'Amoxicillin Trihydrate', 'BAT-AMX-2026A', 420, 100, 14.50,  '2027-04-30'),
  ('c0000000-0000-0000-0000-000000000001', 'Lisinopril 10mg',       'Lisinopril',             'BAT-LIS-9912',  840, 150,  8.25,  '2027-08-15'),
  ('c0000000-0000-0000-0000-000000000001', 'Metformin 500mg',      'Metformin HCl',          'BAT-MET-4410',  610, 200,  6.50,  '2026-11-20'),
  ('c0000000-0000-0000-0000-000000000001', 'Atorvastatin 20mg',    'Atorvastatin Calcium',   'BAT-ATO-1124',  18,  50,  18.00,  '2026-12-01'), -- low stock
  ('c0000000-0000-0000-0000-000000000001', 'Albuterol Sulfate HFA', 'Albuterol Inhaler',      'BAT-ALB-0082',  95,  30,  32.00,  '2027-01-10');

-- 9. Diagnostic Lab Orders & Critical Alerts
INSERT INTO lab_orders (tenant_id, patient_id, doctor_id, test_name, category, status, result_value, reference_range, is_critical) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000001', 'Serum Potassium', 'Biochemistry', 'resulted', '6.2 mEq/L',  '3.5 – 5.0 mEq/L', TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000001', 'Troponin I',      'Cardiac Panel','resulted', '0.08 ng/mL', '< 0.04 ng/mL',    TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000007', 'u0000000-0000-0000-0000-000000000001', 'HbA1c',           'Biochemistry', 'resulted', '8.4%',       '< 7.0%',          FALSE);

-- 10. Canteen Dietary Menu & Delivery Queue
INSERT INTO canteen_menu_items (tenant_id, name, meal_type, dietary_flag, price, is_available) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Steamed Salmon & Quinoa Bowl', 'lunch',  'diabetic',    14.00, TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Low-Sodium Vegetable Medley',   'dinner', 'low_sodium',  10.50, TRUE),
  ('c0000000-0000-0000-0000-000000000001', 'Clear Herbal Chicken Broth',    'dinner', 'soft_diet',    8.50, TRUE);

INSERT INTO canteen_meal_orders (tenant_id, patient_id, bed_id, meal_slot, status, special_instructions) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'lunch', 'preparing', 'Strict low-sodium per Cardiology order'),
  ('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'lunch', 'ordered',   'Diabetic diet, no refined sugars');
