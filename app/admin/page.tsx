import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

const NAV_SECTIONS = [
  {
    label: 'Administration',
    items: [
      { label: 'Dashboard',        href: '/admin',              icon: 'space_dashboard' },
      { label: 'Staff Management', href: '/admin/staff',        icon: 'manage_accounts' },
      { label: 'Departments',      href: '/admin/departments',  icon: 'domain' },
      { label: 'Analytics',        href: '/admin/analytics',    icon: 'bar_chart' },
      { label: 'Audit Logs',       href: '/admin/audit',        icon: 'receipt_long' },
      { label: 'Settings',         href: '/admin/settings',     icon: 'settings' },
    ],
  },
]

export const metadata = { title: 'Admin & Hospital Management' }

export default async function AdminDashboard() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') redirect('/login')
  const userName = session?.user?.user_metadata?.display_name ?? 'Administrator'
  const userMeta = session?.user?.user_metadata || {}
  const assignedRoles = (Array.isArray(userMeta.roles) && userMeta.roles.length > 0)
    ? userMeta.roles
    : (userMeta.role ? [userMeta.role] : ['admin'])

  return (
    <DashboardShell
      role="admin"
      roleLabel="Hospital Admin"
      userName={userName}
      assignedRoles={assignedRoles}
      clinicName="St. Jude Medical Center"
      clinicIcon="admin_panel_settings"
      searchPlaceholder="Search staff, departments, audit logs..."
      liveSyncLabel="System Operational"
      notificationCount={1}
      navSections={NAV_SECTIONS}
      contextLabel="Hospital Operations"
      contextIcon="admin_panel_settings"
    >
      <div className="flex flex-col space-y-4">
        {/* Clean Hospital Admin Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Hospital Administration</h1>
            <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mt-0.5">
              St. Jude Medical Center • Staff Governance & System Operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/staff"
              className="btn-primary py-2 px-4 text-xs font-semibold"
            >
              <ClinivaIcon name="person_add" size={18} strokeWidth={1.5} />
              <span>Add Staff</span>
            </Link>
            <Link
              href="/admin/settings"
              className="btn-secondary py-2 px-3 text-xs"
            >
              <ClinivaIcon name="settings" size={18} strokeWidth={1.5} />
              <span>Settings</span>
            </Link>
          </div>
        </section>

        {/* Compact KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            title="Active Staff"
            value={47}
            icon="manage_accounts"
            trend="3 pending approval"
            trendDir="neutral"
          />
          <KPICard
            title="Departments"
            value={6}
            icon="domain"
            trend="All operational"
            trendDir="up"
          />
          <KPICard
            title="Monthly Patients"
            value={1248}
            icon="group"
            trend="+12% this month"
            trendDir="up"
          />
          <KPICard
            title="System Health"
            value="99.9%"
            icon="cloud_done"
            trend="HIPAA Verified"
            trendDir="up"
          />
        </section>

        {/* Main Grid: Staff Directory & Audit Trail */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Staff Directory Table */}
          <div className="xl:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/40">
              <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">Staff Directory</h3>
              <Link href="/admin/staff" className="text-xs font-semibold text-primary hover:underline">
                View All (47) →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/20 text-[#4A5D6B] dark:text-[#9FB1C0] text-[11px] font-bold uppercase tracking-wider">
                    <th className="px-4 py-2.5 font-bold">Staff Member</th>
                    <th className="px-4 py-2.5 font-bold">Role</th>
                    <th className="px-4 py-2.5 font-bold">Department</th>
                    <th className="px-4 py-2.5 font-bold">Status</th>
                    <th className="px-4 py-2.5 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {[
                    { name: 'Dr. Sarah Jenkins', role: 'Doctor',      dept: 'Cardiology',   status: 'active' },
                    { name: 'Nurse Rachel Kim',  role: 'Nurse',       dept: 'Ward A',       status: 'active' },
                    { name: 'James Okoro',       role: 'Pharmacist',  dept: 'Pharmacy',     status: 'active' },
                    { name: 'Meena Pillai',      role: 'Lab Tech',    dept: 'Clinical Lab', status: 'on-leave' },
                    { name: 'Tom Harrington',    role: 'Front Desk',  dept: 'OPD',          status: 'active' },
                  ].map((staff) => (
                    <tr key={staff.name} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-sm text-[#123047] dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                            {staff.name.charAt(0)}
                          </div>
                          <span>{staff.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                        {staff.role}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                        {staff.dept}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge
                          variant={staff.status === 'active' ? 'routine' : 'warning'}
                          label={staff.status.toUpperCase()}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          href="/admin/staff"
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/40">
              <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">System Audit Trail</h3>
              <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                HIPAA Compliant
              </span>
            </div>
            <div className="divide-y divide-outline-variant/10 text-xs p-2 flex-1">
              {[
                { user: 'Dr. Jenkins',   action: 'Accessed record',   resource: 'Marcus Delacroix', time: '09:14 AM' },
                { user: 'James Okoro',   action: 'Dispensed Rx',      resource: 'RX-8801',          time: '09:02 AM' },
                { user: 'Nurse Kim',     action: 'Recorded vitals',   resource: 'Bed A-01',         time: '08:45 AM' },
                { user: 'Tom Harrington', action: 'Registered patient', resource: 'MRN-00612482',   time: '08:30 AM' },
                { user: 'System',        action: 'Database sync',     resource: 'Encrypted Cloud',  time: '03:00 AM' },
              ].map((log, i) => (
                <div key={i} className="p-2.5 hover:bg-surface-container-low/40 rounded-lg transition-colors">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-sm text-[#123047] dark:text-white">{log.user}</p>
                    <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-mono font-medium">{log.time}</span>
                  </div>
                  <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mt-0.5">
                    {log.action}: <span className="text-[#0F8B8D] dark:text-[#28B5B7] font-semibold">{log.resource}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-outline-variant/20 bg-surface-container-low/20">
              <Link
                href="/admin/audit"
                className="btn-secondary justify-center w-full py-1.5 text-xs font-semibold"
              >
                <span>Full Audit Log</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
