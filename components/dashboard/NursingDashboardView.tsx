'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import RecordVitalsModal from '@/components/modals/RecordVitalsModal'
import QuickActionBar from '@/components/dashboard/QuickActionBar'

type Props = {
  userName: string
}

export default function NursingDashboardView({ userName }: Props) {
  const { beds, vitals, setVitalsOpen, assignBed, releaseBed } = useClinicRealtime()
  const [activeFilter, setActiveFilter] = useState('All Wards')

  const occupiedCount = beds.filter((b) => b.status === 'occupied').length
  const availableCount = beds.filter((b) => b.status === 'available').length

  const filteredBeds =
    activeFilter === 'All Wards'
      ? beds
      : beds.filter((b) => b.ward.toLowerCase().includes(activeFilter.toLowerCase()))

  return (
    <div className="flex flex-col space-y-gutter-desktop">
      <RecordVitalsModal />

      {/* Quick Action Shortcuts */}
      <QuickActionBar className="w-full" />

      <section
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-lg rounded-2xl"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-semibold">
            Ward & IP Nursing Dashboard
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Nurse Station • {userName} • Ward A & B Live Shift
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setVitalsOpen(true)}
            className="btn-primary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">monitor_heart</span>
            <span>Record Vitals</span>
          </button>
          <Link
            href="/nursing/handover"
            className="btn-secondary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">transfer_within_a_station</span>
            <span>Shift Handover</span>
          </Link>
          <button
            onClick={() => setVitalsOpen(true)}
            className="btn-urgent justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            <span>Emergency Alert</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <KPICard
          title="Total Ward Beds"
          value={beds.length}
          icon="airline_seat_individual_suite"
          subtitle={`${occupiedCount} occupied • ${availableCount} available`}
        />
        <KPICard
          title="Active Inpatients"
          value={occupiedCount}
          icon="group"
          trend="+2 since yesterday"
          trendDir="up"
        />
        <KPICard
          title="MAR Pending"
          value={4}
          icon="medication"
          trend="4 doses due"
          trendDir="down"
          live
        />
        <KPICard
          title="Telemetry Pulse"
          value={vitals.heartRate}
          icon="ecg_heart"
          trend={`${vitals.bp} BP`}
          trendDir="neutral"
          subtitle={vitals.patientName}
          live
        />
      </section>

      {/* Bed Board */}
      <section className="clinical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md border-b border-outline-variant/20 gap-2">
          <div className="flex items-center gap-space-sm">
            <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
              Bed Management Board
            </h3>
            <LiveIndicator size="sm" />
          </div>
          <div className="flex gap-space-xs overflow-x-auto smooth-touch-scroll pb-1 sm:pb-0">
            {['All Wards', 'Ward A', 'Ward B'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-space-md py-1 rounded-full text-label-sm whitespace-nowrap transition-all touch-tap ${
                  activeFilter === f
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="p-space-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
          {filteredBeds.map((bed) => (
            <div
              key={bed.id}
              className={`p-space-md rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[140px] ${
                bed.status === 'occupied'
                  ? 'bg-surface-container-low border-outline-variant/40 hover:shadow-md'
                  : bed.status === 'available'
                  ? 'bg-primary-fixed/20 border-primary/30 hover:border-primary'
                  : 'bg-surface-container border-dashed border-outline-variant/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-headline-sm font-heading font-bold text-on-surface">
                    {bed.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-label-sm font-bold capitalize ${
                      bed.status === 'occupied'
                        ? 'bg-status-warning/20 text-status-warning'
                        : bed.status === 'available'
                        ? 'bg-status-success/20 text-status-success'
                        : 'bg-status-neutral/20 text-on-surface-variant'
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>
                {bed.patient ? (
                  <div>
                    <p className="text-label-lg text-on-surface font-bold truncate">{bed.patient}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {bed.age} • {bed.condition}
                    </p>
                  </div>
                ) : (
                  <p className="text-body-sm text-on-surface-variant italic">Bed Ready for Admission</p>
                )}
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant">{bed.ward}</span>
                {bed.status === 'occupied' ? (
                  <button
                    onClick={() => releaseBed(bed.id)}
                    className="text-label-sm text-tertiary font-semibold hover:underline"
                  >
                    Discharge
                  </button>
                ) : bed.status === 'available' ? (
                  <button
                    onClick={() =>
                      assignBed(bed.id, 'Carlos Mendez', '49M', 'Chest Pain Observation')
                    }
                    className="text-label-sm text-primary font-bold hover:underline"
                  >
                    + Assign Patient
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAR + Vitals Telemetry */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-md">
        {/* Medication Administration Record */}
        <div className="clinical-card">
          <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
            <div className="flex items-center gap-space-sm">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
                MAR — Medication Due
              </h3>
              <StatusBadge variant="critical" label="4 Pending" pulse />
            </div>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {[
              { patient: 'Marcus Delacroix', bed: 'A-01', drug: 'Lisinopril 10mg', route: 'PO', time: '09:00', status: 'overdue' },
              { patient: 'Priya Mehta', bed: 'A-02', drug: 'Amoxicillin 500mg', route: 'IV', time: '09:00', status: 'due' },
              { patient: 'George Tanner', bed: 'A-04', drug: 'Metformin 500mg', route: 'PO', time: '09:30', status: 'due' },
              { patient: 'Aisha Nkosi', bed: 'A-06', drug: 'Ketorolac 30mg', route: 'IM', time: '10:00', status: 'upcoming' },
            ].map((med) => (
              <div
                key={med.patient + med.drug}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-space-md py-space-sm hover:bg-surface-container-low/50 transition-colors"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      med.status === 'overdue'
                        ? 'bg-tertiary animate-pulse'
                        : med.status === 'due'
                        ? 'bg-status-warning'
                        : 'bg-status-neutral'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-label-md text-on-surface font-semibold truncate">
                      {med.patient} <span className="text-on-surface-variant font-normal">• Bed {med.bed}</span>
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {med.drug} — {med.route} at {med.time}
                    </p>
                  </div>
                </div>
                <button
                  className={`text-label-sm px-space-md py-1.5 rounded-full font-semibold flex-shrink-0 w-full sm:w-auto text-center touch-tap ${
                    med.status === 'overdue' ? 'btn-urgent' : 'btn-primary'
                  }`}
                >
                  {med.status === 'overdue' ? 'Administer (Overdue)' : 'Administer'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Vitals Telemetry Card */}
        <div className="clinical-card p-space-md flex flex-col justify-between gap-space-md">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
                Live Vitals Telemetry Monitor
              </h3>
              <LiveIndicator label="Streaming" />
            </div>
            <p className="text-body-sm text-on-surface-variant mb-space-md">
              Monitoring active bed patient: <span className="font-semibold text-on-surface">{vitals.patientName}</span> ({vitals.mrn})
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              {[
                { label: 'BP', value: vitals.bp, unit: 'mmHg', icon: 'favorite' },
                { label: 'Heart Rate', value: vitals.heartRate, unit: 'bpm', icon: 'ecg_heart' },
                { label: 'SpO₂', value: vitals.spo2, unit: '%', icon: 'air' },
                { label: 'Temp', value: `${vitals.temperature}°F`, unit: '°F', icon: 'thermometer' },
              ].map((v) => (
                <div
                  key={v.label}
                  className="p-space-sm bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col items-center justify-center text-center"
                >
                  <span className="text-label-sm text-on-surface-variant uppercase">{v.label}</span>
                  <span className="font-heading text-headline-md font-bold text-on-surface tabular-nums">
                    {v.value}
                  </span>
                  <span className="text-label-sm text-on-surface-variant">{v.unit}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setVitalsOpen(true)}
            className="btn-primary justify-center w-full"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Update Observation Vitals
          </button>
        </div>
      </div>
    </div>
  )
}
