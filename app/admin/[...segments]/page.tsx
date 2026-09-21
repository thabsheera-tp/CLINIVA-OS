import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import AdminSubScreens from '@/components/dashboard/AdminSubScreens'

const NAV_SECTIONS = [
  {
    label: 'Administration',
    items: [
      { label: 'Dashboard',        href: '/admin',              icon: 'space_dashboard' },
      { label: 'Module Control',   href: '/admin/modules',      icon: 'apps' },
      { label: 'Staff Management', href: '/admin/staff',        icon: 'manage_accounts' },
      { label: 'Departments',      href: '/admin/departments',  icon: 'domain' },
      { label: 'Analytics',        href: '/admin/analytics',    icon: 'bar_chart' },
      { label: 'Audit Logs',       href: '/admin/audit',        icon: 'receipt_long' },
      { label: 'Subscription',     href: '/admin/subscription', icon: 'credit_card' },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', href: '/admin/settings', icon: 'settings' }] },
]

export const metadata = { title: 'Admin & Operations' }

export default async function AdminCatchAll({ params }: { params: { segments: string[] } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') redirect('/login')

  const userName = session?.user?.user_metadata?.display_name ?? 'Alexander Sterling'
  const slug = params.segments[0]

  return (
    <DashboardShell
      role="admin"
      roleLabel="Admin & Management"
      userName={userName}
      clinicName="St. Jude Medical Center — Admin Suite"
      clinicIcon="admin_panel_settings"
      searchPlaceholder="Search staff, modules, audit logs..."
      liveSyncLabel="System Healthy"
      notificationCount={2}
      navSections={NAV_SECTIONS}
      contextLabel="Hospital Executive Office"
      contextIcon="corporate_fare"
      primaryAction={{ label: 'Add Staff', icon: 'person_add' }}
    >
      <AdminSubScreens slug={slug} userName={userName} />
    </DashboardShell>
  )
}
