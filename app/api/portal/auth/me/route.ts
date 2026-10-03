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

    const session = verifySession(sessionToken)
    if (!session) {
      return NextResponse.json({ authenticated: false, patient: null }, { status: 401 })
    }

    // Try fetching full patient profile from DB if admin client is configured
    let patient: any = null
    if (isAdminConfigured()) {
      try {
        const admin = getAdminClient()
        const { data, error } = await admin
          .from('patients')
          .select('*')
          .eq('id', session.patientId)
          .single()
        if (!error && data) {
          patient = data
        }
      } catch (adminErr) {
        console.warn('[portal/me] Admin client query failed, falling back to demo records:', adminErr)
      }
    }

    // Fallback to demo profile
    if (!patient) {
      const demo = getDemoPatientById(session.patientId) || getDemoPatientById(session.mrn)
      if (demo) {
        patient = {
          id: demo.id,
          mrn: demo.mrn,
          first_name: demo.first_name,
          last_name: demo.last_name,
          dob: demo.dob,
          gender: demo.gender,
          blood_group: demo.blood_group,
          phone: demo.phone,
          email: demo.email,
          address: demo.address,
          emergency_contact_name: demo.emergency_contact_name,
          emergency_contact_phone: demo.emergency_contact_phone,
          insurance_provider: demo.insurance_provider,
          insurance_policy: demo.insurance_policy,
          allergies: demo.allergies,
          dietary_flag: demo.dietary_flag,
        }
      } else {
        // Fallback to session basic data
        patient = {
          id: session.patientId,
          mrn: session.mrn,
          first_name: session.firstName,
          last_name: session.lastName,
          phone: session.phone,
          dob: session.dob || '1980-01-01',
          gender: session.gender || 'unknown',
          blood_group: 'Unknown',
          email: null,
          address: 'Clinic Registered',
          allergies: [],
          dietary_flag: 'none',
        }
      }
    }

    return NextResponse.json({
      authenticated: true,
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
    })
  } catch (err: any) {
    console.error('[portal/me] Error:', err)
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 })
  }
}
