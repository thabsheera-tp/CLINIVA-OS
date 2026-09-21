import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import CanteenSubScreens from '@/components/dashboard/CanteenSubScreens'

const NAV_SECTIONS = [
  {
    label: 'Canteen Operations',
    items: [
      { label: 'Dashboard',              href: '/canteen',               icon: 'space_dashboard' },
      { label: 'Patient Meal Orders',    href: '/canteen/meal-orders',   icon: 'room_service',   badge: 42, badgeVariant: 'live' as const },
      { label: 'Cafeteria Sales',        href: '/canteen/pos',           icon: 'point_of_sale' },
      { label: 'Menu Management',        href: '/canteen/menu',          icon: 'restaurant_menu' },
      { label: 'Inventory',              href: '/canteen/inventory',     icon: 'inventory_2',   badge: 'Low', badgeVariant: 'alert' as const },
      { label: 'Dietary Restrictions',   href: '/canteen/dietary',       icon: 'no_food' },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', href: '/canteen/settings', icon: 'settings' }] },
]

export const metadata = { title: 'Canteen & Dietary' }

export default async function CanteenCatchAll({ params }: { params: { segments: string[] } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userName = session.user.user_metadata?.display_name ?? 'Chef Marco Rossi'
  const slug = params.segments[0]

  return (
    <DashboardShell
      role="canteen"
      roleLabel="Canteen & Dietary"
      userName={userName}
      clinicName="St. Jude Medical Center — Dietary Service"
      clinicIcon="restaurant"
      searchPlaceholder="Search meal orders, menu items, ingredients..."
      liveSyncLabel="Kitchen Live"
      notificationCount={2}
      navSections={NAV_SECTIONS}
      contextLabel="Central Dietary Kitchen"
      contextIcon="soup_kitchen"
      primaryAction={{ label: 'New Meal Order', icon: 'lunch_dining' }}
    >
      <CanteenSubScreens slug={slug} userName={userName} />
    </DashboardShell>
  )
}
