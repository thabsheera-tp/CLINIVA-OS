// In-memory OTP storage with expiration
interface OtpEntry {
  phone: string
  normalizedPhone: string
  otp: string
  expiresAt: number
  attempts: number
}

// Global declaration to survive hot module reload in dev
declare global {
  // eslint-disable-next-line no-var
  var __clinivaOtpStore: Map<string, OtpEntry> | undefined
}

const otpStore: Map<string, OtpEntry> = global.__clinivaOtpStore || new Map()
if (process.env.NODE_ENV !== 'production') {
  global.__clinivaOtpStore = otpStore
}

const OTP_TTL_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 5

export function setOtp(phone: string, normalizedPhone: string, otp: string): void {
  otpStore.set(normalizedPhone, {
    phone,
    normalizedPhone,
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  })
}

export function verifyOtpCode(normalizedPhone: string, enteredOtp: string): { valid: boolean; reason?: string } {
  const entry = otpStore.get(normalizedPhone)

  // Allow fixed dev demo bypass OTP '123456' for instant demo test flows if demo mode is on
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'
  if (isDemo && enteredOtp === '123456') {
    return { valid: true }
  }

  if (!entry) {
    return { valid: false, reason: 'OTP expired or not requested. Please request a new code.' }
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedPhone)
    return { valid: false, reason: 'OTP has expired. Please request a new code.' }
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalizedPhone)
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new code.' }
  }

  if (entry.otp !== enteredOtp.trim()) {
    entry.attempts += 1
    return { valid: false, reason: 'Invalid OTP code. Please check and try again.' }
  }

  // Success: consume OTP
  otpStore.delete(normalizedPhone)
  return { valid: true }
}
