import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import BillingSubScreens from '@/components/dashboard/BillingSubScreens'

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

export default async function BillingCatchAll({ params }: { params: { segments: string[] } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userName = session.user.user_metadata?.display_name ?? 'Hannah Brooks'
  const slug = params.segments[0]

  return (
    <DashboardShell
      role="cashier"
      roleLabel="Billing & Cashier"
      userName={userName}
      clinicName="St. Jude Medical Center — Cashier Desk"
      clinicIcon="receipt_long"
      searchPlaceholder="Search invoices, claims, patients..."
      liveSyncLabel="Ledger Live"
      notificationCount={1}
      navSections={NAV_SECTIONS}
      contextLabel="Counter 1 — Ground Floor"
      contextIcon="point_of_sale"
      primaryAction={{ label: 'New Invoice', icon: 'receipt' }}
    >
      <BillingSubScreens slug={slug} userName={userName} />
    </DashboardShell>
  )
}
