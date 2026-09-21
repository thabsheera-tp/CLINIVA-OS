import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import FrontDeskSubScreens from '@/components/dashboard/FrontDeskSubScreens'

const NAV_SECTIONS = [
  {
    label: 'Front Desk',
    items: [
      { label: 'Dashboard',           href: '/front-desk',                  icon: 'space_dashboard' },
      { label: 'Patient Search',      href: '/front-desk/search',           icon: 'person_search' },
      { label: 'New Registration',    href: '/front-desk/register',         icon: 'person_add' },
      { label: 'Token Issuance',      href: '/front-desk/tokens',           icon: 'confirmation_number', badge: 5, badgeVariant: 'live' as const },
      { label: 'Appointments',        href: '/front-desk/appointments',     icon: 'calendar_today',      badge: '32 Today' },
      { label: 'Doctor Availability', href: '/front-desk/availability',     icon: 'medical_information' },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', href: '/front-desk/settings', icon: 'settings' }] },
]

export const metadata = { title: 'Front Desk & Registration' }

export default async function FrontDeskCatchAll({ params }: { params: { segments: string[] } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') redirect('/login')

  const userName = session?.user?.user_metadata?.display_name ?? 'Elena Rostova'
  const slug = params.segments[0]

  return (
    <DashboardShell
      role="front_desk"
      roleLabel="Front Desk & Registration"
      userName={userName}
      clinicName="St. Jude Medical Center — OPD"
      clinicIcon="business"
      searchPlaceholder="Search patients by name, MRN, phone..."
      liveSyncLabel="Queue Live"
      notificationCount={2}
      navSections={NAV_SECTIONS}
      contextLabel="OPD Reception Desk"
      contextIcon="desk"
      primaryAction={{ label: 'Register Patient', icon: 'person_add' }}
    >
      <FrontDeskSubScreens slug={slug} userName={userName} />
    </DashboardShell>
  )
}
