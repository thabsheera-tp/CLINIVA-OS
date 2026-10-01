'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import ClinivaIcon from '@/components/ui/ClinivaIcon'
import StartConsultationModal from '@/components/modals/StartConsultationModal'
import RegisterPatientModal from '@/components/modals/RegisterPatientModal'
import RecordVitalsModal from '@/components/modals/RecordVitalsModal'

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
    <div className="flex flex-col w-full space-y-5">
      {/* Clinical Modals */}
      <StartConsultationModal />
      <RegisterPatientModal />
      <RecordVitalsModal />

      {/* ── 1. Compact Header ── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#122433] px-5 py-3.5 rounded-xl border border-[#E2E8EC] dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-heading text-base sm:text-lg font-bold text-[#123047] dark:text-white tracking-tight">
              Clinical Workstation
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] border border-[#0F8B8D]/30">
              Exam Room 304
            </span>
          </div>
          <p className="text-sm text-[#4A5D6B] dark:text-[#9FB1C0] mt-0.5 font-normal">
            Cardiology OPD &bull; {userName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRegisterOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8EC] dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-[#172B3A] dark:text-[#E8F0F5] hover:bg-[#F7F9FA] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ClinivaIcon name="person_add" size={15} strokeWidth={1.5} className="text-[#4A5D6B]" />
            <span>Intake Patient</span>
          </button>
          <button
            onClick={() => setConsultOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-[#0F8B8D] hover:bg-[#0D7A7C] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ClinivaIcon name="play_arrow" size={16} strokeWidth={1.5} />
            <span>Start Consultation</span>
          </button>
        </div>
      </section>

      {/* ── 2. Compact Low-Height Summary Row ── */}
      <section className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3.5 flex-wrap whitespace-nowrap">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D6B] dark:text-[#9FB1C0] flex items-center gap-1.5">
            <ClinivaIcon name="analytics" size={15} strokeWidth={1.5} className="text-[#0F8B8D]" />
            TODAY
          </span>
          <span className="text-[#E2E8EC] dark:text-white/20">|</span>
          <Link
            href="/doctor/queue"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#172B3A] dark:text-[#E8F0F5] hover:text-[#0F8B8D] transition-colors"
            title="View Patient Queue"
          >
            <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Queue</span>
            <span className="font-mono text-sm font-bold text-[#123047] dark:text-white tabular-nums">{waitingPatients.length}</span>
          </Link>
          <span className="text-[#C8D3DE] dark:text-white/30">&middot;</span>
          <Link
            href="/doctor/appointments"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#172B3A] dark:text-[#E8F0F5] hover:text-[#0F8B8D] transition-colors"
            title="View Consultations"
          >
            <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Consultations</span>
            <span className="font-mono text-sm font-bold text-[#123047] dark:text-white tabular-nums">18</span>
          </Link>
          <span className="text-[#C8D3DE] dark:text-white/30">&middot;</span>
          <Link
            href="/doctor/lab-results"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#172B3A] dark:text-[#E8F0F5] hover:text-[#0F8B8D] transition-colors"
            title="View Pending Labs"
          >
            <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Labs</span>
            <span className="font-mono text-sm font-bold text-[#123047] dark:text-white tabular-nums">3</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C94A4A]" title="STAT Alert" />
          </Link>
          <span className="text-[#C8D3DE] dark:text-white/30">&middot;</span>
          <Link
            href="/doctor/prescriptions"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#172B3A] dark:text-[#E8F0F5] hover:text-[#0F8B8D] transition-colors"
            title="View e-Prescriptions"
          >
            <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Rx</span>
            <span className="font-mono text-sm font-bold text-[#123047] dark:text-white tabular-nums">14</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[#4A5D6B] dark:text-[#9FB1C0]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse" />
            <span className="text-[#172B3A] dark:text-[#E8F0F5] font-semibold text-xs">Room Active</span>
          </span>
        </div>
      </section>

      {/* ── 3. Active Patient & Waiting Queue ── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Active Consultation Clinical Card */}
        <div className="xl:col-span-2 bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4 flex flex-col gap-3.5 shadow-xs">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8EC] dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F8B8D] dark:text-[#28B5B7] flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 border border-[#0F8B8D]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B8D] animate-pulse" />
                ACTIVE PATIENT
              </span>
              <StatusBadge variant="warning" label="In Room" />
            </div>

            <StatusBadge
              variant={activePatient?.priority === 'emergency' ? 'critical' : 'warning'}
              label={activePatient?.priority === 'emergency' ? 'STAT' : 'Hypertension II'}
            />
          </div>

          {/* Patient Details & Chief Complaint */}
          <div className="flex items-start gap-3.5 p-3.5 bg-[#F7F9FA] dark:bg-[#0D1B26] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08]">
            <div className="w-11 h-11 rounded-xl bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] border border-[#0F8B8D]/30 flex items-center justify-center flex-shrink-0">
              <ClinivaIcon name="person" size={22} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <h2 className="text-lg sm:text-xl font-bold text-[#123047] dark:text-white tracking-tight">
                  {activePatient?.name ?? 'Marcus Delacroix'}
                </h2>
                <span className="font-mono text-xs font-bold text-[#0F8B8D] bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 px-2 py-0.5 rounded border border-[#0F8B8D]/30">
                  Token #{activePatient?.token ?? 7}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] mt-0.5">
                <span className="font-semibold text-[#172B3A] dark:text-[#E8F0F5]">{activePatient?.age ?? '54M'}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <span>MRN:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyMRN('00482910')}
                    className="inline-flex items-center gap-1 font-mono font-medium text-[#172B3A] dark:text-[#E8F0F5] hover:text-[#0F8B8D] transition-colors"
                    title="Copy MRN"
                  >
                    <span>00482910</span>
                    <ClinivaIcon name={copiedMRN ? 'check' : 'content_copy'} size={12} strokeWidth={1.5} />
                  </button>
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#E2E8EC]/80 dark:border-white/[0.06]">
                <p className="text-xs sm:text-[13px] text-[#172B3A] dark:text-[#E8F0F5]">
                  <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Chief complaint:</span>{' '}
                  <span className="font-semibold text-[#123047] dark:text-white">
                    {activePatient?.complaint ?? 'Chest tightness, shortness of breath'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Button & Secondary Clinical Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => setConsultOpen(true)}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0D7A7C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <ClinivaIcon name="play_arrow" size={16} strokeWidth={1.5} />
              <span>Start Consultation</span>
            </button>

            {/* Desktop secondary actions */}
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setVitalsOpen(true)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8EC] dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-[#172B3A] dark:text-[#E8F0F5] hover:bg-[#F7F9FA] text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <ClinivaIcon name="monitor_heart" size={14} strokeWidth={1.5} className="text-[#60727F]" />
                <span>Record Vitals</span>
              </button>
              <button
                onClick={() => setConsultOpen(true)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8EC] dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-[#172B3A] dark:text-[#E8F0F5] hover:bg-[#F7F9FA] text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <ClinivaIcon name="description" size={14} strokeWidth={1.5} className="text-[#60727F]" />
                <span>Clinical Note</span>
              </button>
              <Link
                href="/doctor/prescriptions"
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8EC] dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-[#172B3A] dark:text-[#E8F0F5] hover:bg-[#F7F9FA] text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <ClinivaIcon name="prescriptions" size={14} strokeWidth={1.5} className="text-[#60727F]" />
                <span>Prescription</span>
              </Link>
              <Link
                href="/doctor/lab-results"
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8EC] dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-[#172B3A] dark:text-[#E8F0F5] hover:bg-[#F7F9FA] text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <ClinivaIcon name="science" size={14} strokeWidth={1.5} className="text-[#60727F]" />
                <span>Lab Order</span>
              </Link>
            </div>
          </div>

          {/* Compact Clinical Vitals Row — Comfortably Readable */}
          <div
            onClick={() => setVitalsOpen(true)}
            className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2.5 bg-[#F7F9FA] dark:bg-[#0D1B26] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] cursor-pointer hover:border-[#0F8B8D]/40 transition-colors"
            title="Click to Record or Update Vitals"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#123047] dark:text-white flex items-center gap-1.5">
                <ClinivaIcon name="ecg_heart" size={15} strokeWidth={1.5} className="text-[#0F8B8D]" />
                VITALS
              </span>
              <span className="text-[#E2E8EC] dark:text-white/20">|</span>
              <span className="text-xs text-[#172B3A] dark:text-[#E8F0F5]">
                <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mr-1">BP</span>
                <strong className="text-sm font-bold font-mono text-[#123047] dark:text-white tabular-nums">{vitals.bp}</strong>
              </span>
              <span className="text-[#C8D3DE] dark:text-white/30">&middot;</span>
              <span className="text-xs text-[#172B3A] dark:text-[#E8F0F5]">
                <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mr-1">HR</span>
                <strong className="text-sm font-bold font-mono text-[#123047] dark:text-white tabular-nums">{vitals.heartRate}</strong>
              </span>
              <span className="text-[#C8D3DE] dark:text-white/30">&middot;</span>
              <span className="text-xs text-[#172B3A] dark:text-[#E8F0F5]">
                <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mr-1">SpO₂</span>
                <strong className="text-sm font-bold font-mono text-[#123047] dark:text-white tabular-nums">{vitals.spo2}%</strong>
              </span>
              <span className="text-[#C8D3DE] dark:text-white/30">&middot;</span>
              <span className="text-xs text-[#172B3A] dark:text-[#E8F0F5]">
                <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mr-1">Temp</span>
                <strong className="text-sm font-bold font-mono text-[#123047] dark:text-white tabular-nums">{vitals.temperature}°F</strong>
              </span>
            </div>

            <span className="text-xs text-[#0F8B8D] font-semibold hover:underline flex items-center gap-0.5 ml-auto">
              <span>Update</span>
              <ClinivaIcon name="edit" size={13} strokeWidth={1.5} />
            </span>
          </div>
        </div>

        {/* Right: Waiting Queue List */}
        <div className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8EC] dark:border-white/[0.06] mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
                  Waiting Queue &bull; {waitingPatients.length}
                </h3>
                <LiveIndicator size="sm" />
              </div>
              <Link href="/doctor/queue" className="text-xs text-[#0F8B8D] hover:underline font-semibold">
                Full Queue &rarr;
              </Link>
            </div>

            <div className="overflow-y-auto divide-y divide-[#E2E8EC]/60 dark:divide-white/[0.04] max-h-60">
              {waitingPatients.length === 0 ? (
                <p className="text-center text-xs text-[#8EA2B0] py-8">Queue clear. No patients waiting.</p>
              ) : (
                waitingPatients.map((p) => (
                  <div
                    key={p.id}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-[#F7F9FA] dark:hover:bg-white/[0.03] transition-colors rounded-md px-1"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded bg-[#F0F4F7] dark:bg-white/10 text-[#123047] dark:text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                        #{p.token}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172B3A] dark:text-white truncate">{p.name}</p>
                        <p className="text-[11px] text-[#4A5D6B] dark:text-[#9FB1C0] truncate font-medium">{p.complaint}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => callNextPatient()}
                      className="px-2.5 py-1 rounded-md bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] border border-[#0F8B8D]/30 text-xs font-semibold hover:bg-[#0F8B8D] hover:text-white transition-colors flex-shrink-0"
                    >
                      Call
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#E2E8EC]/60 dark:border-white/[0.04] mt-2 flex items-center justify-between text-xs text-[#4A5D6B] dark:text-[#9FB1C0]">
            <span>Next: <strong className="text-[#123047] dark:text-white font-semibold">{waitingPatients[0]?.name ?? 'None'}</strong></span>
            <button
              onClick={() => callNextPatient()}
              className="text-[#0F8B8D] dark:text-[#28B5B7] font-semibold hover:underline"
            >
              Call Next &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Mobile-only secondary clinical actions row (strictly honors mobile workflow order) */}
      <section className="sm:hidden flex items-center gap-1.5 flex-wrap bg-white dark:bg-[#122433] p-3 rounded-xl border border-[#E2E8EC] dark:border-white/[0.08]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A5D6B] dark:text-[#9FB1C0] w-full mb-1">
          Clinical Actions
        </span>
        <button
          onClick={() => setVitalsOpen(true)}
          className="flex-1 py-1.5 px-2 rounded-lg border border-[#E2E8EC] dark:border-white/[0.1] bg-[#F7F9FA] text-[#172B3A] text-xs font-semibold flex items-center justify-center gap-1"
        >
          <ClinivaIcon name="monitor_heart" size={14} strokeWidth={1.5} className="text-[#4A5D6B]" />
          <span>Vitals</span>
        </button>
        <button
          onClick={() => setConsultOpen(true)}
          className="flex-1 py-1.5 px-2 rounded-lg border border-[#E2E8EC] dark:border-white/[0.1] bg-[#F7F9FA] text-[#172B3A] text-xs font-semibold flex items-center justify-center gap-1"
        >
          <ClinivaIcon name="description" size={14} strokeWidth={1.5} className="text-[#4A5D6B]" />
          <span>Notes</span>
        </button>
        <Link
          href="/doctor/prescriptions"
          className="flex-1 py-1.5 px-2 rounded-lg border border-[#E2E8EC] dark:border-white/[0.1] bg-[#F7F9FA] text-[#172B3A] text-xs font-semibold flex items-center justify-center gap-1"
        >
          <ClinivaIcon name="prescriptions" size={14} strokeWidth={1.5} className="text-[#4A5D6B]" />
          <span>Rx</span>
        </Link>
        <Link
          href="/doctor/lab-results"
          className="flex-1 py-1.5 px-2 rounded-lg border border-[#E2E8EC] dark:border-white/[0.1] bg-[#F7F9FA] text-[#172B3A] text-xs font-semibold flex items-center justify-center gap-1"
        >
          <ClinivaIcon name="science" size={14} strokeWidth={1.5} className="text-[#4A5D6B]" />
          <span>Lab</span>
        </Link>
      </section>

      {/* ── 4. Daily Schedule ── */}
      <section className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EC] dark:border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
              Today&apos;s Appointments
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-[#F0F4F7] dark:bg-white/10 text-[#4A5D6B] dark:text-[#9FB1C0] font-mono font-bold">
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
                    ? 'bg-[#0F8B8D] text-white'
                    : 'text-[#4A5D6B] dark:text-[#9FB1C0] hover:text-[#123047] dark:hover:text-white'
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
              <tr className="border-b border-[#E2E8EC] dark:border-white/[0.06] text-[#4A5D6B] dark:text-[#9FB1C0] uppercase text-[11px] font-bold">
                <th className="py-2.5 px-3 font-bold">Time</th>
                <th className="py-2.5 px-3 font-bold">Patient</th>
                <th className="py-2.5 px-3 font-bold">Type</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-3 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EC]/60 dark:divide-white/[0.04]">
              {filteredSchedule.map((row) => (
                <tr key={row.time} className="hover:bg-[#F7F9FA] dark:hover:bg-white/[0.03]">
                  <td className="py-2.5 px-3 font-mono font-bold text-xs text-[#123047] dark:text-white">{row.time}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#172B3A] dark:text-white text-sm">{row.patient}</td>
                  <td className="py-2.5 px-3 text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{row.type}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge
                      variant={row.status === 'completed' ? 'routine' : row.status === 'in-progress' ? 'warning' : 'neutral'}
                      label={row.status}
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setConsultOpen(true)}
                      className="text-[#0F8B8D] dark:text-[#28B5B7] font-semibold hover:underline text-xs"
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

      {/* ── 5. Diagnostic Alerts ── */}
      <section className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EC] dark:border-white/[0.06] mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
              Diagnostic Alerts
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/25">
              3 Urgent
            </span>
          </div>
          <Link href="/doctor/lab-results" className="text-xs font-semibold text-[#0F8B8D] hover:underline">
            All Labs →
          </Link>
        </div>

        <div className="divide-y divide-[#E2E8EC]/60 dark:divide-white/[0.04]">
          {[
            { patient: 'George Tanner', test: 'Serum Potassium', value: '6.2 mEq/L', ref: '3.5–5.0', level: 'critical' },
            { patient: activePatient?.name ?? 'Marcus Delacroix', test: 'Troponin I', value: '0.08 ng/mL', ref: '<0.04', level: 'critical' },
            { patient: 'Ana García', test: 'HbA1c', value: '8.4%', ref: '<7.0%', level: 'warning' },
          ].map((item) => (
            <div key={item.patient + item.test} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-sm text-[#123047] dark:text-white">{item.patient}</span>
                <span className="text-[#4A5D6B] dark:text-[#9FB1C0] mx-1.5">•</span>
                <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{item.test}:</span>{' '}
                <span className={`font-bold font-mono text-sm ${item.level === 'critical' ? 'text-[#C94A4A]' : 'text-[#C58A24]'}`}>
                  {item.value}
                </span>{' '}
                <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">(Ref {item.ref})</span>
              </div>
              <button
                onClick={() => setConsultOpen(true)}
                className="px-2.5 py-1 rounded bg-[#C94A4A]/10 text-[#C94A4A] hover:bg-[#C94A4A]/20 border border-[#C94A4A]/25 text-xs font-semibold transition-colors"
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
