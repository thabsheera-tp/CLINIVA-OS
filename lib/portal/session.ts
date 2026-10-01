import crypto from 'crypto'

export interface PatientSessionData {
  patientId: string
  mrn: string
  phone: string
  firstName: string
  lastName: string
  dob?: string
  gender?: string
}

const SESSION_COOKIE_NAME = 'cliniva_patient_session'
const SESSION_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'cliniva-secret-session-key-2026'

/**
 * Normalizes phone numbers to digits only for reliable matching
 * e.g., "+1 (555) 201-9481" -> "15552019481"
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Signs and encodes session data into a secure cookie value
 */
export function signSession(data: PatientSessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url')
  return `${payload}.${signature}`
}

/**
 * Verifies and decodes a signed session cookie
 */
export function verifySession(token: string | undefined | null): PatientSessionData | null {
  if (!token || !token.includes('.')) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url')

  if (signature !== expectedSignature) {
    return null
  }

  try {
    const json = Buffer.from(payload, 'base64url').toString('utf8')
    return JSON.parse(json) as PatientSessionData
  } catch {
    return null
  }
}

export { SESSION_COOKIE_NAME }
