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
  if (!session) redirect('/login')
  const userName = session.user.user_metadata?.display_name ?? 'Hannah Brooks'

  return (
    <DashboardShell
      role="cashier"
      roleLabel="Billing & Cashier"
      userName={userName}
      clinicName="St. Jude Medical Center — Billing Office"
      clinicIcon="receipt_long"
      searchPlaceholder="Search invoices, patients, transactions..."
      liveSyncLabel="Payments Sync"
      notificationCount={2}
      navSections={NAV_SECTIONS}
      contextLabel="Cashier Counter 1"
      contextIcon="point_of_sale"
      primaryAction={{ label: 'New Invoice', icon: 'add' }}
    >
      <BillingDashboardView userName={userName} />
    </DashboardShell>
  )
}
