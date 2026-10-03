import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/portal/session'
import { getAdminClient, isAdminConfigured } from '@/lib/portal/adminSupabase'
import { getDemoPatientById } from '@/lib/portal/demoPatients'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    // In demo mode, if no session cookie exists yet, fallback to default demo patient (Marcus Delacroix)
    let session = verifySession(sessionToken)
    if (!session && process.env.NEXT_PUBLIC_DEMO_MODE !== 'false') {
      const authUser = cookieStore.get('cliniva_auth_user')?.value
      const demoRole = cookieStore.get('cliniva_demo_role')?.value
      if (authUser === 'patient' || demoRole === 'patient') {
        session = {
          patientId: '20000000-0000-0000-0000-000000000001',
          mrn: '00482910',
          phone: '+1 (555) 201-9481',
          firstName: 'Marcus',
          lastName: 'Delacroix',
        }
      }
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please verify via OTP.' },
        { status: 401 }
      )
    }

    const patientId = session.patientId

    // Check if we should use demo patient fallback
    const demoFallback = getDemoPatientById(patientId) || getDemoPatientById(session.mrn)

    if (!isAdminConfigured()) {
      if (demoFallback) {
        return NextResponse.json({
          success: true,
          patient: {
            id: demoFallback.id,
            mrn: demoFallback.mrn,
            firstName: demoFallback.first_name,
            lastName: demoFallback.last_name,
            dob: demoFallback.dob,
            gender: demoFallback.gender,
            bloodGroup: demoFallback.blood_group,
            phone: demoFallback.phone,
            email: demoFallback.email,
            address: demoFallback.address,
            emergencyContactName: demoFallback.emergency_contact_name,
            emergencyContactPhone: demoFallback.emergency_contact_phone,
            insuranceProvider: demoFallback.insurance_provider,
            insurancePolicy: demoFallback.insurance_policy,
            allergies: demoFallback.allergies,
            dietaryFlag: demoFallback.dietary_flag,
          },
          appointments: demoFallback.appointments,
          consultations: demoFallback.consultations,
          prescriptions: demoFallback.prescriptions,
          labOrders: demoFallback.labOrders,
          invoices: demoFallback.invoices,
          vitals: demoFallback.vitals,
        })
      }
    }

    let admin: any = null
    try {
      admin = getAdminClient()
    } catch {
      if (demoFallback) {
        return NextResponse.json({
          success: true,
          patient: {
            id: demoFallback.id,
            mrn: demoFallback.mrn,
            firstName: demoFallback.first_name,
            lastName: demoFallback.last_name,
            dob: demoFallback.dob,
            gender: demoFallback.gender,
            bloodGroup: demoFallback.blood_group,
            phone: demoFallback.phone,
            email: demoFallback.email,
            address: demoFallback.address,
            emergencyContactName: demoFallback.emergency_contact_name,
            emergencyContactPhone: demoFallback.emergency_contact_phone,
            insuranceProvider: demoFallback.insurance_provider,
            insurancePolicy: demoFallback.insurance_policy,
            allergies: demoFallback.allergies,
            dietaryFlag: demoFallback.dietary_flag,
          },
          appointments: demoFallback.appointments,
          consultations: demoFallback.consultations,
          prescriptions: demoFallback.prescriptions,
          labOrders: demoFallback.labOrders,
          invoices: demoFallback.invoices,
          vitals: demoFallback.vitals,
        })
      }
    }

    // 1. Fetch Patient Record
    const { data: patient, error: pErr } = await admin
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()

    if (pErr || !patient) {
      if (demoFallback) {
        return NextResponse.json({
          success: true,
          patient: {
            id: demoFallback.id,
            mrn: demoFallback.mrn,
            firstName: demoFallback.first_name,
            lastName: demoFallback.last_name,
            dob: demoFallback.dob,
            gender: demoFallback.gender,
            bloodGroup: demoFallback.blood_group,
            phone: demoFallback.phone,
            email: demoFallback.email,
            address: demoFallback.address,
            emergencyContactName: demoFallback.emergency_contact_name,
            emergencyContactPhone: demoFallback.emergency_contact_phone,
            insuranceProvider: demoFallback.insurance_provider,
            insurancePolicy: demoFallback.insurance_policy,
            allergies: demoFallback.allergies,
            dietaryFlag: demoFallback.dietary_flag,
          },
          appointments: demoFallback.appointments,
          consultations: demoFallback.consultations,
          prescriptions: demoFallback.prescriptions,
          labOrders: demoFallback.labOrders,
          invoices: demoFallback.invoices,
          vitals: demoFallback.vitals,
        })
      }
      return NextResponse.json({ error: 'Patient not found.' }, { status: 404 })
    }

    // Fetch Doctors / Staff profiles for joining display names
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, display_name, department, role')
    const doctorMap = new Map(((profiles as any[]) || []).map((p: any) => [p.id, p]))

    // 2. Fetch Appointments
    const { data: rawAppointments } = await admin
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false })

    const appointments = ((rawAppointments as any[]) || []).map((a: any) => ({
      ...a,
      doctor: doctorMap.get(a.doctor_id) || null,
    }))

    // 3. Fetch Consultations
    const { data: rawConsultations } = await admin
      .from('consultations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    const consultations = ((rawConsultations as any[]) || []).map((c: any) => ({
      ...c,
      doctor: doctorMap.get(c.doctor_id) || null,
    }))

    // 4. Fetch Prescriptions & Items
    const { data: rawPrescriptions } = await admin
      .from('prescriptions')
      .select('*, prescription_items(*)')
      .eq('patient_id', patientId)
      .order('prescribed_at', { ascending: false })

    // Also fetch medications dictionary to resolve generic / brand names
    const { data: medications } = await admin.from('medications').select('*')
    const medMap = new Map(((medications as any[]) || []).map((m: any) => [m.id, m]))

    const prescriptions = ((rawPrescriptions as any[]) || []).map((rx: any) => ({
      ...rx,
      prescribed_by_doctor: doctorMap.get(rx.prescribed_by) || null,
      dispensed_by_staff: rx.dispensed_by ? doctorMap.get(rx.dispensed_by) : null,
      items: (rx.prescription_items || []).map((item: any) => ({
        ...item,
        medication: medMap.get(item.medication_id) || null,
      })),
    }))

    // 5. Fetch Lab Orders & Results
    const { data: rawLabOrders } = await admin
      .from('lab_orders')
      .select('*, lab_results(*)')
      .eq('patient_id', patientId)
      .order('ordered_at', { ascending: false })

    const { data: labTests } = await admin.from('lab_tests').select('*')
    const testMap = new Map(((labTests as any[]) || []).map((t: any) => [t.id, t]))

    const labOrders = ((rawLabOrders as any[]) || []).map((order: any) => ({
      ...order,
      ordered_by_doctor: doctorMap.get(order.ordered_by) || null,
      results: (order.lab_results || []).map((res: any) => ({
        ...res,
        test: testMap.get(res.lab_test_id) || null,
      })),
    }))

    // 6. Fetch Invoices (Billing & Payments)
    const { data: invoices } = await admin
      .from('invoices')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    // 7. Fetch Patient Vitals
    const { data: vitals } = await admin
      .from('patient_vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        mrn: patient.mrn,
        firstName: patient.first_name,
        lastName: patient.last_name,
        dob: patient.dob,
        gender: patient.gender,
        bloodGroup: patient.blood_group,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        emergencyContactName: patient.emergency_contact_name,
        emergencyContactPhone: patient.emergency_contact_phone,
        insuranceProvider: patient.insurance_provider,
        insurancePolicy: patient.insurance_policy,
        allergies: patient.allergies,
        dietaryFlag: patient.dietary_flag,
      },
      appointments: appointments || [],
      consultations: consultations || [],
      prescriptions: prescriptions || [],
      labOrders: labOrders || [],
      invoices: invoices || [],
      vitals: vitals || [],
    })
  } catch (err: any) {
    console.error('[portal/data] Error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
