import { normalizePhone } from './session'

export interface PortalDemoPatient {
  id: string
  mrn: string
  first_name: string
  last_name: string
  dob: string
  gender: string
  blood_group: string
  phone: string
  email: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  insurance_provider: string
  insurance_policy: string
  allergies: string[]
  dietary_flag: string
  appointments: any[]
  consultations: any[]
  prescriptions: any[]
  labOrders: any[]
  invoices: any[]
  vitals: any[]
}

export const PORTAL_DEMO_PATIENTS: PortalDemoPatient[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    mrn: '00482910',
    first_name: 'Marcus',
    last_name: 'Delacroix',
    dob: '1970-04-12',
    gender: 'male',
    blood_group: 'O+',
    phone: '+1 (555) 201-9481',
    email: 'marcus.delacroix@example.com',
    address: '124 Elm Street, Metro Health Dist',
    emergency_contact_name: 'Elena Delacroix',
    emergency_contact_phone: '+1 (555) 201-9482',
    insurance_provider: 'BlueCross BlueShield',
    insurance_policy: 'BCBS-884920-A',
    allergies: ['Penicillin (Sulfa)'],
    dietary_flag: 'low_sodium',
    appointments: [
      {
        id: 'apt-001',
        scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: 'confirmed',
        type: 'Cardiology Follow-up',
        location: 'Room 304 - Cardiology Wing',
        reason: 'Post-discharge Troponin check and ACE inhibitor adjustment',
        doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
          department: 'Cardiology',
        },
      },
      {
        id: 'apt-002',
        scheduled_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        status: 'completed',
        type: 'Emergency Consultation',
        location: 'Emergency Department Bay 3',
        reason: 'Acute chest tightness & shortness of breath',
        doctor: {
          display_name: 'Dr. Alan Bradley, MD',
          department: 'Emergency Medicine',
        },
      },
    ],
    consultations: [
      {
        id: 'con-001',
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        chief_complaint: 'Substernal chest tightness with radiation to left arm',
        diagnosis: 'Hypertensive Emergency with transient cardiac strain',
        clinical_notes:
          'Patient presented with acute hypertension (180/105) and chest tightness. Troponin I mildly elevated at 0.08 ng/mL. Initiated Lisinopril and Atorvastatin. Advised strict low-sodium diet and stress reduction.',
        plan: 'Recheck cardiac enzymes in 14 days. Daily BP charting.',
        doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
          department: 'Cardiology',
        },
      },
    ],
    prescriptions: [
      {
        id: 'rx-001',
        prescribed_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        status: 'active',
        notes: 'Take daily with water after morning meal. Do not skip doses.',
        prescribed_by_doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
        },
        items: [
          {
            id: 'rxi-001',
            dosage: '10mg',
            route: 'Oral (PO)',
            frequency: 'Once Daily (QAM)',
            duration_days: 30,
            instructions: 'Take 1 tablet every morning',
            medication: {
              generic_name: 'Lisinopril',
              brand_name: 'Prinivil',
              form: 'Tablet',
            },
          },
          {
            id: 'rxi-002',
            dosage: '40mg',
            route: 'Oral (PO)',
            frequency: 'Once Daily at Bedtime (QHS)',
            duration_days: 30,
            instructions: 'Take 1 tablet before sleeping',
            medication: {
              generic_name: 'Atorvastatin',
              brand_name: 'Lipitor',
              form: 'Tablet',
            },
          },
        ],
      },
    ],
    labOrders: [
      {
        id: 'lo-001',
        ordered_at: new Date(Date.now() - 86400000 * 6).toISOString(),
        status: 'completed',
        is_stat: true,
        clinical_info: 'Rule out Acute Coronary Syndrome',
        ordered_by_doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
        },
        results: [
          {
            id: 'res-001',
            result_value: '0.08',
            result_unit: 'ng/mL',
            ref_range_low: '0.00',
            ref_range_high: '0.04',
            severity: 'critical',
            is_critical: true,
            test: {
              test_code: 'TROP-I',
              test_name: 'Cardiac Troponin I (STAT)',
              sample_type: 'Plasma',
            },
          },
          {
            id: 'res-002',
            result_value: '138',
            result_unit: 'pg/mL',
            ref_range_low: '0',
            ref_range_high: '100',
            severity: 'abnormal',
            is_critical: false,
            test: {
              test_code: 'BNP',
              test_name: 'B-Type Natriuretic Peptide',
              sample_type: 'Blood',
            },
          },
        ],
      },
    ],
    invoices: [
      {
        id: 'inv-001',
        invoice_number: 'INV-2026-0914',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        total_amount: 1420.0,
        paid_amount: 1420.0,
        balance_due: 0.0,
        payment_status: 'paid',
        due_date: new Date(Date.now() + 86400000 * 20).toISOString(),
        insurance_provider: 'BlueCross BlueShield (Claim Settled)',
      },
    ],
    vitals: [
      {
        id: 'vit-001',
        recorded_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        bp_systolic: 128,
        bp_diastolic: 82,
        heart_rate: 76,
        spo2: 98,
        temperature: 98.4,
      },
      {
        id: 'vit-002',
        recorded_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        bp_systolic: 180,
        bp_diastolic: 105,
        heart_rate: 98,
        spo2: 97,
        temperature: 98.8,
      },
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    mrn: '00482911',
    first_name: 'Priya',
    last_name: 'Mehta',
    dob: '1983-09-24',
    gender: 'female',
    blood_group: 'B+',
    phone: '+1 (555) 349-1120',
    email: 'priya.mehta@example.com',
    address: '88 Riverbed Way, North Hills',
    emergency_contact_name: 'Rohan Mehta',
    emergency_contact_phone: '+1 (555) 349-1121',
    insurance_provider: 'UnitedHealthcare',
    insurance_policy: 'UHC-992144-C',
    allergies: ['Aspirin'],
    dietary_flag: 'vegetarian',
    appointments: [
      {
        id: 'apt-003',
        scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'confirmed',
        type: 'Pulmonary Re-evaluation',
        location: 'Room 210 - Respiratory Clinic',
        reason: 'Follow-up for bilateral pneumonia recovery',
        doctor: {
          display_name: 'Dr. Alan Bradley, MD',
          department: 'Pulmonology',
        },
      },
    ],
    consultations: [
      {
        id: 'con-002',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        chief_complaint: 'High fever, chills and productive cough for 4 days',
        diagnosis: 'Community-Acquired Bilateral Pneumonia',
        clinical_notes:
          'Bilateral coarse crackles at lung bases. Prescribed oral Amoxicillin-Clavulanate and antipyretics. Oxygen saturation 95% on room air.',
        plan: 'Complete 10-day antibiotic course. Repeat chest radiograph in 3 weeks.',
        doctor: {
          display_name: 'Dr. Alan Bradley, MD',
          department: 'Pulmonology',
        },
      },
    ],
    prescriptions: [
      {
        id: 'rx-002',
        prescribed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'active',
        notes: 'Take with food to minimize gastrointestinal discomfort.',
        prescribed_by_doctor: {
          display_name: 'Dr. Alan Bradley, MD',
        },
        items: [
          {
            id: 'rxi-003',
            dosage: '875mg/125mg',
            route: 'Oral (PO)',
            frequency: 'Twice Daily (BID)',
            duration_days: 10,
            instructions: 'Take 1 tablet every 12 hours with meals',
            medication: {
              generic_name: 'Amoxicillin-Clavulanate',
              brand_name: 'Augmentin',
              form: 'Tablet',
            },
          },
        ],
      },
    ],
    labOrders: [
      {
        id: 'lo-002',
        ordered_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'completed',
        is_stat: false,
        clinical_info: 'Assess infection markers',
        ordered_by_doctor: {
          display_name: 'Dr. Alan Bradley, MD',
        },
        results: [
          {
            id: 'res-003',
            result_value: '13.4',
            result_unit: '10^3/uL',
            ref_range_low: '4.5',
            ref_range_high: '11.0',
            severity: 'abnormal',
            is_critical: false,
            test: {
              test_code: 'WBC',
              test_name: 'White Blood Cell Count',
              sample_type: 'Whole Blood',
            },
          },
          {
            id: 'res-004',
            result_value: '42.0',
            result_unit: 'mg/L',
            ref_range_low: '0.0',
            ref_range_high: '5.0',
            severity: 'abnormal',
            is_critical: false,
            test: {
              test_code: 'CRP',
              test_name: 'C-Reactive Protein (High Sensitivity)',
              sample_type: 'Serum',
            },
          },
        ],
      },
    ],
    invoices: [
      {
        id: 'inv-002',
        invoice_number: 'INV-2026-0913',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        total_amount: 215.0,
        paid_amount: 0.0,
        balance_due: 215.0,
        payment_status: 'pending',
        due_date: new Date(Date.now() + 86400000 * 14).toISOString(),
        insurance_provider: 'UnitedHealthcare (Copay Pending)',
      },
    ],
    vitals: [
      {
        id: 'vit-003',
        recorded_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        bp_systolic: 118,
        bp_diastolic: 76,
        heart_rate: 88,
        spo2: 96,
        temperature: 99.4,
      },
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    mrn: '00482912',
    first_name: 'George',
    last_name: 'Tanner',
    dob: '1957-11-03',
    gender: 'male',
    blood_group: 'A+',
    phone: '+1 (555) 884-9021',
    email: 'george.tanner@example.com',
    address: '402 Pinecrest Ave, West End',
    emergency_contact_name: 'Martha Tanner',
    emergency_contact_phone: '+1 (555) 884-9022',
    insurance_provider: 'Aetna Senior Gold',
    insurance_policy: 'AET-771092-G',
    allergies: ['None Known'],
    dietary_flag: 'diabetic',
    appointments: [
      {
        id: 'apt-004',
        scheduled_at: new Date(Date.now() + 86400000 * 5).toISOString(),
        status: 'confirmed',
        type: 'Endocrine & Orthopedic Review',
        location: 'Room 108 - Endocrinology',
        reason: 'Type 2 Diabetes follow-up and Post-Op Knee check',
        doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
          department: 'Internal Medicine',
        },
      },
    ],
    consultations: [
      {
        id: 'con-003',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        chief_complaint: 'Routine diabetes check-up following knee arthroplasty',
        diagnosis: 'Type 2 Diabetes Mellitus with fair glycemic control',
        clinical_notes:
          'HbA1c at 7.6%. Incision on right knee is healing well without signs of infection. Continuing Metformin and Glimepiride.',
        plan: 'Maintain consistent 45g carbohydrate distribution per meal. Physical therapy x2 weekly.',
        doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
          department: 'Internal Medicine',
        },
      },
    ],
    prescriptions: [
      {
        id: 'rx-003',
        prescribed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        status: 'active',
        notes: 'Take with main meals.',
        prescribed_by_doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
        },
        items: [
          {
            id: 'rxi-004',
            dosage: '1000mg',
            route: 'Oral (PO)',
            frequency: 'Twice Daily (BID)',
            duration_days: 90,
            instructions: 'Take 1 tablet with breakfast and 1 with dinner',
            medication: {
              generic_name: 'Metformin HCl Extended Release',
              brand_name: 'Glucophage XR',
              form: 'Tablet',
            },
          },
          {
            id: 'rxi-005',
            dosage: '2mg',
            route: 'Oral (PO)',
            frequency: 'Once Daily (QAM)',
            duration_days: 90,
            instructions: 'Take 1 tablet before breakfast',
            medication: {
              generic_name: 'Glimepiride',
              brand_name: 'Amaryl',
              form: 'Tablet',
            },
          },
        ],
      },
    ],
    labOrders: [
      {
        id: 'lo-003',
        ordered_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'completed',
        is_stat: false,
        clinical_info: 'Quarterly diabetic evaluation',
        ordered_by_doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
        },
        results: [
          {
            id: 'res-005',
            result_value: '7.6',
            result_unit: '%',
            ref_range_low: '4.0',
            ref_range_high: '5.6',
            severity: 'abnormal',
            is_critical: false,
            test: {
              test_code: 'HBA1C',
              test_name: 'Glycated Hemoglobin (HbA1c)',
              sample_type: 'Whole Blood',
            },
          },
          {
            id: 'res-006',
            result_value: '138',
            result_unit: 'mg/dL',
            ref_range_low: '70',
            ref_range_high: '99',
            severity: 'abnormal',
            is_critical: false,
            test: {
              test_code: 'GLU-FAST',
              test_name: 'Fasting Plasma Glucose',
              sample_type: 'Plasma',
            },
          },
        ],
      },
    ],
    invoices: [
      {
        id: 'inv-003',
        invoice_number: 'INV-2026-0912',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        total_amount: 3850.0,
        paid_amount: 3000.0,
        balance_due: 850.0,
        payment_status: 'partial',
        due_date: new Date(Date.now() + 86400000 * 10).toISOString(),
        insurance_provider: 'Aetna Senior Gold',
      },
    ],
    vitals: [
      {
        id: 'vit-004',
        recorded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        bp_systolic: 134,
        bp_diastolic: 86,
        heart_rate: 78,
        spo2: 97,
        temperature: 98.6,
      },
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    mrn: '00482913',
    first_name: 'Aisha',
    last_name: 'Nkosi',
    dob: '1995-02-18',
    gender: 'female',
    blood_group: 'A-',
    phone: '+1 (555) 441-2983',
    email: 'aisha.nkosi@example.com',
    address: '710 Boulevard South',
    emergency_contact_name: 'Thabo Nkosi',
    emergency_contact_phone: '+1 (555) 441-2984',
    insurance_provider: 'Cigna Global',
    insurance_policy: 'CIG-330198-M',
    allergies: ['Ibuprofen'],
    dietary_flag: 'none',
    appointments: [
      {
        id: 'apt-005',
        scheduled_at: new Date(Date.now() + 86400000 * 4).toISOString(),
        status: 'confirmed',
        type: 'Electrophysiology Consultation',
        location: 'Room 312 - Cardiac Electrophysiology',
        reason: 'Holter monitor review & SVT management',
        doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
          department: 'Cardiology',
        },
      },
    ],
    consultations: [
      {
        id: 'con-004',
        created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
        chief_complaint: 'Sudden onset palpitations and lightheadedness at rest',
        diagnosis: 'Paroxysmal Supraventricular Tachycardia (PSVT)',
        clinical_notes:
          '12-lead ECG showed regular narrow-complex tachycardia at 165 bpm, terminated via modified Valsalva maneuver. Prescribed low-dose beta blocker. Avoid caffeine and extreme stress.',
        plan: '24-hour ambulatory Holter recording scheduled. Review in 10 days.',
        doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
          department: 'Cardiology',
        },
      },
    ],
    prescriptions: [
      {
        id: 'rx-004',
        prescribed_at: new Date(Date.now() - 86400000 * 6).toISOString(),
        status: 'active',
        notes: 'Take with food. Check pulse periodically.',
        prescribed_by_doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
        },
        items: [
          {
            id: 'rxi-006',
            dosage: '25mg',
            route: 'Oral (PO)',
            frequency: 'Twice Daily (BID)',
            duration_days: 30,
            instructions: 'Take 1 tablet every 12 hours with morning and evening meals',
            medication: {
              generic_name: 'Metoprolol Tartrate',
              brand_name: 'Lopressor',
              form: 'Tablet',
            },
          },
        ],
      },
    ],
    labOrders: [
      {
        id: 'lo-004',
        ordered_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: 'completed',
        is_stat: false,
        clinical_info: 'Thyroid & Electrolyte screen for tachyarrhythmia',
        ordered_by_doctor: {
          display_name: 'Dr. Sarah Jenkins, MD',
        },
        results: [
          {
            id: 'res-007',
            result_value: '2.1',
            result_unit: 'uIU/mL',
            ref_range_low: '0.4',
            ref_range_high: '4.0',
            severity: 'normal',
            is_critical: false,
            test: {
              test_code: 'TSH',
              test_name: 'Thyroid Stimulating Hormone',
              sample_type: 'Serum',
            },
          },
          {
            id: 'res-008',
            result_value: '4.2',
            result_unit: 'mEq/L',
            ref_range_low: '3.5',
            ref_range_high: '5.0',
            severity: 'normal',
            is_critical: false,
            test: {
              test_code: 'POTASSIUM',
              test_name: 'Serum Potassium (K+)',
              sample_type: 'Serum',
            },
          },
        ],
      },
    ],
    invoices: [
      {
        id: 'inv-004',
        invoice_number: 'INV-2026-0911',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        total_amount: 640.0,
        paid_amount: 500.0,
        balance_due: 140.0,
        payment_status: 'partial',
        due_date: new Date(Date.now() + 86400000 * 15).toISOString(),
        insurance_provider: 'Cigna Global',
      },
    ],
    vitals: [
      {
        id: 'vit-005',
        recorded_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        bp_systolic: 110,
        bp_diastolic: 70,
        heart_rate: 74,
        spo2: 99,
        temperature: 98.2,
      },
    ],
  },
]

export function findDemoPatient(phoneOrInput: string): PortalDemoPatient | null {
  const normInput = normalizePhone(phoneOrInput || '')
  if (!normInput) return null

  return (
    PORTAL_DEMO_PATIENTS.find((p) => {
      const normDB = normalizePhone(p.phone)
      return (
        normDB === normInput ||
        normDB.endsWith(normInput) ||
        normInput.endsWith(normDB) ||
        p.mrn.toLowerCase() === phoneOrInput.trim().toLowerCase()
      )
    }) || null
  )
}

export function getDemoPatientById(idOrMrn: string): PortalDemoPatient | null {
  return (
    PORTAL_DEMO_PATIENTS.find(
      (p) => p.id === idOrMrn || p.mrn.toLowerCase() === idOrMrn.toLowerCase()
    ) || null
  )
}
