import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import PortalDashboardView from '@/components/dashboard/PortalDashboardView'

export const metadata = { title: 'Patient Portal — My Health' }

export default async function PatientPortal() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const patientName = session.user.user_metadata?.display_name ?? 'Marcus Delacroix'
  const firstName = patientName.split(' ')[0]

  return <PortalDashboardView firstName={firstName} />
}
