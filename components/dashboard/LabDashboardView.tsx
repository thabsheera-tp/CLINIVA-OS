'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import { usePendingLabOrders, useCriticalLabResults } from '@/hooks/useClinicData'

type Props = {
  userName: string
}

const DEFAULT_SAMPLE_ORDERS = [
  { id: 'LO-4421', patient: 'George Tanner', tests: 'BMP, Serum K+, CBC', sample: 'Blood', priority: 'stat', status: 'collected' },
  { id: 'LO-4422', patient: 'Marcus Delacroix', tests: 'Troponin I, BNP, LFT', sample: 'Blood', priority: 'stat', status: 'processing' },
  { id: 'LO-4423', patient: 'Priya Mehta', tests: 'Sputum Culture, CBC', sample: 'Sputum', priority: 'routine', status: 'collected' },
  { id: 'LO-4424', patient: 'Ana García', tests: 'HbA1c, FPG, Lipid Panel', sample: 'Blood', priority: 'routine', status: 'pending' },
  { id: 'LO-4425', patient: 'David Chen', tests: 'Urinalysis, Cr, BUN', sample: 'Urine', priority: 'routine', status: 'pending' },
]

const DEFAULT_CRITICAL_RESULTS = [
  { patient: 'George Tanner', test: 'Serum K+', value: '6.2 mEq/L', ref: '3.5–5.0', flag: 'HIGH' },
  { patient: 'Marcus Delacroix', test: 'Troponin I', value: '0.08 ng/mL', ref: '<0.04', flag: 'HIGH' },
  { patient: 'Ana García', test: 'FPG', value: '295 mg/dL', ref: '70–100', flag: 'CRITICAL' },
]

