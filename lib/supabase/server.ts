import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type Database = {
  public: {
    Tables: {
      clinics: { Row: { id: string; name: string; slug: string; plan_tier: string; created_at: string }; Insert: Record<string, any>; Update?: Record<string, any> }
      clinic_settings: { Row: { clinic_id: string; key: string; value: string | boolean | number }; Insert: Record<string, any>; Update?: Record<string, any> }
      profiles: { Row: { id: string; tenant_id: string; role: string; display_name: string; avatar_url: string | null }; Insert: Record<string, any>; Update?: Record<string, any> }
      patients: { Row: { id: string; tenant_id: string; mrn: string; first_name: string; last_name: string; dob: string; gender: string; phone: string; email: string | null }; Insert: Record<string, any>; Update?: Record<string, any> }
      appointments: { Row: { id: string; tenant_id: string; patient_id: string; doctor_id: string; scheduled_at: string; status: string; queue_token: number; chief_complaint: string | null }; Insert: Record<string, any>; Update?: Record<string, any> }
      patient_vitals: { Row: { id: string; tenant_id: string; patient_id: string; appointment_id: string; bp_systolic: number | null; bp_diastolic: number | null; heart_rate: number | null; spo2: number | null; temperature: number | null; recorded_at: string }; Insert: Record<string, any>; Update?: Record<string, any> }
      beds: { Row: { id: string; tenant_id: string; ward_id: string; bed_number: string; status: string; current_patient_id: string | null }; Insert: Record<string, any>; Update?: Record<string, any> }
      wards: { Row: { id: string; tenant_id: string; name: string; floor: string }; Insert: Record<string, any>; Update?: Record<string, any> }
      medications: { Row: { id: string; tenant_id: string; generic_name: string; brand_name: string | null; strength: string | null; form: string | null; is_controlled: boolean; is_active: boolean }; Insert: Record<string, any>; Update?: Record<string, any> }
      prescriptions: { Row: { id: string; tenant_id: string; consultation_id: string | null; appointment_id: string | null; patient_id: string; prescribed_by: string; dispensed_by: string | null; status: 'pending' | 'verified' | 'dispensed' | 'cancelled'; is_ip_order: boolean; notes: string | null; prescribed_at: string; dispensed_at: string | null }; Insert: Record<string, any>; Update?: Record<string, any> }
      prescription_items: { Row: { id: string; prescription_id: string; medication_id: string; dosage: string; route: string; frequency: string; duration_days: number | null; quantity: number | null; instructions: string | null; drug_interaction_flag: boolean }; Insert: Record<string, any>; Update?: Record<string, any> }
      pharmacy_inventory: { Row: { id: string; tenant_id: string; medication_id: string; batch_number: string | null; manufacturer: string | null; quantity_in_stock: number; reorder_level: number; unit_price: number | null; expiry_date: string | null; received_at: string; location: string | null }; Insert: Record<string, any>; Update?: Record<string, any> }
      invoices: { Row: { id: string; tenant_id: string; patient_id: string; appointment_id: string | null; invoice_number: string; subtotal: number; tax_amount: number; discount_amount: number; total_amount: number; paid_amount: number; balance_due: number; payment_status: 'pending' | 'partial' | 'paid' | 'refunded' | 'waived' | 'insurance_pending'; due_date: string | null; insurance_provider: string | null; insurance_claim_id: string | null; insurance_approved_amount: number | null; created_by: string | null; created_at: string; updated_at: string }; Insert: Record<string, any>; Update?: Record<string, any> }
      patient_queue: { Row: { id: string; tenant_id: string; patient_id: string | null; patient_name: string; token_number: number; status: string; priority: string; department: string; doctor_id: string | null; chief_complaint: string | null; estimated_wait_minutes: number; estimated_consultation_time: string | null; consultation_started_at: string | null; consultation_completed_at: string | null; created_at: string; updated_at: string }; Insert: Record<string, any>; Update?: Record<string, any> }
      consultations: { Row: { id: string; tenant_id: string; appointment_id: string; patient_id: string; doctor_id: string; subjective: string | null; objective: string | null; assessment: string | null; plan: string | null; icd10_codes: string[] | null; is_emergency: boolean; follow_up_in: number | null; started_at: string | null; signed_at: string | null; created_at: string; updated_at: string }; Insert: Record<string, any>; Update?: Record<string, any> }
      lab_orders: { Row: { id: string; tenant_id: string; patient_id: string; appointment_id: string | null; ordered_by: string; collected_by: string | null; resulted_by: string | null; status: string; is_stat: boolean; sample_collected_at: string | null; resulted_at: string | null; reported_at: string | null; clinical_info: string | null; ordered_at: string }; Insert: Record<string, any>; Update?: Record<string, any> }
      lab_tests: { Row: { id: string; tenant_id: string; test_code: string; test_name: string; sample_type: string; turnaround_hrs: number | null; is_active: boolean }; Insert: Record<string, any>; Update?: Record<string, any> }
      lab_results: { Row: { id: string; lab_order_id: string; lab_test_id: string; result_value: string; result_unit: string | null; ref_range_low: string | null; ref_range_high: string | null; severity: string; is_critical: boolean; critical_notified_at: string | null; resulted_at: string }; Insert: Record<string, any>; Update?: Record<string, any> }
    }
  }
}

export const DEMO_USERS: Record<string, { role: string; roles: string[]; display_name: string; email: string }> = {
  doctor: { role: 'doctor', roles: ['doctor'], display_name: 'Dr. Sarah Jenkins, MD', email: 'doctor@cliniva.os' },
  front_desk: { role: 'front_desk', roles: ['front_desk'], display_name: 'Elena Rostova', email: 'reception@cliniva.os' },
  nurse: { role: 'nurse', roles: ['nurse'], display_name: 'Nurse Priya Sharma, RN', email: 'nurse@cliniva.os' },
  pharmacist: { role: 'pharmacist', roles: ['pharmacist'], display_name: 'Marcus Vance, PharmD', email: 'pharmacy@cliniva.os' },
  lab_tech: { role: 'lab_tech', roles: ['lab_tech'], display_name: 'David Kalu, MLS', email: 'lab@cliniva.os' },
  cashier: { role: 'cashier', roles: ['cashier'], display_name: 'Hannah Brooks', email: 'billing@cliniva.os' },
  admin: { role: 'admin', roles: ['admin', 'doctor'], display_name: 'Alexander Sterling', email: 'admin@cliniva.os' },
  canteen: { role: 'canteen', roles: ['canteen'], display_name: 'Chef Marco Rossi', email: 'canteen@cliniva.os' },
  patient: { role: 'patient', roles: ['patient'], display_name: 'Marcus Delacroix', email: 'patient@cliniva.os' },
}

/**
 * Create a Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Reads/writes cookies for session management.
 * Includes seamless demo-session fallback when exploring in preview mode.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Supabase Server] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.')
  }
}

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

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'
    const authUser = cookieStore.get('cliniva_auth_user')?.value
    const demoRole = cookieStore.get('cliniva_demo_role')?.value
    const activeKey = authUser || demoRole

    if (isDemoMode && activeKey && DEMO_USERS[activeKey]) {
      const demoUser = DEMO_USERS[activeKey]
      // For multi-role users (e.g. admin switching to doctor workspace)
      const effectiveRole = demoRole && demoUser.roles.includes(demoRole) ? demoRole : demoUser.role
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
                role: effectiveRole,
                roles: demoUser.roles,
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
