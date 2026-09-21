import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import {
  PortalQueue,
  PortalRecords,
  PortalPrescriptions,
  PortalProfile,
  PortalSymptomChecker,
  PortalHome,
} from '@/components/dashboard/PortalDashboardView'

export const metadata = { title: 'Patient Portal — My Health' }

export default async function PortalSubPage({ params }: { params: { segments: string[] } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const patientName = session.user.user_metadata?.display_name ?? 'Marcus Delacroix'
  const firstName = patientName.split(' ')[0]

  const slug = params.segments?.[0]

  if (slug === 'symptoms' || slug === 'checker') return <PortalSymptomChecker firstName={firstName} />
  if (slug === 'queue') return <PortalQueue firstName={firstName} />
  if (slug === 'records') return <PortalRecords firstName={firstName} />
  if (slug === 'prescriptions') return <PortalPrescriptions firstName={firstName} />
  if (slug === 'profile') return <PortalProfile firstName={firstName} />

  // Fallback: default portal home for any unknown segment
  return <PortalHome firstName={firstName} />
}
