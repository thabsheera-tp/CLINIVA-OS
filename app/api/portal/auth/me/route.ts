import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/portal/session'
import { getAdminClient } from '@/lib/portal/adminSupabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    const session = verifySession(sessionToken)
    if (!session) {
      return NextResponse.json({ authenticated: false, patient: null }, { status: 401 })
    }

    // Fetch full patient profile from DB
    const admin = getAdminClient()
    const { data: patient, error } = await admin
      .from('patients')
      .select('*')
      .eq('id', session.patientId)
      .single()

    if (error || !patient) {
      return NextResponse.json({ authenticated: false, patient: null }, { status: 401 })
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
