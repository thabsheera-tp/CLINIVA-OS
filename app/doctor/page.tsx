import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'

const NAV_SECTIONS = [
  {
    label: 'Clinical Operations',
    items: [
      { label: 'Clinical Cockpit',  href: '/doctor',              icon: 'space_dashboard' },
      { label: 'Patient Registry',  href: '/doctor/patients',     icon: 'personal_injury', badge: '1,248' },
      { label: 'Consult Schedule',  href: '/doctor/appointments', icon: 'calendar_today',  badge: '18 Today' },
      { label: 'OPD Triage & Queue',href: '/doctor/queue',        icon: 'queue',           badge: 5, badgeVariant: 'live' as const },
      { label: 'Diagnostics & STAT',href: '/doctor/lab-results',  icon: 'biotech',         badge: 3, badgeVariant: 'alert' as const },
      { label: 'e-Prescriptions (e-Rx)', href: '/doctor/prescriptions', icon: 'prescriptions' },
      { label: 'Clinical Handover', href: '/doctor/messages',     icon: 'chat',            badge: 4 },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/doctor/settings', icon: 'settings' },
    ],
  },
]

import DoctorDashboardView from '@/components/dashboard/DoctorDashboardView'

export const metadata = { title: 'Doctor Portal' }

export default async function DoctorDashboard() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') redirect('/login')

  const userName = session?.user?.user_metadata?.display_name ?? 'Dr. Sarah Jenkins, MD'

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
      <DoctorDashboardView userName={userName} />
    </DashboardShell>
  )
}
