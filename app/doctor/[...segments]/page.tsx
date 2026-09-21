import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import DoctorSubScreens from '@/components/dashboard/DoctorSubScreens'
import DoctorDeepRoutes from '@/components/dashboard/DoctorDeepRoutes'

const NAV_SECTIONS = [
  {
    label: 'Clinical Operations',
    items: [
      { label: 'Dashboard',     href: '/doctor',              icon: 'space_dashboard' },
      { label: 'Patients',      href: '/doctor/patients',     icon: 'personal_injury', badge: '1,248' },
      { label: 'Appointments',  href: '/doctor/appointments', icon: 'calendar_today',  badge: '18 Today' },
      { label: 'Live Queue',    href: '/doctor/queue',        icon: 'queue',           badge: 5, badgeVariant: 'live' as const },
      { label: 'Lab Results',   href: '/doctor/lab-results',  icon: 'biotech',         badge: 3, badgeVariant: 'alert' as const },
      { label: 'Prescriptions', href: '/doctor/prescriptions',icon: 'prescriptions' },
      { label: 'Messages',      href: '/doctor/messages',     icon: 'chat',            badge: 4 },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/doctor/settings', icon: 'settings' },
    ],
  },
]

export const metadata = { title: 'Doctor Portal' }

// Catch-all handler for /doctor/[...segments]
// Handles: /doctor/patients, /doctor/patients/[mrn], /doctor/appointments/new, etc.
export default async function DoctorCatchAll({
  params,
}: {
  params: { segments: string[] }
}) {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userName =
    session.user.user_metadata?.display_name ?? 'Dr. Sarah Jenkins, MD'

  const [firstSegment] = params.segments
  const isDeepRoute = params.segments.length > 1

  return (
    <DashboardShell
      role="doctor"
      roleLabel="Doctor Workspace"
      userName={userName}
      clinicName="St. Jude Medical Center — Dept of Cardiology"
      clinicIcon="local_hospital"
      searchPlaceholder="Search patients, records, medications..."
      liveSyncLabel="EHR Live Sync"
      notificationCount={3}
      navSections={NAV_SECTIONS}
      contextLabel="Suite 304 - Exam B"
      contextIcon="meeting_room"
      primaryAction={{ label: 'New Rx', icon: 'add' }}
    >
      {isDeepRoute ? (
        <DoctorDeepRoutes segments={params.segments} userName={userName} />
      ) : (
        <DoctorSubScreens slug={firstSegment} userName={userName} />
      )}
    </DashboardShell>
  )
}
