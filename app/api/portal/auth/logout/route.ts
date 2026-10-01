import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/portal/session'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' })
  response.cookies.delete(SESSION_COOKIE_NAME)
  response.cookies.delete('cliniva_auth_user')
  response.cookies.delete('cliniva_demo_role')
  return response
}
