import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import LabSubScreens from '@/components/dashboard/LabSubScreens'

const NAV_SECTIONS = [
  {
    label: 'Lab Operations',
    items: [
      { label: 'Dashboard',        href: '/lab',                  icon: 'space_dashboard' },
      { label: 'Test Orders',      href: '/lab/orders',           icon: 'assignment', badge: 9, badgeVariant: 'live' as const },
      { label: 'Sample Tracking',  href: '/lab/samples',          icon: 'science' },
      { label: 'Result Entry',     href: '/lab/results',          icon: 'edit_note' },
      { label: 'Report Delivery',  href: '/lab/reports',          icon: 'send', badge: 3, badgeVariant: 'alert' as const },
      { label: 'Reference Ranges', href: '/lab/reference',        icon: 'tune' },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', href: '/lab/settings', icon: 'settings' }] },
]

export const metadata = { title: 'Lab & Diagnostics' }

export default async function LabCatchAll({ params }: { params: { segments: string[] } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userName = session.user.user_metadata?.display_name ?? 'David Kalu, MLS'
  const slug = params.segments[0]

  return (
    <DashboardShell
      role="lab_tech"
      roleLabel="Lab & Diagnostics"
      userName={userName}
      clinicName="St. Jude Medical Center — Pathology & Chemistry"
      clinicIcon="biotech"
      searchPlaceholder="Search test orders, samples, analyzers..."
      liveSyncLabel="LIS Live"
      notificationCount={3}
      navSections={NAV_SECTIONS}
      contextLabel="Central Pathology Core"
      contextIcon="science"
      primaryAction={{ label: 'Accession Sample', icon: 'science' }}
    >
      <LabSubScreens slug={slug} userName={userName} />
    </DashboardShell>
  )
}
