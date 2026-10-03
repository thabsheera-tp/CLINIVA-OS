'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import ClinivaIcon from '@/components/ui/ClinivaIcon'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import StartConsultationModal from '@/components/modals/StartConsultationModal'
import RegisterPatientModal from '@/components/modals/RegisterPatientModal'
import RecordVitalsModal from '@/components/modals/RecordVitalsModal'
import { SkeletonRow, SkeletonCard } from '@/components/ui/LoadingSkeleton'
import {
  usePatients,
  useTodayAppointments,
  usePendingLabOrders,
  useActivePrescriptions,
} from '@/hooks/useClinicData'

type Props = {
  slug: string
  userName: string
}

// ─── Shared inline components ─────────────────────────────────────────────────

function DataError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/20 text-body-sm text-on-surface-variant">
      <span>{message}</span>
      <button onClick={retry} className="text-primary font-semibold text-label-sm hover:underline">Retry</button>
    </div>
  )
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <tbody className="divide-y divide-outline-variant/20">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="skeleton h-3 rounded w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DoctorSubScreens({ slug, userName }: Props) {
  const { queue, callNextPatient, setConsultOpen, setVitalsOpen } = useClinicRealtime()
  const [searchTerm, setSearchTerm] = useState('')

  // ── Real data hooks ──
  const patients = usePatients(slug === 'patients' ? searchTerm : '')
  const appointments = useTodayAppointments()
  const labOrders = usePendingLabOrders()
  const prescriptions = useActivePrescriptions()

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      <StartConsultationModal />
      <RegisterPatientModal />
      <RecordVitalsModal />

      {/* ── 1. PATIENTS DIRECTORY ── */}
      {slug === 'patients' && (
        <>
          <SubScreenHeader
            parentLabel="Doctor Workspace"
            parentHref="/doctor"
            title="Patient Master Registry"
            badge={patients.loading ? '...' : `${patients.data.length} Records`}
            description="Complete clinical patient registry across Outpatient & Inpatient departments."
            actions={
              <button onClick={() => setConsultOpen(true)} className="btn-primary flex items-center gap-2">
                <ClinivaIcon name="add" size={16} strokeWidth={1.5} />
                <span>Open Clinical Chart</span>
              </button>
            }
          />

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-border-subtle dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border-subtle dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <ClinivaIcon name="search" size={16} strokeWidth={1.5} className="absolute left-3 top-2.5 text-secondary-text dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, MRN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50/70 dark:bg-slate-800 rounded-xl text-body-sm text-primary-text dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-teal/20 border border-border-subtle dark:border-slate-700 focus:border-medical-teal"
                />
              </div>
              <div className="flex items-center gap-2 text-label-sm text-secondary-text">
                <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-primary-navy dark:text-slate-100 border border-transparent dark:border-slate-700">All Patients</span>
              </div>
            </div>

            {patients.error && (
              <div className="p-4"><DataError message="Could not load patients." retry={patients.refetch} /></div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-label-sm text-secondary-text dark:text-slate-400 uppercase tracking-wider border-b border-border-subtle dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Patient / MRN</th>
                    <th className="px-5 py-3">Gender</th>
                    <th className="px-5 py-3">Date of Birth</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                {patients.loading ? (
                  <TableSkeleton rows={6} cols={5} />
                ) : (
                  <tbody className="divide-y divide-border-subtle dark:divide-slate-800">
                    {patients.data.length === 0 && !patients.error && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-secondary-text dark:text-slate-400 text-body-sm">
                          No patients found{searchTerm ? ` matching "${searchTerm}"` : ''}. {' '}
                          <button onClick={patients.refetch} className="text-medical-teal hover:underline font-medium">Refresh</button>
                        </td>
                      </tr>
                    )}
                    {patients.data.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-primary-navy dark:text-slate-100">{p.first_name} {p.last_name}</div>
                          <div className="text-label-sm text-secondary-text dark:text-slate-400 font-mono">MRN #{p.mrn}</div>
                        </td>
                        <td className="px-5 py-3.5 text-secondary-text dark:text-slate-300 font-medium capitalize">{p.gender}</td>
                        <td className="px-5 py-3.5 text-secondary-text dark:text-slate-300">{p.dob}</td>
                        <td className="px-5 py-3.5 text-secondary-text dark:text-slate-300">{p.phone}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/doctor/patients/${p.mrn}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-medical-teal hover:text-white dark:hover:bg-teal-600 text-label-sm font-semibold text-primary-navy dark:text-slate-100 transition-colors inline-block border border-transparent dark:border-slate-700"
                          >
                            View Chart
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 2. APPOINTMENTS ── */}
      {slug === 'appointments' && (
        <>
          <SubScreenHeader
            parentLabel="Doctor Workspace"
            parentHref="/doctor"
            title="Today's Consultation Schedule"
            badge={appointments.loading ? '...' : `${appointments.data.length} Scheduled`}
            description="Chronological schedule of confirmed appointments and follow-up slots."
            actions={
              <>
                <Link href="/doctor/appointments/new" className="btn-primary flex items-center gap-2">
                  <ClinivaIcon name="add" size={16} strokeWidth={1.5} />
                  <span>Book New</span>
                </Link>
                <button onClick={() => callNextPatient()} className="btn-secondary flex items-center gap-2">
                  <ClinivaIcon name="play_arrow" size={16} strokeWidth={1.5} />
                  <span>Call Next Slot</span>
                </button>
              </>
            }
          />

          {appointments.error && <DataError message="Could not load appointments." retry={appointments.refetch} />}

          {appointments.loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : appointments.data.length === 0 ? (
            <div className="text-center py-16 text-secondary-text text-body-sm">
              <ClinivaIcon name="calendar_today" size={40} strokeWidth={1.5} className="mx-auto block mb-2 text-secondary-text" />
              No appointments scheduled for today.
              <Link href="/doctor/appointments/new" className="text-medical-teal hover:underline ml-1 font-medium">Book one now →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {appointments.data.map((apt) => {
                const time = new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={apt.id} className="p-4 bg-white dark:bg-slate-800/90 rounded-xl border border-border-subtle dark:border-slate-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border-subtle dark:border-slate-700 flex flex-col items-center justify-center text-primary-navy dark:text-slate-100 flex-shrink-0 tabular-nums">
                        <span className="text-label-sm font-bold">{time}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-primary-navy dark:text-slate-100 text-body-md">Token #{apt.queue_token}</div>
                        <div className="text-body-sm text-secondary-text dark:text-slate-400 mt-0.5">{apt.chief_complaint ?? 'General consultation'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <StatusBadge
                        variant={apt.status === 'in_progress' ? 'warning' : apt.status === 'checked_in' ? 'critical' : 'routine'}
                        label={apt.status.replace('_', ' ')}
                      />
                      <button onClick={() => setConsultOpen(true)} className="btn-primary text-label-sm px-4 py-2">
                        Consult
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── 3. LIVE OPD QUEUE (uses Realtime context — already live) ── */}
      {slug === 'queue' && (
        <>
          <SubScreenHeader
            parentLabel="Doctor Workspace"
            parentHref="/doctor"
            title="Live OPD Consultation Queue"
            badge={`${queue.length} in Line`}
            badgeVariant="live"
            description="Real-time sequence of checked-in patients waiting for consultation in Suite 304."
            actions={
              <button onClick={() => callNextPatient()} className="btn-primary flex items-center gap-2">
                <ClinivaIcon name="campaign" size={16} strokeWidth={1.5} />
                <span>Call Next Patient</span>
              </button>
            }
          />

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-label-lg font-semibold text-slate-900 dark:text-slate-100">Queue Sequence</span>
              <span className="text-body-sm text-slate-500 dark:text-slate-400">Live telemetry active</span>
            </div>
            <div className="space-y-3">
              {queue.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-navy dark:bg-slate-900 text-white dark:text-teal-300 border border-transparent dark:border-slate-700/80 flex items-center justify-center font-heading font-bold text-headline-sm tabular-nums flex-shrink-0">
                      #{p.token}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                        <span className="text-label-sm text-slate-500 dark:text-slate-400 tabular-nums">({p.age})</span>
                      </div>
                      <p className="text-body-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">{p.complaint}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-label-sm font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 tabular-nums">
                      {p.wait}
                    </span>
                    <button
                      onClick={() => setConsultOpen(true)}
                      className="btn-secondary text-label-sm py-1.5 px-3 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 dark:border-slate-600"
                    >
                      Start Exam
                    </button>
                  </div>
                </div>
              ))}
              {queue.length === 0 && (
                <p className="text-body-sm text-slate-500 dark:text-slate-400 text-center py-8">Queue is empty. All patients have been seen.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── 4. LAB RESULTS ── */}
      {slug === 'lab-results' && (
        <>
          <SubScreenHeader
            parentLabel="Doctor Workspace"
            parentHref="/doctor"
            title="Diagnostic Lab Results Inbox"
            badge={labOrders.loading ? '...' : `${labOrders.data.filter(l => l.is_critical).length} Alerts`}
            badgeVariant="alert"
            description="Recent biochemical, hematological, and pathological test results requiring physician review."
          />

          {labOrders.error && <DataError message="Could not load lab results." retry={labOrders.refetch} />}

          {labOrders.loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {labOrders.data.length === 0 && (
                <div className="text-center py-12 text-secondary-text text-body-sm">
                  <ClinivaIcon name="biotech" size={40} strokeWidth={1.5} className="mx-auto block mb-2 text-secondary-text" />
                  No pending lab results.
                </div>
              )}
              {labOrders.data.map((lab) => (
                <div key={lab.id} className={`p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${lab.is_critical ? 'bg-[#FDF2F2] dark:bg-red-950/30 border-[#F8D7D7] dark:border-red-900/50' : 'bg-white dark:bg-slate-800/90 border-border-subtle dark:border-slate-700/70'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-label-sm font-mono text-secondary-text dark:text-slate-400">{lab.id.slice(0, 12)}</span>
                      {lab.is_critical && <span className="text-label-sm font-bold text-[#C94A4A] bg-[#FCE8E8] dark:bg-red-950/60 border border-[#F8D7D7] dark:border-red-900 px-2 py-0.5 rounded-full">CRITICAL</span>}
                    </div>
                    <div className="text-body-md font-semibold text-primary-navy dark:text-slate-100 mt-1">{lab.test_name}</div>
                    <div className="flex items-center gap-3 text-body-sm mt-1">
                      {lab.result_value && <span>Result: <strong className={lab.is_critical ? 'text-[#C94A4A]' : 'text-primary-text dark:text-slate-100'}>{lab.result_value} {lab.result_unit}</strong></span>}
                      {lab.reference_range && <span className="text-secondary-text dark:text-slate-400">Ref: {lab.reference_range}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-label-sm font-semibold border ${lab.is_critical ? 'bg-[#FDF2F2] dark:bg-red-950/50 text-[#C94A4A] border-[#F8D7D7] dark:border-red-900/50' : 'bg-[#EBF7F2] dark:bg-emerald-950/40 text-[#2E7D5B] dark:text-emerald-300 border-[#C3ECD8] dark:border-emerald-800/50'}`}>
                      {lab.status}
                    </span>
                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-label-sm font-semibold text-primary-navy dark:text-slate-100 transition-colors">
                      Sign & Acknowledge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── 5. PRESCRIPTIONS ── */}
      {slug === 'prescriptions' && (
        <>
          <SubScreenHeader
            parentLabel="Doctor Workspace"
            parentHref="/doctor"
            title="e-Prescription Management"
            badge={prescriptions.loading ? '...' : `${prescriptions.data.length} Active Rx`}
            description="Manage electronic prescriptions, drug dosages, and outpatient pharmacy dispatches."
            actions={
              <button onClick={() => setConsultOpen(true)} className="btn-primary flex items-center gap-2">
                <ClinivaIcon name="add" size={16} strokeWidth={1.5} />
                <span>Issue New Rx</span>
              </button>
            }
          />

          {prescriptions.error && <DataError message="Could not load prescriptions." retry={prescriptions.refetch} />}

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-border-subtle dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-label-sm text-secondary-text dark:text-slate-400 uppercase tracking-wider border-b border-border-subtle dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Prescription ID</th>
                    <th className="px-5 py-3">Medication & Dosage</th>
                    <th className="px-5 py-3">Frequency</th>
                    <th className="px-5 py-3">Qty / Refills</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                {prescriptions.loading ? (
                  <TableSkeleton rows={5} cols={6} />
                ) : (
                  <tbody className="divide-y divide-border-subtle dark:divide-slate-800">
                    {prescriptions.data.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-secondary-text dark:text-slate-400 text-body-sm">No active prescriptions found.</td>
                      </tr>
                    )}
                    {prescriptions.data.map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-secondary-text dark:text-slate-400 font-medium">{rx.id.slice(0, 12)}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-primary-navy dark:text-slate-100">{rx.drug_name}</div>
                          <div className="text-label-sm text-secondary-text dark:text-slate-400">{rx.dose}</div>
                        </td>
                        <td className="px-5 py-3.5 text-secondary-text dark:text-slate-400">{rx.frequency}</td>
                        <td className="px-5 py-3.5 text-primary-text dark:text-slate-200">{rx.quantity} (Refills: {rx.refills})</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold border ${rx.status === 'active' ? 'bg-[#EBF7F2] dark:bg-emerald-950/40 text-[#2E7D5B] dark:text-emerald-300 border-[#C3ECD8] dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-800 text-secondary-text dark:text-slate-400 border-border-subtle dark:border-slate-700'}`}>
                            {rx.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-label-sm font-semibold text-primary-navy dark:text-slate-100 transition-colors">
                            Print Rx
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 6. MESSAGES (non-db, clinical notifications) ── */}
      {slug === 'messages' && (
        <>
          <SubScreenHeader
            parentLabel="Doctor Workspace"
            parentHref="/doctor"
            title="Clinical Inter-Department Messages"
            badge="4 Unread"
            description="Secure communication channels between physicians, ward nurses, lab techs, and pharmacy."
          />

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-border-subtle dark:border-slate-800 p-5 shadow-sm space-y-4">
            {[
              { sender: 'Nurse Priya Sharma (Ward A)', time: '12m ago', text: 'Bed A-01 patient reported mild dizziness after morning medication. Vitals logged.', unread: true },
              { sender: 'David Kalu (Central Lab)', time: '40m ago', text: 'Critical lab alert: Troponin sample verified at 0.04 ng/mL — requires physician acknowledgement.', unread: true },
              { sender: 'Marcus Vance (Pharmacy)', time: '2h ago', text: 'Alternative brand dispensed for Atorvastatin 40mg due to primary stock lot rotation.', unread: false },
              { sender: 'OPD Reception', time: '3h ago', text: 'Patient checked in for routine diabetes review. Token issued.', unread: false },
            ].map((msg, i) => (
              <div key={i} className={`p-4 rounded-xl border ${msg.unread ? 'bg-[#F2F9F9] dark:bg-teal-950/30 border-[#D1ECEB] dark:border-teal-900/50' : 'bg-slate-50/60 dark:bg-slate-800/80 border-border-subtle dark:border-slate-700'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-primary-navy dark:text-slate-100 text-body-md">{msg.sender}</span>
                  <span className="text-label-sm text-secondary-text dark:text-slate-400">{msg.time}</span>
                </div>
                <p className="text-body-sm text-secondary-text dark:text-slate-300">{msg.text}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 7. SETTINGS ── */}
      {slug === 'settings' && (
        <>
          <SubScreenHeader
            parentLabel="Doctor Workspace"
            parentHref="/doctor"
            title="Clinical Workspace Settings"
            description="Configure room preferences, e-signature, consultation slot duration, and telemetry alert rules."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-6 max-w-3xl">
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-headline-sm text-on-surface">Consultation Room Setup</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant font-medium block mb-1">Assigned Exam Suite</label>
                  <input type="text" defaultValue="Suite 304 - Exam B" className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-sm font-medium" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant font-medium block mb-1">Slot Duration</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-sm font-medium">
                    <option value="10">10 Minutes per patient</option>
                    <option value="15" selected>15 Minutes per patient</option>
                    <option value="30">30 Minutes per patient</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 space-y-3">
              <h3 className="font-heading font-semibold text-headline-sm text-on-surface">Clinical Alerts & Notifications</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
                <span className="text-body-sm text-on-surface">Instant alert sound on critical lab results (Troponin, Potassium)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
                <span className="text-body-sm text-on-surface">Auto-call next patient when consultation note is finalized</span>
              </label>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
              <button className="btn-primary">Save Preferences</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
