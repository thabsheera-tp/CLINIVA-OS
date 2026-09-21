import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { PortalReminders } from '@/components/dashboard/PortalDashboardView'

export const metadata = { title: 'Smart Medication Reminders — Cliniva OS' }

export default async function MedicationRemindersPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') redirect('/login')

  const patientName = session?.user?.user_metadata?.display_name ?? 'Marcus Delacroix'
  const firstName = patientName.split(' ')[0]

  return <PortalReminders firstName={firstName} />
}
