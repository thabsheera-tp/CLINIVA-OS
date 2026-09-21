import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'

const NAV_SECTIONS = [
  {
    label: 'Canteen Operations',
    items: [
      { label: 'Dashboard',          href: '/canteen',               icon: 'space_dashboard' },
      { label: 'Patient Meal Orders',href: '/canteen/meal-orders',   icon: 'room_service',   badge: 42, badgeVariant: 'live' as const },
      { label: 'Cafeteria Sales',    href: '/canteen/pos',           icon: 'point_of_sale' },
      { label: 'Menu Management',    href: '/canteen/menu',          icon: 'restaurant_menu' },
      { label: 'Inventory',          href: '/canteen/inventory',     icon: 'inventory_2',   badge: 'Low', badgeVariant: 'alert' as const },
      { label: 'Dietary Restrictions',href: '/canteen/dietary',      icon: 'no_food' },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', href: '/canteen/settings', icon: 'settings' }] },
]

export const metadata = { title: 'Canteen & Dietary' }

const DIETARY_FLAGS: Record<string, string> = {
  'diabetic': 'bg-amber-50 text-amber-700 border-amber-200',
  'low-sodium': 'bg-blue-50 text-blue-700 border-blue-200',
  'vegetarian': 'bg-green-50 text-green-700 border-green-200',
  'gluten-free': 'bg-purple-50 text-purple-700 border-purple-200',
  'npo': 'bg-error-container text-on-error-container border-tertiary/20',
}

export default async function CanteenDashboard() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') redirect('/login')
  const userName = session?.user?.user_metadata?.display_name ?? 'Chef Marcus Vance'

  return (
    <DashboardShell
      role="canteen"
      roleLabel="Canteen Management"
      userName={userName}
      clinicName="St. Jude Medical Center — Canteen & Dietary Services"
      clinicIcon="restaurant"
      searchPlaceholder="Search meal orders, menu items, ingredients..."
      liveSyncLabel="Kitchen Live"
      notificationCount={2}
      navSections={NAV_SECTIONS}
      contextLabel="Main Kitchen — Station 1"
      contextIcon="countertops"
      primaryAction={{ label: 'New Order', icon: 'add' }}
    >
      <div className="flex flex-col space-y-gutter-desktop">

        <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-lg rounded-2xl" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div>
            <h1 className="font-heading text-headline-lg text-on-surface font-semibold">Canteen & Dietary</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Main Kitchen — Lunch Service • 11:30 – 14:00</p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
            <button className="btn-primary justify-center touch-tap flex-1 sm:flex-initial">
              <span className="material-symbols-outlined text-[18px]">room_service</span>
              <span>New Meal Order</span>
            </button>
            <button className="btn-secondary justify-center touch-tap flex-1 sm:flex-initial">
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              <span>Cafeteria POS</span>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <KPICard title="Patient Meal Orders" value={42} icon="room_service"   trend="18 pending delivery"   trendDir="neutral" live />
          <KPICard title="Cafeteria Sales"     value="₹8,200" icon="point_of_sale" trend="+22% vs yesterday" trendDir="up" />
          <KPICard title="Dietary Alerts"      value={6}  icon="no_food"       trend="6 special diets"       trendDir="neutral" />
          <KPICard title="Low Inventory"       value={3}  icon="inventory_2"   trend="Reorder required"      trendDir="down" />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-md">
          {/* Patient Meal Orders */}
          <div className="xl:col-span-2 clinical-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md border-b border-outline-variant/20 gap-2">
              <div className="flex items-center gap-space-sm">
                <h3 className="font-heading text-headline-sm text-on-surface font-semibold">Patient Meal Orders</h3>
                <LiveIndicator size="sm" />
              </div>
              <div className="flex gap-space-xs overflow-x-auto smooth-touch-scroll pb-1 sm:pb-0">
                {['All', 'Pending', 'Delivered', 'Special Diet'].map(f => (
                  <button key={f} className={`px-space-md py-1 rounded-full text-label-sm whitespace-nowrap transition-all touch-tap ${f === 'All' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{f}</button>
                ))}
              </div>
            </div>

            {/* Mobile Meal Order Cards (< sm screens) */}
            <div className="block sm:hidden divide-y divide-outline-variant/10 p-2">
              {[
                { bed: 'A-01', patient: 'Marcus Delacroix', meal: 'Grilled chicken, steamed veg, brown rice',  diet: 'low-sodium',  time: '12:30', status: 'pending' },
                { bed: 'A-02', patient: 'Priya Mehta',       meal: 'Veg soup, roti, curd',                     diet: 'vegetarian',  time: '12:30', status: 'preparing' },
                { bed: 'A-04', patient: 'George Tanner',     meal: 'Oats porridge, fruit bowl',                diet: 'diabetic',    time: '12:00', status: 'delivered' },
                { bed: 'A-06', patient: 'Aisha Nkosi',       meal: 'NPO — Nil by mouth',                      diet: 'npo',         time: '—',     status: 'npo' },
                { bed: 'B-02', patient: 'David Chen',        meal: 'Dal khichdi, buttermilk',                  diet: 'diabetic',    time: '12:30', status: 'pending' },
              ].map(row => (
                <div key={row.bed} className="p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-surface-container font-bold text-on-surface flex items-center justify-center text-label-md">
                        {row.bed}
                      </span>
                      <div>
                        <p className="text-label-lg font-semibold text-on-surface">{row.patient}</p>
                        <p className="text-body-sm text-on-surface-variant">Time: {row.time}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-bold border ${DIETARY_FLAGS[row.diet] ?? ''}`}>
                      {row.diet.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface bg-surface-container-low p-2 rounded-lg">
                    {row.meal}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <StatusBadge
                      variant={row.status === 'npo' ? 'critical' : row.status === 'delivered' ? 'routine' : row.status === 'preparing' ? 'warning' : 'neutral'}
                      label={row.status}
                    />
                    {row.status !== 'npo' && row.status !== 'delivered' && (
                      <button className="btn-primary py-1 px-3 text-label-sm touch-tap">
                        {row.status === 'pending' ? 'Prepare →' : 'Deliver →'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Meal Order Table (sm+ screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-outline-variant/20">
                  {['Bed', 'Patient', 'Meal', 'Dietary', 'Meal Time', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-space-md py-space-sm text-left text-label-sm text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {[
                    { bed: 'A-01', patient: 'Marcus Delacroix', meal: 'Grilled chicken, steamed veg, brown rice',  diet: 'low-sodium',  time: '12:30', status: 'pending' },
                    { bed: 'A-02', patient: 'Priya Mehta',       meal: 'Veg soup, roti, curd',                     diet: 'vegetarian',  time: '12:30', status: 'preparing' },
                    { bed: 'A-04', patient: 'George Tanner',     meal: 'Oats porridge, fruit bowl',                diet: 'diabetic',    time: '12:00', status: 'delivered' },
                    { bed: 'A-06', patient: 'Aisha Nkosi',       meal: 'NPO — Nil by mouth',                      diet: 'npo',         time: '—',     status: 'npo' },
                    { bed: 'B-02', patient: 'David Chen',        meal: 'Dal khichdi, buttermilk',                  diet: 'diabetic',    time: '12:30', status: 'pending' },
                  ].map(row => (
                    <tr key={row.bed} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-space-md py-space-sm text-label-lg text-on-surface font-bold">{row.bed}</td>
                      <td className="px-space-md py-space-sm text-label-md text-on-surface">{row.patient}</td>
                      <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant max-w-[180px] truncate">{row.meal}</td>
                      <td className="px-space-md py-space-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-bold border ${DIETARY_FLAGS[row.diet] ?? ''}`}>
                          {row.diet.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant tabular-nums">{row.time}</td>
                      <td className="px-space-md py-space-sm">
                        <StatusBadge
                          variant={row.status === 'npo' ? 'critical' : row.status === 'delivered' ? 'routine' : row.status === 'preparing' ? 'warning' : 'neutral'}
                          label={row.status}
                        />
                      </td>
                      <td className="px-space-md py-space-sm text-right">
                        {row.status !== 'npo' && row.status !== 'delivered' && (
                          <button className="text-primary text-label-sm font-semibold hover:underline touch-tap">
                            {row.status === 'pending' ? 'Prepare →' : 'Deliver →'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kitchen Inventory Alerts + Menu Today */}
          <div className="flex flex-col gap-space-md">
            <div className="clinical-card p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-headline-sm text-on-surface font-semibold">Today&apos;s Menu</h3>
                <button className="text-primary text-label-sm font-semibold hover:underline">Edit</button>
              </div>
              {[
                { meal: 'Breakfast', items: 'Idli, Sambar, Chutney' },
                { meal: 'Lunch',     items: 'Rice, Dal, Sabzi, Curd, Fruit' },
                { meal: 'Dinner',    items: 'Roti, Paneer Curry, Khichdi' },
              ].map(m => (
                <div key={m.meal} className="p-space-sm bg-surface-container-low rounded-xl">
                  <p className="text-label-md text-on-surface font-semibold">{m.meal}</p>
                  <p className="text-body-sm text-on-surface-variant">{m.items}</p>
                </div>
              ))}
            </div>

            <div className="clinical-card flex flex-col">
              <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
                <h3 className="font-heading text-headline-sm text-on-surface font-semibold">Kitchen Inventory</h3>
                <StatusBadge variant="critical" label="3 Low" />
              </div>
              <div className="divide-y divide-outline-variant/10">
                {[
                  { item: 'Rice (Basmati)',   stock: '2 kg',  status: 'critical' },
                  { item: 'Chicken (Fresh)',  stock: '500 g', status: 'critical' },
                  { item: 'Paneer',           stock: '1 kg',  status: 'warning' },
                  { item: 'Vegetables Mix',   stock: '3 kg',  status: 'ok' },
                  { item: 'Dal (Toor)',       stock: '5 kg',  status: 'ok' },
                ].map(item => (
                  <div key={item.item} className="flex items-center justify-between px-space-md py-space-sm hover:bg-surface-container-low/50 transition-colors">
                    <p className="text-label-md text-on-surface">{item.item}</p>
                    <div className="flex items-center gap-space-sm">
                      <span className={`text-label-md font-semibold tabular-nums ${item.status === 'critical' ? 'text-tertiary' : item.status === 'warning' ? 'text-status-warning' : 'text-on-surface-variant'}`}>{item.stock}</span>
                      {item.status !== 'ok' && <button className="text-primary text-label-sm font-semibold">Order</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TODO: [REALTIME] Subscribe to bed-status updates to refresh meal order list when patient is transferred */}
      </div>
    </DashboardShell>
  )
}