export default function LabDashboardView({ userName }: Props) {
  const { openLabResultModal, labRefreshKey } = useClinicRealtime()

  const labOrders = usePendingLabOrders()
  const criticalResults = useCriticalLabResults()

  const refetchOrders = labOrders.refetch
  const refetchCritical = criticalResults.refetch

  useEffect(() => {
    refetchOrders()
    refetchCritical()
  }, [labRefreshKey, refetchOrders, refetchCritical])

  const pendingList = labOrders.data && labOrders.data.length > 0 ? labOrders.data : null
  const criticalList = criticalResults.data && criticalResults.data.length > 0 ? criticalResults.data : null

  const pendingCount = pendingList ? pendingList.filter((o) => o.status !== 'reported').length : 9
  const criticalCount = criticalList ? criticalList.length : 3

  return (
    <div className="flex flex-col space-y-gutter-desktop">
      {/* Page Header */}
      <section
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-lg rounded-2xl"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-semibold">
            Lab & Diagnostics
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Clinical Laboratory • Technician: {userName} •{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => openLabResultModal()}
            className="btn-primary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Enter Results</span>
          </button>
          <Link
            href="/lab/reports"
            className="btn-secondary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Deliver Reports</span>
          </Link>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <KPICard
          title="Test Orders Today"
          value={pendingList ? pendingList.length + 25 : 34}
          icon="assignment"
          trend={`${pendingCount} pending`}
          trendDir="neutral"
          live
        />
        <KPICard
          title="Samples Collected"
          value={28}
          icon="science"
          trend="+8 in progress"
          trendDir="up"
        />
        <KPICard
          title="Results Pending"
          value={pendingCount}
          icon="pending"
          trend={`${criticalCount} critical`}
          trendDir={criticalCount > 0 ? 'down' : 'up'}
        />
        <KPICard
          title="Reports Delivered"
          value={19}
          icon="check_circle"
          trend="All on time"
          trendDir="up"
        />
      </section>

      {/* Main Grid: Orders Queue & Critical Results */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-md">
        {/* Test Order Queue */}
        <div className="xl:col-span-2 clinical-card">
          <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
            <div className="flex items-center gap-space-sm">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
                Test Order Queue
              </h3>
              <LiveIndicator size="sm" />
            </div>
            <span className="text-label-sm bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold">
              {pendingCount} Pending
            </span>
          </div>

          {/* Mobile Test Order Cards (< sm screens) */}
          <div className="block sm:hidden divide-y divide-outline-variant/10 p-2">
            {pendingList
              ? pendingList.map((row) => (
                  <div key={row.id} className="p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-label-sm font-mono text-on-surface-variant">
                        #{row.id.slice(0, 8).toUpperCase()} • {row.sample_type || 'Blood'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge
                          variant={row.priority === 'stat' ? 'critical' : 'neutral'}
                          label={row.priority ? row.priority.toUpperCase() : 'ROUTINE'}
                          pulse={row.priority === 'stat'}
                        />
                        <StatusBadge
                          variant={
                            row.status === 'processing'
                              ? 'warning'
                              : row.status === 'sample_collected'
                              ? 'routine'
                              : 'neutral'
                          }
                          label={row.status}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-label-lg font-semibold text-on-surface">
                        {row.patient_name || 'Patient'}
                      </p>
                      <p className="text-body-sm text-on-surface-variant font-medium">
                        {row.test_name}
                      </p>
                    </div>
                    <button
                      onClick={() => openLabResultModal(row.id)}
                      className="btn-primary w-full justify-center py-1.5 text-label-sm touch-tap"
                    >
                      {row.status === 'ordered'
                        ? 'Collect Sample →'
                        : 'Enter Results →'}
                    </button>
                  </div>
                ))
              : DEFAULT_SAMPLE_ORDERS.map((row) => (
                  <div key={row.id} className="p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-label-sm font-mono text-on-surface-variant">
                        {row.id} • {row.sample}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge
                          variant={row.priority === 'stat' ? 'critical' : 'neutral'}
                          label={row.priority.toUpperCase()}
                          pulse={row.priority === 'stat'}
                        />
                        <StatusBadge
                          variant={
                            row.status === 'processing'
                              ? 'warning'
                              : row.status === 'collected'
                              ? 'routine'
                              : 'neutral'
                          }
                          label={row.status}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-label-lg font-semibold text-on-surface">{row.patient}</p>
                      <p className="text-body-sm text-on-surface-variant font-medium">{row.tests}</p>
                    </div>
                    <button
                      onClick={() => openLabResultModal(row.id)}
                      className="btn-primary w-full justify-center py-1.5 text-label-sm touch-tap"
                    >
                      {row.status === 'pending'
                        ? 'Collect Sample →'
                        : row.status === 'collected'
                        ? 'Enter Results →'
                        : 'View Report →'}
                    </button>
                  </div>
                ))}
          </div>

          {/* Desktop Test Order Table (sm+ screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {['Order #', 'Patient', 'Tests', 'Sample', 'Priority', 'Status', 'Action'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-space-md py-space-sm text-left text-label-sm text-on-surface-variant uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {pendingList
                  ? pendingList.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="px-space-md py-space-sm text-label-sm text-on-surface-variant tabular-nums font-mono">
                          #{row.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-space-md py-space-sm text-label-lg text-on-surface font-semibold">
                          {row.patient_name || 'Patient'}
                        </td>
                        <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant max-w-[180px] truncate">
                          {row.test_name}
                        </td>
                        <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant">
                          {row.sample_type || 'Blood'}
                        </td>
                        <td className="px-space-md py-space-sm">
                          <StatusBadge
                            variant={row.priority === 'stat' ? 'critical' : 'neutral'}
                            label={row.priority ? row.priority.toUpperCase() : 'ROUTINE'}
                            pulse={row.priority === 'stat'}
                          />
                        </td>
                        <td className="px-space-md py-space-sm">
                          <StatusBadge
                            variant={
                              row.status === 'processing'
                                ? 'warning'
                                : row.status === 'sample_collected'
                                ? 'routine'
                                : row.status === 'resulted'
                                ? 'routine'
                                : 'neutral'
                            }
                            label={row.status}
                          />
                        </td>
                        <td className="px-space-md py-space-sm text-right">
                          <button
                            onClick={() => openLabResultModal(row.id)}
                            className="text-primary text-label-sm font-semibold hover:underline touch-tap"
                          >
                            Enter Results →
                          </button>
                        </td>
                      </tr>
                    ))
                  : DEFAULT_SAMPLE_ORDERS.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="px-space-md py-space-sm text-label-sm text-on-surface-variant tabular-nums font-mono">
                          {row.id}
                        </td>
                        <td className="px-space-md py-space-sm text-label-lg text-on-surface font-semibold">
                          {row.patient}
                        </td>
                        <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant max-w-[180px] truncate">
                          {row.tests}
                        </td>
                        <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant">
                          {row.sample}
                        </td>
                        <td className="px-space-md py-space-sm">
                          <StatusBadge
                            variant={row.priority === 'stat' ? 'critical' : 'neutral'}
                            label={row.priority.toUpperCase()}
                            pulse={row.priority === 'stat'}
                          />
                        </td>
                        <td className="px-space-md py-space-sm">
                          <StatusBadge
                            variant={
                              row.status === 'processing'
                                ? 'warning'
                                : row.status === 'collected'
                                ? 'routine'
                                : 'neutral'
                            }
                            label={row.status}
                          />
                        </td>
                        <td className="px-space-md py-space-sm text-right">
                          <button
                            onClick={() => openLabResultModal(row.id)}
                            className="text-primary text-label-sm font-semibold hover:underline touch-tap"
                          >
                            Enter Results →
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Results Panel */}
        <div className="clinical-card flex flex-col">
          <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
            <div className="flex items-center gap-space-sm">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
                Critical Results
              </h3>
              <StatusBadge
                variant="critical"
                label={`${criticalCount} Critical`}
                pulse
              />
            </div>
          </div>
          <div className="flex-1 divide-y divide-outline-variant/10">
            {criticalList
              ? criticalList.map((r) => (
                  <div
                    key={r.id}
                    className="px-space-md py-space-sm hover:bg-surface-container-low/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-label-md text-on-surface font-semibold">
                          {r.patient_name || 'Patient'}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">{r.test_name}</p>
                      </div>
                      <StatusBadge
                        variant="critical"
                        label={r.severity === 'critical_low' ? 'PANIC LOW' : 'PANIC HIGH'}
                        pulse
                      />
                    </div>
                    <div className="flex items-center gap-space-sm mt-1">
                      <span className="text-telemetry-num text-tertiary font-semibold tabular-nums">
                        {r.result_value} {r.result_unit || ''}
                      </span>
                      {r.reference_range && (
                        <span className="text-body-sm text-on-surface-variant">
                          Ref: {r.reference_range}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => openLabResultModal(r.id)}
                      className="mt-1 text-primary text-label-sm font-semibold hover:underline"
                    >
                      Update / Notify Attender →
                    </button>
                  </div>
                ))
              : DEFAULT_CRITICAL_RESULTS.map((r) => (
                  <div
                    key={r.patient + r.test}
                    className="px-space-md py-space-sm hover:bg-surface-container-low/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-label-md text-on-surface font-semibold">{r.patient}</p>
                        <p className="text-body-sm text-on-surface-variant">{r.test}</p>
                      </div>
                      <StatusBadge variant="critical" label={r.flag} pulse />
                    </div>
                    <div className="flex items-center gap-space-sm mt-1">
                      <span className="text-telemetry-num text-tertiary font-semibold tabular-nums">
                        {r.value}
                      </span>
                      <span className="text-body-sm text-on-surface-variant">Ref: {r.ref}</span>
                    </div>
                    <button
                      onClick={() => openLabResultModal()}
                      className="mt-1 text-primary text-label-sm font-semibold hover:underline"
                    >
                      Notify Doctor →
                    </button>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}
