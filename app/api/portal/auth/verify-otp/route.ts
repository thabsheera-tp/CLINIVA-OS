import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/portal/adminSupabase'
import { normalizePhone, signSession, SESSION_COOKIE_NAME } from '@/lib/portal/session'
import { verifyOtpCode } from '@/lib/portal/otpStore'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rawPhone = String(body.phone || '').trim()
    const enteredOtp = String(body.otp || '').trim()

    if (!rawPhone || !enteredOtp) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and OTP are required.' },
        { status: 400 }
      )
    }

    const normalizedEntered = normalizePhone(rawPhone)

    // Verify code
    const verification = verifyOtpCode(normalizedEntered, enteredOtp)
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.reason || 'Invalid OTP code.' },
        { status: 401 }
      )
    }

    // Find the patient in the database
    const admin = getAdminClient()
    const { data: patients, error: dbError } = await admin
      .from('patients')
      .select('id, mrn, first_name, last_name, phone, dob, gender, auth_user_id')

    if (dbError) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 500 }
      )
    }

    const matchedPatient = patients?.find((p) => {
      const normDB = normalizePhone(p.phone || '')
      return (
        normDB === normalizedEntered ||
        normDB.endsWith(normalizedEntered) ||
        normalizedEntered.endsWith(normDB)
      )
    })

    if (!matchedPatient) {
      return NextResponse.json(
        { success: false, error: 'Patient record not found.' },
        { status: 404 }
      )
    }

    // Prepare signed session payload
    const sessionToken = signSession({
      patientId: matchedPatient.id,
      mrn: matchedPatient.mrn,
      phone: matchedPatient.phone,
      firstName: matchedPatient.first_name,
      lastName: matchedPatient.last_name,
      dob: matchedPatient.dob,
      gender: matchedPatient.gender,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      patient: {
        id: matchedPatient.id,
        mrn: matchedPatient.mrn,
        firstName: matchedPatient.first_name,
        lastName: matchedPatient.last_name,
        phone: matchedPatient.phone,
        dob: matchedPatient.dob,
        gender: matchedPatient.gender,
      },
    })

    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    }

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, cookieOptions)
    // Non-httpOnly helper cookie for quick client identification
    response.cookies.set('cliniva_auth_user', 'patient', {
      ...cookieOptions,
      httpOnly: false,
    })
    response.cookies.set('cliniva_demo_role', 'patient', {
      ...cookieOptions,
      httpOnly: false,
    })

    return response
  } catch (err: any) {
    console.error('[verify-otp] Error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
