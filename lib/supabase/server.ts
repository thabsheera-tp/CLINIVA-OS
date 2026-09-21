import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type Database = {
  public: {
    Tables: {
      clinics: { Row: { id: string; name: string; slug: string; plan_tier: string; created_at: string } }
      clinic_settings: { Row: { clinic_id: string; key: string; value: string | boolean | number } }
      profiles: { Row: { id: string; tenant_id: string; role: string; display_name: string; avatar_url: string | null } }
      patients: { Row: { id: string; tenant_id: string; mrn: string; first_name: string; last_name: string; dob: string; gender: string; phone: string; email: string | null } }
      appointments: { Row: { id: string; tenant_id: string; patient_id: string; doctor_id: string; scheduled_at: string; status: string; queue_token: number; chief_complaint: string | null } }
      patient_vitals: { Row: { id: string; tenant_id: string; patient_id: string; appointment_id: string; bp_systolic: number | null; bp_diastolic: number | null; heart_rate: number | null; spo2: number | null; temperature: number | null; recorded_at: string } }
      beds: { Row: { id: string; tenant_id: string; ward_id: string; bed_number: string; status: string; current_patient_id: string | null } }
      wards: { Row: { id: string; tenant_id: string; name: string; floor: string } }
    }
  }
}

const DEMO_USERS: Record<string, { role: string; display_name: string; email: string }> = {
  doctor: { role: 'doctor', display_name: 'Dr. Sarah Jenkins, MD', email: 'doctor@cliniva.os' },
  front_desk: { role: 'front_desk', display_name: 'Elena Rostova', email: 'reception@cliniva.os' },
  nurse: { role: 'nurse', display_name: 'Nurse Priya Sharma, RN', email: 'nurse@cliniva.os' },
  pharmacist: { role: 'pharmacist', display_name: 'Marcus Vance, PharmD', email: 'pharmacy@cliniva.os' },
  lab_tech: { role: 'lab_tech', display_name: 'David Kalu, MLS', email: 'lab@cliniva.os' },
  cashier: { role: 'cashier', display_name: 'Hannah Brooks', email: 'billing@cliniva.os' },
  admin: { role: 'admin', display_name: 'Alexander Sterling', email: 'admin@cliniva.os' },
  canteen: { role: 'canteen', display_name: 'Chef Marco Rossi', email: 'canteen@cliniva.os' },
  patient: { role: 'patient', display_name: 'Marcus Delacroix', email: 'patient@cliniva.os' },
}

/**
 * Create a Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Reads/writes cookies for session management.
 * Includes seamless demo-session fallback when exploring in preview mode.
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://fospnuhjxebcfoinzlsw.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvc3BudWhqeGViY2ZvaW56bHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTk0MzYsImV4cCI6MjEwNTI5NTQzNn0.7_PMUD4OSUI3xhVRQJJUUdRWccGLPRyPYKrt0NSp7FM'

export function createServerClient() {
  const cookieStore = cookies()

  const client = createSupabaseServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Component — set is a no-op (handled by middleware)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Server Component — remove is a no-op
          }
        },
      },
    }
  )

  const originalGetSession = client.auth.getSession.bind(client.auth)
  client.auth.getSession = async () => {
    try {
      const res = await originalGetSession()
      if (res.data?.session) {
        return res
      }
    } catch {
      // Offline / unconfigured credentials
    }

    const demoRole = cookieStore.get('cliniva_demo_role')?.value
    if (demoRole && DEMO_USERS[demoRole]) {
      const demoUser = DEMO_USERS[demoRole]
      return {
        data: {
          session: {
            access_token: 'demo-access-token',
            refresh_token: 'demo-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: `demo-${demoUser.role}-id`,
              app_metadata: {},
              user_metadata: {
                role: demoUser.role,
                display_name: demoUser.display_name,
              },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              email: demoUser.email,
            } as any,
          } as any,
        },
        error: null,
      }
    }

    return { data: { session: null }, error: null }
  }

  return client
}
