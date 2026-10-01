'use client'

import React, { useState } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'

type Props = {
  slug: string
  userName: string
}

const SAMPLE_MODULES = [
  { key: 'doctor', name: 'Doctor Clinical Workspace', desc: 'Electronic health records, OPD consults, clinical charts', enabled: true },
  { key: 'front-desk', name: 'Front Desk & OPD Registration', desc: 'Patient check-in, token generation, queue manager', enabled: true },
  { key: 'nursing', name: 'Nursing / IP Ward Operations', desc: 'Bed board allocation, vitals observation, MAR sheet', enabled: true },
  { key: 'pharmacy', name: 'Central Pharmacy & Formulary', desc: 'Prescription dispensing, batch inventory, drug expiry', enabled: true },
  { key: 'lab', name: 'Pathology & Diagnostic Laboratory', desc: 'Analyzer accessioning, test order queuing, HL7 sync', enabled: true },
  { key: 'billing', name: 'Billing, POS & Cashier Counter', desc: 'Patient invoicing, receipt printing, TPA insurance', enabled: true },
  { key: 'canteen', name: 'Canteen & Clinical Dietary', desc: 'Dietary meal schedules, inpatient nutrition, pos café', enabled: true },
  { key: 'portal', name: 'Patient Mobile Health Portal', desc: 'Token tracking, e-prescriptions, lab report download', enabled: true },
]

const SAMPLE_STAFF = [
  { id: 'STJ-DOC-01', name: 'Dr. Sarah Jenkins, MD', role: 'Doctor / Physician', dept: 'Cardiology', email: 's.jenkins@stjude.org', status: 'Active' },
  { id: 'STJ-REC-01', name: 'Elena Rostova', role: 'Front Desk Reception', dept: 'OPD Reception', email: 'e.rostova@stjude.org', status: 'Active' },
  { id: 'STJ-NUR-01', name: 'Nurse Priya Sharma, RN', role: 'Head Ward Nurse', dept: 'Ward A (Medical)', email: 'p.sharma@stjude.org', status: 'Active' },
  { id: 'STJ-PHA-01', name: 'Marcus Vance, PharmD', role: 'Chief Pharmacist', dept: 'Central Pharmacy', email: 'm.vance@stjude.org', status: 'Active' },
  { id: 'STJ-LAB-01', name: 'David Kalu, MLS', role: 'Senior Lab Technologist', dept: 'Pathology & Chemistry', email: 'd.kalu@stjude.org', status: 'Active' },
  { id: 'STJ-BIL-01', name: 'Hannah Brooks', role: 'Cashier / Billing Specialist', dept: 'Revenue Cycle', email: 'h.brooks@stjude.org', status: 'Active' },
  { id: 'STJ-ADM-01', name: 'Alexander Sterling', role: 'Hospital Administrator', dept: 'Executive Operations', email: 'a.sterling@stjude.org', status: 'Active' },
  { id: 'STJ-CAN-01', name: 'Chef Marco Rossi', role: 'Dietary Manager', dept: 'Canteen & Kitchen', email: 'm.rossi@stjude.org', status: 'Active' },
]

