import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import NursingSubScreens from '@/components/dashboard/NursingSubScreens'

const NAV_SECTIONS = [
  {
    label: 'Ward Operations',
    items: [
      { label: 'Dashboard',        href: '/nursing',               icon: 'space_dashboard' },
      { label: 'Bed Board',        href: '/nursing/beds',          icon: 'airline_seat_individual_suite', badge: 3, badgeVariant: 'live' as const },
      { label: 'Vitals Entry',     href: '/nursing/vitals',        icon: 'monitor_heart' },
      { label: 'Medication (MAR)', href: '/nursing/mar',           icon: 'medication', badge: 4, badgeVariant: 'alert' as const },
      { label: 'Shift Handover',   href: '/nursing/handover',      icon: 'transfer_within_a_station' },
      { label: 'Patient Roster',   href: '/nursing/patients',      icon: 'group' },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', href: '/nursing/settings', icon: 'settings' }] },
]

export const metadata = { title: 'Nursing / IP Ward' }

export default async function NursingCatchAll({ params }: { params: { segments: string[] } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userName = session.user.user_metadata?.display_name ?? 'Nurse Priya Sharma, RN'
  const slug = params.segments[0]

  return (
    <DashboardShell
      role="nurse"
      roleLabel="Nursing / IP Ward"
      userName={userName}
      clinicName="St. Jude Medical Center — Ward Block"
      clinicIcon="local_hospital"
      searchPlaceholder="Search patients, beds, medications..."
      liveSyncLabel="Ward Live"
      notificationCount={4}
      navSections={NAV_SECTIONS}
      contextLabel="Ward A — Morning Shift"
      contextIcon="airline_seat_individual_suite"
      primaryAction={{ label: 'Record Vitals', icon: 'monitor_heart' }}
    >
      <NursingSubScreens slug={slug} userName={userName} />
    </DashboardShell>
  )
}
