'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import StartConsultationModal from '@/components/modals/StartConsultationModal'
import RegisterPatientModal from '@/components/modals/RegisterPatientModal'
import RecordVitalsModal from '@/components/modals/RecordVitalsModal'
import QuickActionBar from '@/components/dashboard/QuickActionBar'
import LiveQueueTimePredictor from '@/components/dashboard/LiveQueueTimePredictor'

type Props = {
  userName: string
}

export default function DoctorDashboardView({ userName }: Props) {
  const {
    queue,
    activePatient,
    vitals,
    callNextPatient,
    setConsultOpen,
    setRegisterOpen,
    setVitalsOpen,
  } = useClinicRealtime()

  const [copiedMRN, setCopiedMRN] = useState(false)
  const [scheduleFilter, setScheduleFilter] = useState<'All' | 'Completed' | 'Upcoming' | 'Telehealth'>('All')
  const [queueViewMode, setQueueViewMode] = useState<'cockpit' | 'predictor'>('cockpit')

  const handleCopyMRN = (mrn: string) => {
    navigator.clipboard?.writeText(mrn)
    setCopiedMRN(true)
    setTimeout(() => setCopiedMRN(false), 2000)
  }

  const waitingPatients = queue.filter((p) => p.status === 'waiting')

  const ALL_SCHEDULE = [
    { time: '08:30', patient: 'Ana García', type: 'Follow-up', status: 'completed' },
    { time: '09:00', patient: activePatient?.name ?? 'Marcus Delacroix', type: 'Consultation', status: 'in-progress' },
    { time: '09:45', patient: 'Priya Mehta', type: 'New Patient', status: 'upcoming' },
    { time: '10:30', patient: 'George Tanner', type: 'Telehealth', status: 'upcoming' },
    { time: '11:15', patient: 'Aisha Nkosi', type: 'Follow-up', status: 'upcoming' },
  ]

  const filteredSchedule = ALL_SCHEDULE.filter((row) => {
    if (scheduleFilter === 'All') return true
    if (scheduleFilter === 'Completed') return row.status === 'completed'
    if (scheduleFilter === 'Upcoming') return row.status === 'upcoming' || row.status === 'in-progress'
    if (scheduleFilter === 'Telehealth') return row.type === 'Telehealth'
    return true
  })

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      {/* Modals */}
      <StartConsultationModal />
      <RegisterPatientModal />
      <RecordVitalsModal />

      {/* Quick Actions Shortcuts Bar */}
      <QuickActionBar className="w-full" />

      {/* ── 1. Greeting & Operational Cockpit Header ── */}
      <section
        className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-lg rounded-2xl"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex flex-col space-y-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-label-sm tracking-wider uppercase">
              Cardiovascular Medicine
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Room 304 – Exam B
            </span>
          </div>
          <h1 className="font-heading text-headline-lg text-on-surface tracking-tight">
            Good morning, {userName.split(',')[0]}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            St. Jude Medical Center — West Campus • Shift 08:00 – 17:00
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-space-sm w-full xl:w-auto">
          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-xl">
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
            <div className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant uppercase">Clinic Date</span>
              <span className="text-label-md text-on-surface font-medium">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-xs w-full sm:w-auto">
            <button
              onClick={() => setRegisterOpen(true)}
              className="btn-secondary justify-center touch-tap"
            >
              <span className="material-symbols-outlined text-[18px]">emergency</span>
              <span>+ Emergency Triage</span>
            </button>
            <button
              onClick={() => setVitalsOpen(true)}
              className="btn-secondary justify-center touch-tap"
            >
              <span className="material-symbols-outlined text-[18px]">monitor_heart</span>
              <span>Record Vitals</span>
            </button>
            <button
              onClick={() => setConsultOpen(true)}
              className="btn-primary justify-center touch-tap"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Start Next Consultation</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Four KPI Stat Cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <KPICard
          title="Today's Schedule"
          value={18}
          icon="event_available"
          trend="+8% vs yesterday"
          trendDir="up"
          subtitle="12 done • 6 left"
        />
        <KPICard
          title="Live In Queue"
          value={waitingPatients.length}
          icon="group"
          trend="14m avg wait"
          trendDir="neutral"
          subtitle={`${waitingPatients.length} waiting`}
          live
        />
        <KPICard
          title="Pending Diagnostics"
          value={3}
          icon="biotech"
          trend="2 critical labs"
          trendDir="down"
          subtitle="Urgent review"
        />
        <KPICard
          title="Clinical Inquiries"
          value={4}
          icon="chat"
          trend="1 new urgent"
          trendDir="down"
          subtitle="4 unread"
        />
      </section>

      {/* ── 3. Live Queue & Operational Cockpit Switcher ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline-variant/30">
          <button
            onClick={() => setQueueViewMode('cockpit')}
            className={`px-3 py-1 rounded-lg text-label-sm font-medium transition-all ${
              queueViewMode === 'cockpit'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Clinical Cockpit & Vitals
          </button>
          <button
            onClick={() => setQueueViewMode('predictor')}
            className={`px-3 py-1 rounded-lg text-label-sm font-medium transition-all flex items-center gap-1.5 ${
              queueViewMode === 'predictor'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Queue & Time Predictor
          </button>
        </div>
      </div>

      {queueViewMode === 'predictor' ? (
        <LiveQueueTimePredictor department="All" doctorMode={true} />
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-space-md">
          {/* Active Patient Card */}
          <div className="xl:col-span-2 clinical-card p-space-md flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <LiveIndicator label="In Examination" />
              <StatusBadge variant="warning" label="Ongoing" />
            </div>
            <button
              onClick={() => setConsultOpen(true)}
              className="btn-ghost text-label-sm py-1.5 px-space-md border border-outline-variant/40 hover:border-primary flex items-center gap-1.5 touch-tap"
            >
              <span>Open SOAP Clinical Note (e-Rx)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Patient banner */}
          <div className="flex items-start gap-space-md p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-heading text-headline-sm text-on-surface font-semibold">
                    {activePatient?.name ?? 'Marcus Delacroix'}
                  </h2>
                  <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant flex-wrap mt-0.5">
                    <span>MRN:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyMRN('00482910')}
                      className="inline-flex items-center gap-1 font-mono font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded hover:bg-surface-container-high transition-colors"
                      title="Click to copy Patient MRN"
                    >
                      <span>00482910</span>
                      <span className="material-symbols-outlined text-[13px] text-primary">
                        {copiedMRN ? 'check' : 'content_copy'}
                      </span>
                      {copiedMRN && <span className="text-[10px] text-emerald-600 font-sans">Copied</span>}
                    </button>
                    <span>•</span>
                    <span>{activePatient?.age ?? '54M'}</span>
                    <span>•</span>
                    <span className="font-semibold text-primary">Token #{activePatient?.token ?? 7}</span>
                    <span>•</span>
                    <span>Room 304</span>
                  </div>
                </div>
                <StatusBadge
                  variant={activePatient?.priority === 'emergency' ? 'critical' : 'warning'}
                  label={activePatient?.priority === 'emergency' ? 'Emergency STAT' : 'Hypertension Stage II'}
                  pulse
                />
              </div>
              <p className="text-body-sm text-on-surface-variant mt-2">
                <span className="font-semibold text-on-surface">Chief Complaint:</span>{' '}
                {activePatient?.complaint ?? 'Acute chest tightness, exertional dyspnea since 06:00 AM'}
              </p>
            </div>
          </div>

          {/* Vitals Telemetry Grid (Live Reactivity) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
            {[
              { label: 'Blood Pressure', value: vitals.bp, unit: 'mmHg', icon: 'favorite', normal: '120/80' },
              { label: 'Heart Rate', value: vitals.heartRate, unit: 'bpm', icon: 'ecg_heart', normal: '60-100' },
              { label: 'Oxygen SpO₂', value: vitals.spo2, unit: '%', icon: 'air', normal: '> 95%' },
              { label: 'Temperature', value: `${vitals.temperature}°F`, unit: 'Oral', icon: 'thermometer', normal: '98.6°F' },
            ].map((v) => (
              <div
                key={v.label}
                onClick={() => setVitalsOpen(true)}
                className="flex flex-col items-center justify-center p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/25 gap-1 cursor-pointer hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-150 group active:scale-[0.98]"
                title="Click to update physiological vitals telemetry"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[15px] text-primary">{v.icon}</span>
                  <span>{v.label}</span>
                </div>
                <span className="font-heading text-headline-sm text-on-surface tabular-nums font-mono font-bold tracking-tight">
                  {v.value}
                </span>
                <span className="text-[11px] text-on-surface-variant/70 font-medium">
                  {v.unit} • <span className="text-outline">Ref {v.normal}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Queue List (Live Reactivity) */}
        <div className="clinical-card flex flex-col">
          <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
            <div className="flex items-center gap-space-sm">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">OPD Triage & Patient Flow</h3>
              <LiveIndicator size="sm" />
            </div>
            <span className="text-[11px] bg-primary/15 text-primary border border-primary/25 px-2.5 py-0.5 rounded-full font-bold">
              {waitingPatients.length} Waiting
            </span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/20 max-h-[380px]">
            {waitingPatients.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-body-sm">
                No patients waiting in queue.
              </div>
            ) : (
              waitingPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => callNextPatient()}
                  className="flex items-center gap-space-sm px-space-md py-space-sm hover:bg-surface-container-low transition-colors cursor-pointer group active:scale-[0.99]"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[12px] text-primary font-mono font-bold flex-shrink-0 tabular-nums">
                    #{p.token}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-lg text-on-surface truncate font-semibold">{p.name}</p>
                    <p className="text-body-sm text-on-surface-variant truncate">
                      {p.age} • {p.complaint}
                    </p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[11px] font-mono text-on-surface-variant tabular-nums">{p.wait}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        callNextPatient()
                      }}
                      className="text-primary text-[12px] font-semibold opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-tap flex items-center gap-0.5 mt-0.5"
                    >
                      <span>Call Next</span>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      )}

      {/* ── 4. Daily Ambulatory Schedule ── */}
      <section className="clinical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md border-b border-outline-variant/20 gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
              Daily Ambulatory Schedule
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono font-semibold">
              {filteredSchedule.length} Encounters
            </span>
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto smooth-touch-scroll pb-1 sm:pb-0">
            {(['All', 'Completed', 'Upcoming', 'Telehealth'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setScheduleFilter(f)}
                className={`px-space-md py-1 rounded-full text-label-sm whitespace-nowrap transition-all touch-tap ${
                  scheduleFilter === f
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Schedule Cards (< sm screens) */}
        <div className="block sm:hidden divide-y divide-outline-variant/10 p-2">
          {filteredSchedule.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant text-body-sm">
              No consultations found for filter &quot;{scheduleFilter}&quot;.
            </div>
          ) : (
            filteredSchedule.map((row) => (
              <div key={row.time} className="p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-primary tabular-nums text-label-md">{row.time}</span>
                    <span className="text-outline-variant">•</span>
                    <p className="text-body-md text-on-surface font-semibold">{row.patient}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm text-on-surface-variant">{row.type}</span>
                    <StatusBadge
                      variant={
                        row.status === 'completed'
                          ? 'routine'
                          : row.status === 'in-progress'
                          ? 'warning'
                          : 'neutral'
                      }
                      label={row.status}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setConsultOpen(true)}
                  className="btn-ghost text-label-sm py-1 px-3 touch-tap flex-shrink-0"
                >
                  {row.status === 'completed' ? 'Chart' : 'Start →'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Desktop Schedule Table (sm+ screens) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/30">
                {['Time', 'Patient', 'Type', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-space-md py-space-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredSchedule.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant text-body-sm">
                    No consultations found for filter &quot;{scheduleFilter}&quot;.
                  </td>
                </tr>
              ) : (
                filteredSchedule.map((row) => (
                  <tr key={row.time} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-space-md py-space-sm text-label-lg text-on-surface tabular-nums">
                      {row.time}
                    </td>
                    <td className="px-space-md py-space-sm text-body-md text-on-surface font-medium">
                      {row.patient}
                    </td>
                    <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant">
                      {row.type}
                    </td>
                    <td className="px-space-md py-space-sm">
                      <StatusBadge
                        variant={
                          row.status === 'completed'
                            ? 'routine'
                            : row.status === 'in-progress'
                            ? 'warning'
                            : 'neutral'
                        }
                        label={row.status}
                      />
                    </td>
                    <td className="px-space-md py-space-sm text-right">
                      <button
                        onClick={() => setConsultOpen(true)}
                        className="text-primary text-label-md font-semibold hover:underline touch-tap"
                      >
                        {row.status === 'completed' ? 'View Chart' : 'Start →'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. Diagnostic Alerts ── */}
      <section className="clinical-card">
        <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
              Diagnostic Alerts
            </h3>
            <StatusBadge variant="critical" label="3 Urgent" pulse />
          </div>
          <Link href="/doctor/lab-results" className="btn-ghost text-label-sm py-1 px-space-md hover-lift">
            View All
          </Link>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {[
            {
              patient: 'George Tanner',
              test: 'Serum Potassium',
              value: '6.2 mEq/L',
              ref: 'Ref: 3.5–5.0',
              level: 'critical',
              time: '09:14',
            },
            {
              patient: activePatient?.name ?? 'Marcus Delacroix',
              test: 'Troponin I',
              value: '0.08 ng/mL',
              ref: 'Ref: <0.04',
              level: 'critical',
              time: '08:50',
            },
            {
              patient: 'Ana García',
              test: 'HbA1c',
              value: '8.4%',
              ref: 'Ref: <7.0%',
              level: 'warning',
              time: '07:30',
            },
          ].map((alert) => (
            <div
              key={alert.patient + alert.test}
              className="flex items-center gap-space-md p-space-md hover:bg-surface-container-low/30 transition-colors"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  alert.level === 'critical' ? 'bg-tertiary animate-pulse' : 'bg-status-warning'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-label-lg text-on-surface">
                  {alert.patient} — <span className="text-on-surface-variant font-normal">{alert.test}</span>
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  <span
                    className={`font-bold tabular-nums ${
                      alert.level === 'critical' ? 'text-tertiary' : 'text-status-warning'
                    }`}
                  >
                    {alert.value}
                  </span>{' '}
                  • {alert.ref}
                </p>
              </div>
              <span className="text-label-sm text-on-surface-variant flex-shrink-0">{alert.time}</span>
              <button
                onClick={() => setConsultOpen(true)}
                className="btn-urgent text-label-sm py-1 px-space-md flex-shrink-0"
              >
                Review
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
