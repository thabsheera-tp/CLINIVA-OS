import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import PharmacySubScreens from '@/components/dashboard/PharmacySubScreens'

const NAV_SECTIONS = [
  {
    label: 'Pharmacy',
    items: [
      { label: 'Dashboard',      href: '/pharmacy',             icon: 'space_dashboard' },
      { label: 'Dispense Queue', href: '/pharmacy/dispense',    icon: 'prescriptions', badge: 12, badgeVariant: 'live' as const },
      { label: 'Drug Inventory', href: '/pharmacy/inventory',   icon: 'inventory_2' },
      { label: 'Purchase Orders',href: '/pharmacy/orders',      icon: 'shopping_cart' },
      { label: 'Expiry Tracker', href: '/pharmacy/expiry',      icon: 'event_busy', badge: 14, badgeVariant: 'alert' as const },
      { label: 'Suppliers',      href: '/pharmacy/suppliers',   icon: 'local_shipping' },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', href: '/pharmacy/settings', icon: 'settings' }] },
]

export const metadata = { title: 'Pharmacy & Stock' }

export default async function PharmacyCatchAll({ params }: { params: { segments: string[] } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userName = session.user.user_metadata?.display_name ?? 'Marcus Vance, PharmD'
  const slug = params.segments[0]

  return (
    <DashboardShell
      role="pharmacist"
      roleLabel="Pharmacy & Stock"
      userName={userName}
      clinicName="St. Jude Medical Center — Central Pharmacy"
      clinicIcon="local_pharmacy"
      searchPlaceholder="Search drugs, NDC, inventory, prescriptions..."
      liveSyncLabel="Stock Live"
      notificationCount={3}
      navSections={NAV_SECTIONS}
      contextLabel="Central Dispensary"
      contextIcon="medication"
      primaryAction={{ label: 'Dispense Rx', icon: 'prescriptions' }}
    >
      <PharmacySubScreens slug={slug} userName={userName} />
    </DashboardShell>
  )
}
