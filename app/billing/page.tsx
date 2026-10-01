import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import BillingDashboardView from '@/components/dashboard/BillingDashboardView'

const NAV_SECTIONS = [
  {
    label: 'Billing & Cashier',
    items: [
      { label: 'Dashboard',        href: '/billing',               icon: 'space_dashboard' },
      { label: 'Invoices',         href: '/billing/invoices',      icon: 'receipt_long', badge: 7, badgeVariant: 'alert' as const },
      { label: 'POS Terminal',     href: '/billing/pos',           icon: 'point_of_sale' },
      { label: 'Insurance Claims', href: '/billing/insurance',     icon: 'health_and_safety' },
      { label: 'Daily Ledger',     href: '/billing/ledger',        icon: 'account_balance_wallet' },
      { label: 'Price List',       href: '/billing/pricing',       icon: 'sell' },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', href: '/billing/settings', icon: 'settings' }] },
]

export const metadata = { title: 'Billing & Cashier' }

export default async function BillingDashboard() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') redirect('/login')
  const userName = session?.user?.user_metadata?.display_name ?? 'Hannah Brooks'
  const userMeta = session?.user?.user_metadata || {}
  const assignedRoles = (Array.isArray(userMeta.roles) && userMeta.roles.length > 0)
    ? userMeta.roles
    : (userMeta.role ? [userMeta.role] : ['cashier'])

  return (
    <DashboardShell
      role="cashier"
      roleLabel="Billing & Cashier"
      userName={userName}
      assignedRoles={assignedRoles}
      clinicName="St. Jude Medical Center — Billing Office"
      clinicIcon="receipt_long"
      searchPlaceholder="Search invoices, patients, transactions..."
      liveSyncLabel="Payments Sync"
      notificationCount={2}
      navSections={NAV_SECTIONS}
      contextLabel="Cashier Station"
      contextIcon="point_of_sale"
      primaryAction={{ label: 'Collect Payment', icon: 'receipt_long' }}
    >
      <BillingDashboardView userName={userName} />
    </DashboardShell>
  )
}
