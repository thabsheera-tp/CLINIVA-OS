import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'

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

const MODULES = [
  { key: 'doctor',     label: 'Doctor Portal',     icon: 'stethoscope',          enabled: true,  tier: 'base' },
  { key: 'front_desk', label: 'Front Desk',         icon: 'badge',                enabled: true,  tier: 'base' },
  { key: 'nursing',    label: 'Nursing / IP Ward',  icon: 'local_hospital',       enabled: true,  tier: 'premium' },
  { key: 'pharmacy',   label: 'Pharmacy',           icon: 'pill',                 enabled: true,  tier: 'premium' },
  { key: 'lab',        label: 'Lab & Diagnostics',  icon: 'science',              enabled: true,  tier: 'premium' },
  { key: 'billing',    label: 'Billing / Cashier',  icon: 'receipt_long',         enabled: true,  tier: 'premium' },
  { key: 'canteen',    label: 'Canteen',            icon: 'restaurant',           enabled: false, tier: 'enterprise' },
  { key: 'telehealth', label: 'Telehealth',         icon: 'videocam',             enabled: false, tier: 'enterprise' },
]

export const metadata = { title: 'Admin & Management' }

export default async function AdminDashboard() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const userName = session.user.user_metadata?.display_name ?? 'Administrator'

  return (
    <DashboardShell
      role="admin"
      roleLabel="Admin & Management"
      userName={userName}
      clinicName="St. Jude Medical Center"
      clinicIcon="admin_panel_settings"
      searchPlaceholder="Search staff, modules, audit logs..."
      liveSyncLabel="System Live"
      notificationCount={1}
      navSections={NAV_SECTIONS}
      contextLabel="Admin Control Center"
      contextIcon="admin_panel_settings"
    >
      <div className="flex flex-col space-y-gutter-desktop">

        <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-lg rounded-2xl" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div>
            <h1 className="font-heading text-headline-lg text-on-surface font-semibold">Admin Dashboard</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Cliniva OS — St. Jude Medical Center • Enterprise Suite</p>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="px-space-md py-space-sm bg-surface-container-low rounded-xl border border-outline-variant/30">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Current Plan</p>
              <p className="text-label-md text-primary font-bold">Premium Tier</p>
            </div>
            <button className="btn-primary"><span className="material-symbols-outlined text-[18px]">upgrade</span> Upgrade Plan</button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <KPICard title="Active Staff"     value={47}  icon="manage_accounts" trend="3 pending approvals" trendDir="neutral" />
          <KPICard title="Active Modules"   value={6}   icon="apps"            trend="8 available"         trendDir="neutral" subtitle="2 locked" />
          <KPICard title="Patients (Month)" value={1248} icon="group"           trend="+12% vs last month"  trendDir="up" />
          <KPICard title="Uptime"           value="99.9%" icon="cloud_done"    trend="Last 30 days"        trendDir="up" />
        </section>

        {/* Module Control Center */}
        <section className="clinical-card">
          <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
            <div className="flex items-center gap-space-sm">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">Module Control Center</h3>
              <LiveIndicator size="sm" />
            </div>
            <p className="text-body-sm text-on-surface-variant">Changes take effect immediately via <code className="text-primary">clinic_settings</code></p>
          </div>
          <div className="p-space-md grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {MODULES.map(mod => (
              <div key={mod.key} className={`p-space-md rounded-xl border transition-all ${
                mod.enabled ? 'bg-surface-container-lowest border-outline-variant/30' : 'bg-surface-container-low border-dashed border-outline-variant/40 opacity-70'
              }`}>
                <div className="flex items-start justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-secondary-fixed/40 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">{mod.icon}</span>
                  </div>
                  {mod.tier === 'enterprise' && !mod.enabled ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-surface-container rounded-full">
                      <span className="material-symbols-outlined text-on-surface-variant text-[14px]">lock</span>
                      <span className="text-label-sm text-on-surface-variant">Enterprise</span>
                    </div>
                  ) : (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={mod.enabled} className="sr-only peer" />
                      <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                    </label>
                  )}
                </div>
                <p className="text-label-md text-on-surface font-semibold">{mod.label}</p>
                <p className="text-body-sm text-on-surface-variant capitalize mt-0.5">{mod.tier} tier</p>
                {mod.enabled && <div className="flex items-center gap-1 mt-space-sm"><span className="w-1.5 h-1.5 rounded-full bg-status-success" /><span className="text-body-sm text-status-success">Active</span></div>}
              </div>
            ))}
          </div>
        </section>

        {/* Staff Management + Audit Log */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-md">
          <div className="clinical-card">
            <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">Staff Directory</h3>
              <button className="btn-primary py-1 px-space-md text-label-sm"><span className="material-symbols-outlined text-[16px]">person_add</span> Add Staff</button>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {[
                { name: 'Dr. Sarah Jenkins', role: 'Doctor',      dept: 'Cardiology',   status: 'active' },
                { name: 'Nurse Rachel Kim',  role: 'Nurse',       dept: 'Ward A',       status: 'active' },
                { name: 'James Okoro',       role: 'Pharmacist',  dept: 'Pharmacy',     status: 'active' },
                { name: 'Meena Pillai',      role: 'Lab Tech',    dept: 'Clinical Lab', status: 'on-leave' },
                { name: 'Tom Harrington',    role: 'Front Desk',  dept: 'OPD',          status: 'active' },
              ].map(staff => (
                <div key={staff.name} className="flex items-center justify-between px-space-md py-space-sm hover:bg-surface-container-low/50 transition-colors">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-label-md flex-shrink-0">{staff.name.charAt(0)}</div>
                    <div>
                      <p className="text-label-md text-on-surface">{staff.name}</p>
                      <p className="text-body-sm text-on-surface-variant">{staff.role} • {staff.dept}</p>
                    </div>
                  </div>
                  <StatusBadge variant={staff.status === 'active' ? 'routine' : 'warning'} label={staff.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="clinical-card flex flex-col">
            <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">Audit Log</h3>
              <StatusBadge variant="info" label="HIPAA" />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
              {[
                { user: 'Dr. Jenkins',   action: 'Accessed patient record', resource: 'Marcus Delacroix', time: '09:14 AM' },
                { user: 'James Okoro',   action: 'Dispensed prescription',  resource: 'RX-8801',          time: '09:02 AM' },
                { user: 'Nurse Kim',     action: 'Recorded vitals',         resource: 'Bed A-01',         time: '08:45 AM' },
                { user: 'Tom Harrington', action: 'Registered patient',     resource: 'MRN-00612482',     time: '08:30 AM' },
                { user: 'System',        action: 'Backup completed',        resource: 'tenant_db',        time: '03:00 AM' },
              ].map((log, i) => (
                <div key={i} className="px-space-md py-space-sm hover:bg-surface-container-low/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <p className="text-label-md text-on-surface">{log.user}</p>
                    <span className="text-label-sm text-on-surface-variant flex-shrink-0 ml-2">{log.time}</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{log.action} — <span className="text-primary font-medium">{log.resource}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TODO: [STRIPE] Module control should check plan tier against clinic_settings before allowing toggle */}
        {/* TODO: [HIPAA] Audit log must be write-only via database trigger — no manual edits allowed */}
      </div>
    </DashboardShell>
  )
}