export default function AdminSubScreens({ slug, userName }: Props) {
  const [modules, setModules] = useState(SAMPLE_MODULES)

  const toggleModule = (key: string) => {
    setModules(prev => prev.map(m => m.key === key ? { ...m, enabled: !m.enabled } : m))
  }

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      {/* ── 1. MODULE CONTROL ── */}
      {slug === 'modules' && (
        <>
          <SubScreenHeader
            parentLabel="Administration"
            parentHref="/admin"
            title="Cliniva OS Modular Feature Switcher"
            badge="8/8 Active"
            description="Enable or disable modular subsystems dynamically across the hospital campus without server reboots."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((m) => (
              <div key={m.key} className="p-5 bg-white rounded-xl border border-border-subtle shadow-sm flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-primary-navy text-body-md">{m.name}</h3>
                  <p className="text-body-sm text-secondary-text mt-1">{m.desc}</p>
                  <span className={`inline-block mt-3 px-2.5 py-0.5 rounded-full text-label-sm font-semibold border ${
                    m.enabled ? 'bg-[#EBF7F2] text-[#2E7D5B] border-[#C3ECD8]' : 'bg-slate-100 text-secondary-text border-border-subtle'
                  }`}>
                    {m.enabled ? 'Module Enabled' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={() => toggleModule(m.key)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    m.enabled ? 'bg-medical-teal' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    m.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 2. STAFF MANAGEMENT ── */}
      {slug === 'staff' && (
        <>
          <SubScreenHeader
            parentLabel="Administration"
            parentHref="/admin"
            title="Hospital Staff & Credential Directory"
            badge="48 Staff Members"
            description="Manage clinical staff, role-based access control (RBAC), department transfers, and active account status."
          />

          <div className="bg-white rounded-xl border border-border-subtle overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="px-5 py-3">Employee ID</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {SAMPLE_STAFF.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#123047] dark:text-white">{s.id}</td>
                      <td className="px-5 py-3.5 font-semibold text-sm text-[#123047] dark:text-white">{s.name}</td>
                      <td className="px-5 py-3.5 text-xs text-[#0F8B8D] dark:text-[#28B5B7] font-semibold">{s.role}</td>
                      <td className="px-5 py-3.5 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{s.dept}</td>
                      <td className="px-5 py-3.5 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{s.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF7F2] text-[#2E7D5B] border border-[#C3ECD8]">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 3. DEPARTMENTS ── */}
      {slug === 'departments' && (
        <>
          <SubScreenHeader
            parentLabel="Administration"
            parentHref="/admin"
            title="Hospital Clinical Departments"
            badge="12 Active Departments"
            description="Organizational structure, department heads, and physical block locations across St. Jude Medical Center."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Cardiovascular Medicine', head: 'Dr. Sarah Jenkins, MD', loc: 'West Campus • Suite 300-315', staff: 14 },
              { name: 'General Medicine & OPD', head: 'Dr. Alan Bradley, MD', loc: 'Ground Pavilion • Area B', staff: 22 },
              { name: 'Pediatrics & Neonatal', head: 'Dr. Emily Watson, MD', loc: 'East Wing • Level 2', staff: 18 },
              { name: 'Orthopedics & Joint Care', head: 'Dr. Rajesh Patel, MD', loc: 'West Campus • Suite 320', staff: 12 },
              { name: 'Diagnostic Pathology & Lab', head: 'Dr. Helen Frost, MD', loc: 'Sub-Level 1 • Core Lab', staff: 9 },
              { name: 'Inpatient Nursing Service', head: 'Nurse Priya Sharma, RN', loc: 'Main Tower • Wards A & B', staff: 35 },
            ].map((d) => (
              <div key={d.name} className="p-5 bg-white rounded-xl border border-border-subtle shadow-sm space-y-2">
                <h3 className="font-bold text-sm text-[#123047] dark:text-white">{d.name}</h3>
                <div className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] space-y-0.5">
                  <div>HOD: <strong className="text-[#0F8B8D] dark:text-[#28B5B7] font-semibold">{d.head}</strong></div>
                  <div>Location: {d.loc}</div>
                  <div className="text-[#123047] dark:text-white mt-1 font-semibold">{d.staff} Assigned Personnel</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 4. ANALYTICS ── */}
      {slug === 'analytics' && (
        <>
          <SubScreenHeader
            parentLabel="Administration"
            parentHref="/admin"
            title="Hospital Operational Analytics & KPIs"
            badge="Real-time Metrics"
            description="Executive clinical indicators, bed turnover rates, outpatient throughput, and patient wait times."
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D6B] dark:text-[#9FB1C0]">Bed Occupancy Rate</span>
              <div className="text-2xl font-bold text-[#123047] dark:text-white font-mono mt-1">75.0%</div>
              <span className="text-xs text-[#2E7D5B] font-semibold">6 of 8 Active Beds</span>
            </div>
            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D6B] dark:text-[#9FB1C0]">Daily OPD Footfall</span>
              <div className="text-2xl font-bold text-[#0F8B8D] dark:text-[#28B5B7] font-mono mt-1">47</div>
              <span className="text-xs text-[#2E7D5B] font-semibold">+12% vs last week</span>
            </div>
            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D6B] dark:text-[#9FB1C0]">Avg Wait to Consult</span>
              <div className="text-2xl font-bold text-[#123047] dark:text-white font-mono mt-1">18m</div>
              <span className="text-xs text-[#2E7D5B] font-semibold">Within target (&lt;20m)</span>
            </div>
            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D6B] dark:text-[#9FB1C0]">Daily Cash Collection</span>
              <div className="text-2xl font-bold text-[#2E7D5B] font-mono mt-1">$6,840</div>
              <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">98.5% reconciliation</span>
            </div>
          </div>
        </>
      )}

      {/* ── 5. AUDIT LOGS ── */}
      {slug === 'audit' && (
        <>
          <SubScreenHeader
            parentLabel="Administration"
            parentHref="/admin"
            title="HIPAA & Clinical Compliance Audit Trail"
            badge="Tamper-Evident"
            description="Immutable log of all user authentication events, patient health record views, and prescription changes."
          />

          <div className="bg-white rounded-xl border border-border-subtle overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Resource</th>
                    <th className="px-5 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {[
                    { time: '10:42:15 AM', user: 'Dr. Sarah Jenkins', action: 'VIEW_RECORD', res: 'Patient #00482910 (Delacroix)', ip: '192.168.1.45' },
                    { time: '10:38:02 AM', user: 'Nurse Priya Sharma', action: 'RECORD_VITALS', res: 'Patient #00482910 (Delacroix)', ip: '192.168.1.88' },
                    { time: '10:15:40 AM', user: 'Marcus Vance, PharmD', action: 'DISPENSE_RX', res: 'Prescription #RX-4088', ip: '192.168.1.102' },
                    { time: '09:55:12 AM', user: 'Elena Rostova', action: 'GENERATE_TOKEN', res: 'OPD Queue Token #12', ip: '192.168.1.20' },
                    { time: '08:00:00 AM', user: 'Alexander Sterling', action: 'USER_LOGIN', res: 'Session Initiated', ip: '192.168.1.10' },
                  ].map((a, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{a.time}</td>
                      <td className="px-5 py-3 font-semibold text-sm text-[#123047] dark:text-white font-sans">{a.user}</td>
                      <td className="px-5 py-3 font-bold text-xs text-[#0F8B8D] dark:text-[#28B5B7]">{a.action}</td>
                      <td className="px-5 py-3 font-medium text-[13px] text-[#253848] dark:text-[#D9E5F0]">{a.res}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{a.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 6. SUBSCRIPTION ── */}
      {slug === 'subscription' && (
        <>
          <SubScreenHeader
            parentLabel="Administration"
            parentHref="/admin"
            title="Cliniva OS Enterprise Subscription"
            badge="Enterprise Tier"
            badgeVariant="live"
            description="Multi-tenant cloud infrastructure license, active clinic nodes, and automated encrypted backup."
          />

          <div className="bg-white rounded-xl border border-border-subtle p-6 shadow-sm space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-headline-sm text-primary-navy">St. Jude Medical Center</h3>
                <p className="text-body-sm text-secondary-text">Tenant ID: c0000000-0000-0000-0000-000000000001</p>
              </div>
              <span className="px-3 py-1 rounded-full text-label-sm font-semibold bg-[#EBF7F2] text-[#2E7D5B] border border-[#C3ECD8]">
                Active & Healthy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border-subtle">
              <div className="p-3 bg-slate-50 rounded-xl border border-border-subtle">
                <span className="text-label-sm text-secondary-text">User Seats</span>
                <div className="font-bold text-primary-navy font-mono">48 / Unlimited</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-border-subtle">
                <span className="text-label-sm text-secondary-text">Cloud Storage</span>
                <div className="font-bold text-primary-navy font-mono">14.2 GB / 500 GB</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-border-subtle">
                <span className="text-label-sm text-secondary-text">Latest Backup</span>
                <div className="font-bold text-medical-teal font-mono">Today 04:00 AM</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 7. SETTINGS ── */}
      {slug === 'settings' && (
        <>
          <SubScreenHeader
            parentLabel="Administration"
            parentHref="/admin"
            title="Hospital System Settings"
            description="Hospital identity, timezone settings, and emergency disaster recovery codes."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4 max-w-2xl">
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Hospital Name</label>
              <input type="text" defaultValue="St. Jude Medical Center" className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm" />
            </div>
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Hospital Timezone</label>
              <input type="text" defaultValue="America/New_York (EST)" className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm" />
            </div>
            <button className="btn-primary">Update System Parameters</button>
          </div>
        </>
      )}
    </div>
  )
}
