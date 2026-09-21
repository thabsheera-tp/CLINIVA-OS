import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

const ROLE_ROUTES: Record<string, string> = {
  doctor: '/doctor',
  front_desk: '/front-desk',
  nurse: '/nursing',
  pharmacist: '/pharmacy',
  lab_tech: '/lab',
  cashier: '/billing',
  admin: '/admin',
  canteen: '/canteen',
  patient: '/portal',
}

export default async function HomePage() {
  // Check active Supabase authenticated session
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      const role = session.user.user_metadata?.role as string | undefined
      const dest = role ? (ROLE_ROUTES[role] ?? '/doctor') : '/doctor'
      redirect(dest)
    }
  } catch {
    // Offline / demo fallback
  }

  // Check demo role cookie
  const cookieStore = cookies()
  const demoRole = cookieStore.get('cliniva_demo_role')?.value

  if (demoRole && ROLE_ROUTES[demoRole]) {
    redirect(ROLE_ROUTES[demoRole])
  }

  // Default home view: Doctor Clinical Portal
  redirect('/doctor')
}
