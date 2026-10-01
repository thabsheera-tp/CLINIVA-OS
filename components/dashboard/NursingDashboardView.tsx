'use client'

import React, { useState } from 'react'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

type Props = {
  userName: string
}

export default function NursingDashboardView({ userName }: Props) {
  const { beds, vitals, setVitalsOpen, openAssignBedModal, releaseBed } = useClinicRealtime()
  const [activeFilter, setActiveFilter] = useState('All Wards')

  const occupiedCount = beds.filter((b) => b.status === 'occupied').length
  const availableCount = beds.filter((b) => b.status === 'available').length

  const filteredBeds =
    activeFilter === 'All Wards'
      ? beds
      : beds.filter((b) => b.ward.toLowerCase().includes(activeFilter.toLowerCase()))

  return (
    <div className="flex flex-col w-full space-y-5">
      {/* ── 1. Compact Header ── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#122433] px-5 py-4 rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-heading text-base sm:text-lg font-bold text-[#123047] dark:text-white tracking-tight">
              Inpatient Nursing Station
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] border border-[#0F8B8D]/30">
              Ward Floor 2
            </span>
          </div>
          <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
            Bed Management & Vital Telemetry • {userName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVitalsOpen(true)}
            className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
          >
            <ClinivaIcon name="monitor_heart" size={16} strokeWidth={1.5} />
            <span>Record Vitals</span>
          </button>
        </div>
      </section>

      {/* ── 2. Compact KPI Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Occupied Beds"
          value={occupiedCount}
          icon="airline_seat_individual_suite"
          subtitle={`${occupiedCount} / ${beds.length} occupied`}
        />
        <KPICard
          title="Available Beds"
          value={availableCount}
          icon="bed"
          subtitle="Ready for intake"
        />
        <KPICard
          title="Medications Due"
          value={4}
          icon="medication"
          subtitle="MAR Pending"
          live
        />
        <KPICard
          title="Active Telemetry"
          value={`${vitals.heartRate} bpm`}
          icon="ecg_heart"
          subtitle={vitals.patientName}
          live
        />
      </section>

      {/* ── 3. Bed Management Board ── */}
      <section className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8EC] dark:border-white/[0.08] gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
              Ward Bed Roster ({filteredBeds.length})
            </h3>
            <LiveIndicator size="sm" />
          </div>

          <div className="flex gap-1 text-xs">
            {['All Wards', 'Ward A', 'Ward B'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-[#0F8B8D] text-white font-semibold'
                    : 'text-[#4A5D6B] hover:text-[#123047] dark:text-[#9FB1C0] dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredBeds.map((bed) => (
            <div
              key={bed.id}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                bed.status === 'occupied'
                  ? 'bg-[#F7F9FA] dark:bg-white/[0.04] border-[#E2E8EC] dark:border-white/[0.08]'
                  : bed.status === 'available'
                  ? 'bg-[#E8F6F5]/50 dark:bg-[#0F8B8D]/10 border-[#0F8B8D]/30'
                  : 'bg-[#F7F9FA] dark:bg-white/[0.02] border-dashed border-[#E2E8EC] dark:border-white/[0.06] opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-heading font-bold text-[#123047] dark:text-white">
                    Bed {bed.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize border ${
                      bed.status === 'occupied'
                        ? 'bg-[#C58A24]/10 text-[#C58A24] border-[#C58A24]/20'
                        : bed.status === 'available'
                        ? 'bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/20'
                        : 'bg-[#F0F4F7] text-[#4A5D6B] border-[#E2E8EC]'
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>
                {bed.patient ? (
                  <div>
                    <p className="text-sm font-semibold text-[#123047] dark:text-white truncate">{bed.patient}</p>
                    <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mt-0.5">
                      {bed.age} • {bed.condition}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] italic">Ready for admission</p>
                )}
              </div>

              <div className="pt-2 mt-2.5 border-t border-[#E2E8EC] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{bed.ward}</span>
                {bed.status === 'occupied' ? (
                  <button
                    onClick={() => releaseBed(bed.id)}
                    className="text-[#C94A4A] hover:underline font-semibold text-xs"
                  >
                    Discharge
                  </button>
                ) : bed.status === 'available' ? (
                  <button
                    onClick={() => openAssignBedModal(bed.id)}
                    className="text-[#0F8B8D] dark:text-[#28B5B7] font-bold hover:underline text-xs"
                  >
                    + Assign
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. MAR + Vitals Telemetry ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Medication Administration Record */}
        <div className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EC] dark:border-white/[0.08] mb-2">
            <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
              Medication Due (MAR)
            </h3>
            <StatusBadge variant="critical" label="4 Due" />
          </div>
          <div className="divide-y divide-[#E2E8EC]/80 dark:divide-white/[0.05]">
            {[
              { patient: 'Marcus Delacroix', bed: 'A-01', drug: 'Lisinopril 10mg', route: 'PO', time: '09:00', status: 'overdue' },
              { patient: 'Priya Mehta', bed: 'A-02', drug: 'Amoxicillin 500mg', route: 'IV', time: '09:00', status: 'due' },
              { patient: 'George Tanner', bed: 'A-04', drug: 'Metformin 500mg', route: 'PO', time: '09:30', status: 'due' },
              { patient: 'Aisha Nkosi', bed: 'A-06', drug: 'Ketorolac 30mg', route: 'IM', time: '10:00', status: 'upcoming' },
            ].map((med) => (
              <div key={med.patient + med.drug} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-sm text-[#123047] dark:text-white">{med.patient}</span>
                  <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium ml-1.5">({med.bed})</span>
                  <p className="text-xs text-[#253848] dark:text-[#D9E5F0] font-medium mt-0.5">{med.drug} • {med.route}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#123047] dark:text-white">{med.time}</span>
                  <StatusBadge
                    variant={med.status === 'overdue' ? 'critical' : med.status === 'due' ? 'warning' : 'neutral'}
                    label={med.status}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Vitals */}
        <div className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EC] dark:border-white/[0.08] mb-2">
            <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
              Bedside Telemetry
            </h3>
            <LiveIndicator size="sm" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-lg bg-[#F7F9FA] dark:bg-white/[0.04] border border-[#E2E8EC] dark:border-white/[0.08]">
              <span className="text-[11px] text-[#4A5D6B] dark:text-[#9FB1C0] uppercase font-bold tracking-wider">Pulse / Heart Rate</span>
              <p className="text-xl font-bold font-mono text-[#2E7D5B] dark:text-[#3E9F76] mt-0.5">{vitals.heartRate} bpm</p>
              <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{vitals.patientName}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F7F9FA] dark:bg-white/[0.04] border border-[#E2E8EC] dark:border-white/[0.08]">
              <span className="text-[11px] text-[#4A5D6B] dark:text-[#9FB1C0] uppercase font-bold tracking-wider">Blood Pressure</span>
              <p className="text-xl font-bold font-mono text-[#123047] dark:text-white mt-0.5">{vitals.bp}</p>
              <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Normal Range</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
