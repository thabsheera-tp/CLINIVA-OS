'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import ClinivaIcon from '@/components/ui/ClinivaIcon'
import StartConsultationModal from '@/components/modals/StartConsultationModal'
import RegisterPatientModal from '@/components/modals/RegisterPatientModal'
import RecordVitalsModal from '@/components/modals/RecordVitalsModal'
import {
  Activity,
  FileText,
  Pill,
  FlaskConical,
  AlertTriangle,
  ShieldAlert,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  History,
  Clock,
  Sparkles,
} from 'lucide-react'

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
  const [expandedSection, setExpandedSection] = useState<'none' | 'history' | 'medications'>('none')

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

  // Static clinical mock data for Marcus Delacroix fast-access drawer
  const PATIENT_HISTORY = [
    { label: 'Primary Condition', detail: 'Hypertensive Heart Disease (Diagnosed 2021)' },
    { label: 'Cardiology Status', detail: 'Acute Coronary Syndrome Rule-Out (2026), Stage 2 HTN' },
    { label: 'Inpatient History', detail: 'Ward A (Bed A-01), 2 days prior • Cardiac telemetry monitoring' },
    { label: 'Family History', detail: 'Premature Coronary Artery Disease (Father, age 52) • Non-smoker' },
  ]

  const ACTIVE_MEDICATIONS = [
    { name: 'Lisinopril', dose: '10mg PO Daily', freq: 'Morning (QAM)', reason: 'Hypertension / ACE Inhibitor' },
    { name: 'Atorvastatin', dose: '40mg PO Daily', freq: 'Bedtime (QHS)', reason: 'Hyperlipidemia / HMG-CoA' },
    { name: 'Aspirin (Cardioprotective)', dose: '81mg PO Daily', freq: 'With Meal', reason: 'Platelet Aggregation Inhibitor' },
    { name: 'Metoprolol Tartrate', dose: '25mg PO BID', freq: 'PRN Palpitations', reason: 'Beta-1 Selective Blocker' },
  ]

  return (
    <div className="flex flex-col w-full space-y-5 font-sans">
      {/* Clinical Modals */}
      <StartConsultationModal />
      <RegisterPatientModal />
      <RecordVitalsModal />

      {/* ── 1. Compact Header ── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#122433] px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Clinical Workstation
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
              Exam Room 304
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            Cardiology OPD &bull; {userName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRegisterOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ClinivaIcon name="person_add" size={15} strokeWidth={1.5} className="text-slate-500" />
            <span>Intake Patient</span>
          </button>
          <button
            onClick={() => setConsultOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-[#0F8B8D] hover:bg-[#0D7A7C] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ClinivaIcon name="play_arrow" size={16} strokeWidth={1.5} />
            <span>Start Consultation</span>
          </button>
        </div>
      </section>

      {/* ── 2. Compact Summary Row with Tabular Numbers ── */}
      <section className="bg-white dark:bg-[#122433] rounded-xl border border-slate-200 dark:border-white/[0.08] px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3.5 flex-wrap whitespace-nowrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ClinivaIcon name="analytics" size={15} strokeWidth={1.5} className="text-[#0F8B8D]" />
            TODAY
          </span>
          <span className="text-slate-200 dark:text-white/20">|</span>
          <Link
            href="/doctor/queue"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 transition-colors"
            title="View Patient Queue"
          >
            <span className="text-slate-600 dark:text-slate-300 font-medium">Queue</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10">
              {waitingPatients.length}
            </span>
          </Link>
          <span className="text-slate-300 dark:text-white/30">&middot;</span>
          <Link
            href="/doctor/appointments"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 transition-colors"
            title="View Consultations"
          >
            <span className="text-slate-600 dark:text-slate-300 font-medium">Consultations</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10">
              18
            </span>
          </Link>
          <span className="text-slate-300 dark:text-white/30">&middot;</span>
          <Link
            href="/doctor/lab-results"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 transition-colors"
            title="View Pending Labs"
          >
            <span className="text-slate-600 dark:text-slate-300 font-medium">Labs</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10">
              3
            </span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" title="STAT Alert" />
          </Link>
          <span className="text-slate-300 dark:text-white/30">&middot;</span>
          <Link
            href="/doctor/prescriptions"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 transition-colors"
            title="View e-Prescriptions"
          >
            <span className="text-slate-600 dark:text-slate-300 font-medium">Rx</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10">
              14
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs">Room Active</span>
          </span>
        </div>
      </section>

      {/* ── 3. Active Patient & Waiting Queue ── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Active Consultation Clinical Card */}
        <div className="xl:col-span-2 bg-white dark:bg-[#122433] rounded-xl border border-slate-200 dark:border-white/[0.08] p-4 flex flex-col gap-3.5 shadow-xs">
          {/* Section Header: Room Badge, High-Contrast In Room Pill, Prominent Allergy Alert & STAT */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-white/[0.06] flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
                ACTIVE PATIENT
              </span>

              {/* Enhanced Contrast "IN ROOM" status pill */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/80 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
                IN ROOM
              </span>

              {/* Critical Clinical Alerts: High-Visibility Allergy Indicator */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/60 shadow-2xs">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span>Allergies: Penicillin (Sulfa)</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-800 uppercase tracking-wider shadow-2xs animate-pulse">
                <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                STAT
              </span>
            </div>
          </div>

          {/* Patient Details & Chief Complaint */}
          <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 dark:bg-[#0D1B26] rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ClinivaIcon name="person" size={22} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {activePatient?.name ?? 'Marcus Delacroix'}
                  </h2>
                </div>
                <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-200 bg-teal-100/70 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-md border border-teal-300/80 dark:border-teal-800 tabular-nums">
                  Token #{activePatient?.token ?? 7}
                </span>
              </div>

              {/* High Contrast Subtitle Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium flex-wrap">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {activePatient?.age ?? '54M'}
                </span>
                <span className="text-slate-300 dark:text-slate-600 font-bold">&bull;</span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">MRN:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyMRN('00482910')}
                    className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-300 transition-colors tabular-nums"
                    title="Click to copy MRN: 00482910"
                  >
                    <span>00482910</span>
                    {copiedMRN ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:text-slate-400" />
                    )}
                  </button>
                </span>
                <span className="text-slate-300 dark:text-slate-600 font-bold">&bull;</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Blood: <strong className="text-slate-900 dark:text-white font-bold">O+</strong>
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Chief complaint:</span>{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activePatient?.complaint ?? 'Chest tightness, shortness of breath'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Button & Accessible Outline Pill Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setConsultOpen(true)}
              className="px-5 py-2 rounded-full bg-[#0F8B8D] hover:bg-[#0D7A7C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <ClinivaIcon name="play_arrow" size={16} strokeWidth={1.5} />
              <span>Start Consultation</span>
            </button>

            {/* Desktop Quick Actions: Refined Outline Pill Buttons */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setVitalsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-200/80 bg-teal-50/40 text-teal-800 dark:bg-teal-950/30 dark:border-teal-800/70 dark:text-teal-200 text-xs font-medium hover:bg-teal-100 hover:border-teal-300 dark:hover:bg-teal-900/50 transition-colors cursor-pointer shadow-sm"
              >
                <Activity className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                <span>Record Vitals</span>
              </button>

              <button
                type="button"
                onClick={() => setConsultOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-200/80 bg-teal-50/40 text-teal-800 dark:bg-teal-950/30 dark:border-teal-800/70 dark:text-teal-200 text-xs font-medium hover:bg-teal-100 hover:border-teal-300 dark:hover:bg-teal-900/50 transition-colors cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                <span>Clinical Note</span>
              </button>

              <Link
                href="/doctor/prescriptions"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-200/80 bg-teal-50/40 text-teal-800 dark:bg-teal-950/30 dark:border-teal-800/70 dark:text-teal-200 text-xs font-medium hover:bg-teal-100 hover:border-teal-300 dark:hover:bg-teal-900/50 transition-colors cursor-pointer shadow-sm"
              >
                <Pill className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                <span>Prescription</span>
              </Link>

              <Link
                href="/doctor/lab-results"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-200/80 bg-teal-50/40 text-teal-800 dark:bg-teal-950/30 dark:border-teal-800/70 dark:text-teal-200 text-xs font-medium hover:bg-teal-100 hover:border-teal-300 dark:hover:bg-teal-900/50 transition-colors cursor-pointer shadow-sm"
              >
                <FlaskConical className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                <span>Lab Order</span>
              </Link>
            </div>
          </div>

          {/* ── Fast Access Sub-Tabs: Medical History & Active Medications ── */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Quick Clinical Review:
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'history' ? 'none' : 'history')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    expandedSection === 'history'
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-teal-300 hover:text-teal-700'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Medical History</span>
                  {expandedSection === 'history' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'medications' ? 'none' : 'medications')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    expandedSection === 'medications'
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-teal-300 hover:text-teal-700'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Active Medications</span>
                  {expandedSection === 'medications' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Expandable Drawer Panel */}
            {expandedSection === 'history' && (
              <div className="p-3 bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/50 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-teal-200/50 dark:border-teal-900/40">
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-teal-700" />
                    Patient Medical History & Prior Admissions
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedSection('none')}
                    className="text-[11px] text-teal-700 dark:text-teal-300 hover:underline font-semibold"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {PATIENT_HISTORY.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white dark:bg-[#122433] border border-teal-100 dark:border-white/5">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expandedSection === 'medications' && (
              <div className="p-3 bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/50 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-teal-200/50 dark:border-teal-900/40">
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-700" />
                    Current Active Regimens ({ACTIVE_MEDICATIONS.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedSection('none')}
                    className="text-[11px] text-teal-700 dark:text-teal-300 hover:underline font-semibold"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ACTIVE_MEDICATIONS.map((med, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white dark:bg-[#122433] border border-teal-100 dark:border-white/5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{med.name}</span>
                          <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-300 tabular-nums">{med.dose}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">{med.freq}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">{med.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Compact Clinical Vitals Row with Tabular Numbers & High Contrast */}
          <div
            onClick={() => setVitalsOpen(true)}
            className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2.5 bg-slate-50 dark:bg-[#0D1B26] rounded-xl border border-slate-200 dark:border-white/[0.08] cursor-pointer hover:border-teal-500/50 transition-colors shadow-2xs"
            title="Click to Record or Update Vitals"
          >
            <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                VITALS
              </span>
              <span className="text-slate-300 dark:text-white/20">|</span>
              <span className="text-xs text-slate-700 dark:text-slate-200">
                <span className="text-slate-600 dark:text-slate-300 font-semibold mr-1">BP</span>
                <strong className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {vitals.bp}
                </strong>
              </span>
              <span className="text-slate-300 dark:text-white/30">&middot;</span>
              <span className="text-xs text-slate-700 dark:text-slate-200">
                <span className="text-slate-600 dark:text-slate-300 font-semibold mr-1">HR</span>
                <strong className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {vitals.heartRate}
                </strong>
                <span className="text-[10px] text-slate-500 ml-0.5">bpm</span>
              </span>
              <span className="text-slate-300 dark:text-white/30">&middot;</span>
              <span className="text-xs text-slate-700 dark:text-slate-200">
                <span className="text-slate-600 dark:text-slate-300 font-semibold mr-1">SpO₂</span>
                <strong className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {vitals.spo2}%
                </strong>
              </span>
              <span className="text-slate-300 dark:text-white/30">&middot;</span>
              <span className="text-xs text-slate-700 dark:text-slate-200">
                <span className="text-slate-600 dark:text-slate-300 font-semibold mr-1">Temp</span>
                <strong className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {vitals.temperature}°F
                </strong>
              </span>
            </div>

            <span className="text-xs text-teal-700 dark:text-teal-300 font-semibold hover:underline flex items-center gap-0.5 ml-auto">
              <span>Update</span>
              <ClinivaIcon name="edit" size={13} strokeWidth={1.5} />
            </span>
          </div>
        </div>

        {/* Right: Waiting Queue List with Usability Fixes & Full Tooltips */}
        <div className="bg-white dark:bg-[#122433] rounded-xl border border-slate-200 dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-white/[0.06] mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Waiting Queue &bull; <span className="tabular-nums">{waitingPatients.length}</span>
                </h3>
                <LiveIndicator size="sm" />
              </div>
              <Link href="/doctor/queue" className="text-xs text-teal-700 dark:text-teal-300 hover:underline font-semibold">
                Full Queue &rarr;
              </Link>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04] max-h-72">
              {waitingPatients.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">Queue clear. No patients waiting.</p>
              ) : (
                waitingPatients.map((p) => (
                  <div
                    key={p.id}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors rounded-lg px-1.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 tabular-nums border border-slate-200 dark:border-white/10 shadow-2xs">
                        #{p.token}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p
                            className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-[150px]"
                            title={p.name}
                          >
                            {p.name}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0 tabular-nums">
                            ({p.age})
                          </span>
                        </div>
                        <p
                          className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium max-w-[160px] sm:max-w-[190px]"
                          title={p.complaint}
                        >
                          {p.complaint}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-semibold font-mono text-slate-500 dark:text-slate-400 tabular-nums hidden sm:inline-block">
                        {p.wait}
                      </span>
                      <button
                        type="button"
                        onClick={() => callNextPatient()}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-semibold hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors shadow-2xs"
                        title={`Call token #${p.token} (${p.name})`}
                      >
                        Call
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-200 dark:border-white/[0.04] mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>Next: <strong className="text-slate-900 dark:text-white font-bold">{waitingPatients[0]?.name ?? 'None'}</strong></span>
            <button
              onClick={() => callNextPatient()}
              className="text-teal-700 dark:text-teal-300 font-bold hover:underline"
            >
              Call Next &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Mobile-only secondary clinical actions row with Outline Pill Buttons */}
      <section className="sm:hidden flex items-center gap-1.5 flex-wrap bg-white dark:bg-[#122433] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 w-full mb-1">
          Clinical Actions
        </span>
        <button
          onClick={() => setVitalsOpen(true)}
          className="flex-1 py-1.5 px-2 rounded-full border border-teal-200/80 bg-teal-50/40 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1"
        >
          <Activity className="w-3.5 h-3.5 text-teal-700" />
          <span>Vitals</span>
        </button>
        <button
          onClick={() => setConsultOpen(true)}
          className="flex-1 py-1.5 px-2 rounded-full border border-teal-200/80 bg-teal-50/40 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1"
        >
          <FileText className="w-3.5 h-3.5 text-teal-700" />
          <span>Notes</span>
        </button>
        <Link
          href="/doctor/prescriptions"
          className="flex-1 py-1.5 px-2 rounded-full border border-teal-200/80 bg-teal-50/40 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1"
        >
          <Pill className="w-3.5 h-3.5 text-teal-700" />
          <span>Rx</span>
        </Link>
        <Link
          href="/doctor/lab-results"
          className="flex-1 py-1.5 px-2 rounded-full border border-teal-200/80 bg-teal-50/40 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1"
        >
          <FlaskConical className="w-3.5 h-3.5 text-teal-700" />
          <span>Lab</span>
        </Link>
      </section>

      {/* ── 4. Daily Schedule with Tabular Numbers ── */}
      <section className="bg-white dark:bg-[#122433] rounded-xl border border-slate-200 dark:border-white/[0.08] p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Today&apos;s Appointments
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-mono font-bold tabular-nums">
              {filteredSchedule.length}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {(['All', 'Completed', 'Upcoming'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setScheduleFilter(f)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  scheduleFilter === f
                    ? 'bg-[#0F8B8D] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold">
                <th className="py-2.5 px-3 font-bold">Time</th>
                <th className="py-2.5 px-3 font-bold">Patient</th>
                <th className="py-2.5 px-3 font-bold">Type</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-3 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredSchedule.map((row) => (
                <tr key={row.time} className="hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                  <td className="py-2.5 px-3 font-mono font-bold text-xs text-slate-900 dark:text-white tabular-nums">
                    {row.time}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white text-sm">
                    {row.patient}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    {row.type}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge
                      variant={row.status === 'completed' ? 'routine' : row.status === 'in-progress' ? 'warning' : 'neutral'}
                      label={row.status}
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setConsultOpen(true)}
                      className="text-teal-700 dark:text-teal-300 font-bold hover:underline text-xs"
                    >
                      {row.status === 'completed' ? 'View' : 'Start'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. Diagnostic Alerts with Tabular Numbers & High Contrast ── */}
      <section className="bg-white dark:bg-[#122433] rounded-xl border border-slate-200 dark:border-white/[0.08] p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06] mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Diagnostic Alerts
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60 tabular-nums">
              3 Urgent
            </span>
          </div>
          <Link href="/doctor/lab-results" className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline">
            All Labs →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
          {[
            { patient: 'George Tanner', test: 'Serum Potassium', value: '6.2 mEq/L', ref: '3.5–5.0', level: 'critical' },
            { patient: activePatient?.name ?? 'Marcus Delacroix', test: 'Troponin I', value: '0.08 ng/mL', ref: '<0.04', level: 'critical' },
            { patient: 'Ana García', test: 'HbA1c', value: '8.4%', ref: '<7.0%', level: 'warning' },
          ].map((item) => (
            <div key={item.patient + item.test} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{item.patient}</span>
                <span className="text-slate-400 dark:text-slate-500 mx-1.5">•</span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{item.test}:</span>{' '}
                <span className={`font-bold font-mono text-sm tabular-nums ${item.level === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {item.value}
                </span>{' '}
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">(Ref {item.ref})</span>
              </div>
              <button
                onClick={() => setConsultOpen(true)}
                className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50 text-xs font-bold transition-colors"
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

