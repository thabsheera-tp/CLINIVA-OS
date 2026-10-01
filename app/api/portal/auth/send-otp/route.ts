import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/portal/adminSupabase'
import { normalizePhone } from '@/lib/portal/session'
import { setOtp } from '@/lib/portal/otpStore'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rawPhone = String(body.phone || '').trim()

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: 'Please enter your registered mobile number.' },
        { status: 400 }
      )
    }

    const normalizedEntered = normalizePhone(rawPhone)
    if (normalizedEntered.length < 7) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid mobile number with at least 7 digits.' },
        { status: 400 }
      )
    }

    const admin = getAdminClient()
    const { data: patients, error: dbError } = await admin
      .from('patients')
      .select('id, mrn, first_name, last_name, phone')

    if (dbError) {
      console.error('[send-otp] DB error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Database service unavailable. Please try again later.' },
        { status: 500 }
      )
    }

    // Match patient by normalized phone (comparing last 10 digits or exact normalized)
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
        {
          success: false,
          error:
            'No registered patient record was found with this mobile number. Please check the number or register at Hospital Reception.',
        },
        { status: 404 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const patientNormPhone = normalizePhone(matchedPatient.phone)

    setOtp(matchedPatient.phone, patientNormPhone, otp)
    // Also map the entered normalized phone if different
    if (patientNormPhone !== normalizedEntered) {
      setOtp(matchedPatient.phone, normalizedEntered, otp)
    }

    // Mask phone for privacy display: "+1 (555) ***-9481"
    const visibleEnd = matchedPatient.phone.slice(-4)
    const maskedPhone = `***-***-${visibleEnd}`

    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code was sent to ${maskedPhone}.`,
      maskedPhone,
      patientName: `${matchedPatient.first_name} ${matchedPatient.last_name}`,
      // In demo/test mode, expose OTP in the response for instantaneous manual or automated testing
      devOtp: isDemo ? otp : undefined,
    })
  } catch (err: any) {
    console.error('[send-otp] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
