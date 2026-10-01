'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import { usePendingLabOrders, useCriticalLabResults } from '@/hooks/useClinicData'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

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
  { patient: 'George Tanner', test: 'Serum K+', value: '6.2 mEq/L', ref: '3.5–5.0', flag: 'PANIC HIGH' },
  { patient: 'Marcus Delacroix', test: 'Troponin I', value: '0.08 ng/mL', ref: '<0.04', flag: 'PANIC HIGH' },
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
    <div className="flex flex-col space-y-4">
      {/* Clean Hospital Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Diagnostic Laboratory</h1>
          <p className="text-sm text-[#4A5D6B] dark:text-[#9FB1C0] mt-0.5 font-normal">
            Specimen Testing &amp; Diagnostic Results &bull; {userName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openLabResultModal()}
            className="btn-primary py-2 px-4 text-xs font-semibold"
          >
            <ClinivaIcon name="edit_note" size={16} strokeWidth={1.5} />
            <span>Enter Results</span>
          </button>
          <Link
            href="/lab/reports"
            className="btn-secondary py-2 px-3 text-xs font-semibold"
          >
            <ClinivaIcon name="send" size={16} strokeWidth={1.5} />
            <span>Reports</span>
          </Link>
        </div>
      </section>

      {/* Compact KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Orders Today"
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
          title="Pending Results"
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Test Order Queue */}
        <div className="xl:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#123047] dark:text-white">Test Orders Queue</h3>
              <LiveIndicator size="sm" />
            </div>
            <span className="text-xs font-bold bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7] px-3 py-1 rounded-full">
              {pendingCount} Pending
            </span>
          </div>

          {/* Mobile Test Order Cards (< sm screens) */}
          <div className="block sm:hidden divide-y divide-outline-variant/10 p-2">
            {pendingList
              ? pendingList.map((row) => (
                  <div key={row.id} className="p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#506473] dark:text-[#90A4B3] font-medium">
                        #{row.id.slice(0, 8).toUpperCase()} &bull; {row.sample_type || 'Blood'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge
                          variant={row.priority === 'stat' ? 'critical' : 'neutral'}
                          label={row.priority ? row.priority.toUpperCase() : 'ROUTINE'}
                          pulse={row.priority === 'stat'}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#123047] dark:text-white">
                        {row.patient_name || 'Patient'}
                      </p>
                      <p className="text-xs text-[#253848] dark:text-[#D9E5F0] font-semibold mt-0.5">
                        {row.test_name}
                      </p>
                    </div>
                    <button
                      onClick={() => openLabResultModal(row.id)}
                      className="btn-primary w-full justify-center py-2 text-xs font-semibold"
                    >
                      {row.status === 'ordered' ? 'Collect Sample' : 'Enter Results'}
                    </button>
                  </div>
                ))
              : DEFAULT_SAMPLE_ORDERS.map((row) => (
                  <div key={row.id} className="p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#506473] dark:text-[#90A4B3] font-medium">
                        {row.id} &bull; {row.sample}
                      </span>
                      <StatusBadge
                        variant={row.priority === 'stat' ? 'critical' : 'neutral'}
                        label={row.priority.toUpperCase()}
                        pulse={row.priority === 'stat'}
                      />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#123047] dark:text-white">{row.patient}</p>
                      <p className="text-xs text-[#253848] dark:text-[#D9E5F0] font-semibold mt-0.5">{row.tests}</p>
                    </div>
                    <button
                      onClick={() => openLabResultModal(row.id)}
                      className="btn-primary w-full justify-center py-2 text-xs font-semibold"
                    >
                      {row.status === 'pending'
                        ? 'Collect Sample'
                        : row.status === 'collected'
                        ? 'Enter Results'
                        : 'View Report'}
                    </button>
                  </div>
                ))}
          </div>

          {/* Desktop Test Order Table (sm+ screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/20">
                  <th className="px-4 py-3 font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider text-[11px]">Order #</th>
                  <th className="px-4 py-3 font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider text-[11px]">Patient</th>
                  <th className="px-4 py-3 font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider text-[11px]">Tests Ordered</th>
                  <th className="px-4 py-3 font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider text-[11px]">Sample</th>
                  <th className="px-4 py-3 font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider text-[11px]">Priority</th>
                  <th className="px-4 py-3 font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider text-[11px]">Status</th>
                  <th className="px-4 py-3 text-right font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider text-[11px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {pendingList
                  ? pendingList.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-[#506473] dark:text-[#90A4B3] font-medium text-xs">
                          #{row.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#123047] dark:text-white text-sm">
                          {row.patient_name || 'Patient'}
                        </td>
                        <td className="px-4 py-3 text-[#253848] dark:text-[#D9E5F0] font-medium max-w-[220px]">
                          {row.test_name}
                        </td>
                        <td className="px-4 py-3 text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                          {row.sample_type || 'Blood'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            variant={row.priority === 'stat' ? 'critical' : 'neutral'}
                            label={row.priority ? row.priority.toUpperCase() : 'ROUTINE'}
                            pulse={row.priority === 'stat'}
                          />
                        </td>
                        <td className="px-4 py-3">
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
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openLabResultModal(row.id)}
                            className="btn-primary py-1.5 px-3.5 text-xs font-semibold"
                          >
                            Enter Results
                          </button>
                        </td>
                      </tr>
                    ))
                  : DEFAULT_SAMPLE_ORDERS.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-[#506473] dark:text-[#90A4B3] font-medium text-xs">
                          {row.id}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#123047] dark:text-white text-sm">
                          {row.patient}
                        </td>
                        <td className="px-4 py-3 text-[#253848] dark:text-[#D9E5F0] font-medium max-w-[220px]">
                          {row.tests}
                        </td>
                        <td className="px-4 py-3 text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                          {row.sample}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            variant={row.priority === 'stat' ? 'critical' : 'neutral'}
                            label={row.priority.toUpperCase()}
                            pulse={row.priority === 'stat'}
                          />
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openLabResultModal(row.id)}
                            className="btn-primary py-1.5 px-3.5 text-xs font-semibold"
                          >
                            Enter Results
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Results Alerts */}
        {/* Critical Results Alerts */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/40">
            <h3 className="text-base font-bold text-[#123047] dark:text-white">
              Critical Lab Alerts
            </h3>
            <StatusBadge
              variant="critical"
              label={`${criticalCount} Panic Values`}
              pulse
            />
          </div>
          <div className="flex-1 divide-y divide-outline-variant/10 text-xs p-2">
            {criticalList
              ? criticalList.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 hover:bg-surface-container-low/40 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[14px] font-bold text-[#123047] dark:text-white">
                          {r.patient_name || 'Patient'}
                        </p>
                        <p className="text-xs font-semibold text-[#0F8B8D] dark:text-[#28B5B7] mt-0.5">
                          {r.test_name}
                        </p>
                      </div>
                      <StatusBadge
                        variant="critical"
                        label={r.severity === 'critical_low' ? 'PANIC LOW' : 'PANIC HIGH'}
                        pulse
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono font-extrabold text-[15px] text-[#C94A4A] dark:text-[#E06262] tabular-nums">
                        {r.result_value} {r.result_unit || ''}
                      </span>
                      {r.reference_range && (
                        <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                          (Ref: {r.reference_range})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => openLabResultModal(r.id)}
                      className="mt-2 text-[#0F8B8D] dark:text-[#28B5B7] font-semibold hover:underline text-xs flex items-center gap-1"
                    >
                      <span>Notify Attending Physician</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                ))
              : DEFAULT_CRITICAL_RESULTS.map((r) => (
                  <div
                    key={r.patient + r.test}
                    className="p-3 hover:bg-surface-container-low/40 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[14px] font-bold text-[#123047] dark:text-white">{r.patient}</p>
                        <p className="text-xs font-semibold text-[#0F8B8D] dark:text-[#28B5B7] mt-0.5">{r.test}</p>
                      </div>
                      <StatusBadge variant="critical" label={r.flag} pulse />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono font-extrabold text-[15px] text-[#C94A4A] dark:text-[#E06262] tabular-nums">
                        {r.value}
                      </span>
                      <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                        (Ref: {r.ref})
                      </span>
                    </div>
                    <button
                      onClick={() => openLabResultModal()}
                      className="mt-2 text-[#0F8B8D] dark:text-[#28B5B7] font-semibold hover:underline text-xs flex items-center gap-1"
                    >
                      <span>Notify Attending Physician</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}
