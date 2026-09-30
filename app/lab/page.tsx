import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import LabDashboardView from '@/components/dashboard/LabDashboardView'

const NAV_SECTIONS = [
  {
    label: 'Lab Operations',
    items: [
      { label: 'Dashboard',       href: '/lab',                   icon: 'space_dashboard' },
      { label: 'Test Orders',     href: '/lab/orders',            icon: 'assignment', badge: 9, badgeVariant: 'live' as const },
      { label: 'Sample Tracking', href: '/lab/samples',           icon: 'science' },
      { label: 'Result Entry',    href: '/lab/results',           icon: 'edit_note' },
      { label: 'Report Delivery', href: '/lab/reports',           icon: 'send', badge: 3, badgeVariant: 'alert' as const },
      { label: 'Reference Ranges',href: '/lab/reference',         icon: 'tune' },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', href: '/lab/settings', icon: 'settings' }] },
]

export const metadata = { title: 'Lab & Diagnostics' }

export default async function LabDashboard() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') redirect('/login')
  const userName = session?.user?.user_metadata?.display_name ?? 'David Kalu, MLS'

  return (
    <DashboardShell
      role="lab_tech"
      roleLabel="Lab & Diagnostics"
      userName={userName}
      clinicName="St. Jude Medical Center — Clinical Lab"
      clinicIcon="biotech"
      searchPlaceholder="Search test orders, samples, patients..."
      liveSyncLabel="Lab Live"
      notificationCount={3}
      navSections={NAV_SECTIONS}
      contextLabel="Main Lab — Bench 1"
      contextIcon="science"
      primaryAction={{ label: 'Enter Results', icon: 'edit_note' }}
    >
      <LabDashboardView userName={userName} />
    </DashboardShell>
  )
}

