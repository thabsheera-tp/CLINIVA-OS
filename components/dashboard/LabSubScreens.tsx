'use client'

import React, { useState, useEffect } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { SkeletonRow } from '@/components/ui/LoadingSkeleton'
import { usePendingLabOrders, useCriticalLabResults } from '@/hooks/useClinicData'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import { saveLabResult } from '@/lib/data'

type Props = {
  slug: string
  userName: string
}

const SAMPLE_LAB_ORDERS = [
  { orderId: 'ORD-5501', patient: 'Marcus Delacroix', mrn: '00482910', tests: 'High-Sensitivity Troponin I, Lipid Profile, Serum Creatinine', doc: 'Dr. Sarah Jenkins', priority: 'STAT', status: 'In Processing', time: '15m ago' },
  { orderId: 'ORD-5502', patient: 'Priya Mehta', mrn: '00482911', tests: 'Complete Blood Count (CBC), C-Reactive Protein (CRP), Blood Culture', doc: 'Dr. Alan Bradley', priority: 'Urgent', status: 'Sample Collected', time: '35m ago' },
  { orderId: 'ORD-5503', patient: 'George Tanner', mrn: '00482912', tests: 'HbA1c, Fasting Blood Glucose, Urine Microalbumin', doc: 'Dr. Sarah Jenkins', priority: 'Routine', status: 'Results Ready', time: '1h ago' },
  { orderId: 'ORD-5504', patient: 'David Chen', mrn: '00482914', tests: 'Comprehensive Metabolic Panel (CMP), Liver Function Panel', doc: 'Dr. Alan Bradley', priority: 'Routine', status: 'Verified', time: '2h ago' },
]

export default function LabSubScreens({ slug }: Props) {
  const { openLabResultModal, labRefreshKey, triggerLabRefresh } = useClinicRealtime()

  // ── Real data hooks ──
  const labOrders = usePendingLabOrders()
  const criticalResults = useCriticalLabResults()

  const refetchOrders = labOrders.refetch
  const refetchCritical = criticalResults.refetch

  useEffect(() => {
    refetchOrders()
    refetchCritical()
  }, [labRefreshKey, refetchOrders, refetchCritical])

  // Direct analyte entry states for slug === 'results'
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [troponinVal, setTroponinVal] = useState('0.04')
  const [potassiumVal, setPotassiumVal] = useState('4.2')
  const [creatinineVal, setCreatinineVal] = useState('1.1')
  const [isInlineSubmitting, setIsInlineSubmitting] = useState(false)
  const [inlineFeedback, setInlineFeedback] = useState<{ success: boolean; msg: string } | null>(null)

  const activeOrders = labOrders.data && labOrders.data.length > 0 ? labOrders.data : null

  // Ensure selected order is initialized
  useEffect(() => {
    if (activeOrders && activeOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(activeOrders[0].id)
    }
  }, [activeOrders, selectedOrderId])

  const currentOrder = activeOrders?.find((o) => o.id === selectedOrderId) || activeOrders?.[0]

  const handleInlineSave = async () => {
    const targetOrderId = currentOrder?.id || selectedOrderId || '60000000-0000-0000-0000-000000000001'
    setIsInlineSubmitting(true)
    setInlineFeedback(null)

    const numPotass = parseFloat(potassiumVal)
    const isCritical = numPotass > 5.5 || numPotass < 3.0

    const res = await saveLabResult({
      lab_order_id: targetOrderId,
      test_name: 'Serum Potassium (K+)',
      result_value: potassiumVal,
      result_unit: 'mEq/L',
      ref_range_low: '3.5',
      ref_range_high: '5.0',
      severity: isCritical ? 'critical_high' : numPotass > 5.0 ? 'high' : 'normal',
      is_critical: isCritical,
      notes: `Direct bench verified: Troponin=${troponinVal} ng/mL, K+=${potassiumVal} mEq/L, Cr=${creatinineVal} mg/dL`,
    })

    setIsInlineSubmitting(false)

    if (res.success) {
      setInlineFeedback({
        success: true,
        msg: `Results authorized and saved to lab_results for ${res.patientName || 'patient'}. Realtime telemetry notified!`,
      })
      triggerLabRefresh()
    } else {
      setInlineFeedback({
        success: false,
        msg: res.error || 'Failed to authorize and persist lab result.',
      })
    }
  }

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      {/* ── 1. TEST ORDERS ── */}
      {slug === 'orders' && (
        <>
          <SubScreenHeader
            parentLabel="Lab & Diagnostics"
            parentHref="/lab"
            title="Diagnostic Test Orders Inbox"
            badge={`${activeOrders ? activeOrders.length : 9} Active Orders`}
            badgeVariant="live"
            description="Specimen requisitions ordered by attending physicians across OPD, Emergency, and Wards."
          />

          <div className="grid grid-cols-1 gap-3">
            {labOrders.loading && (
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 space-y-3">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            )}

            {activeOrders
              ? activeOrders.map((o) => (
                  <div
                    key={o.id}
                    className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      o.priority === 'stat'
                        ? 'bg-red-50/40 border-red-200'
                        : 'bg-surface-container-lowest border-outline-variant/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="font-semibold text-on-surface text-body-md">
                          {o.patient_name || 'Patient'}
                        </span>
                        <span className="text-label-sm text-outline">
                          #{o.mrn || '00482910'} • {o.sample_type || 'Blood'}
                        </span>
                      </div>
                      <div className="text-body-sm font-medium text-on-surface mt-1">
                        {o.test_name}
                      </div>
                      <div className="text-label-sm text-on-surface-variant mt-0.5">
                        Ordered by: {o.doctor_name || 'Dr. Sarah Jenkins'}
                        {o.clinical_info && ` • ${o.clinical_info}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-label-sm font-bold ${
                          o.priority === 'stat'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {o.priority ? o.priority.toUpperCase() : 'ROUTINE'}
                      </span>
                      <button
                        onClick={() => openLabResultModal(o.id)}
                        className="btn-primary text-label-sm py-1.5 px-3 touch-tap"
                      >
                        Enter Results
                      </button>
                    </div>
                  </div>
                ))
              : SAMPLE_LAB_ORDERS.map((o) => (
                  <div
                    key={o.orderId}
                    className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      o.priority === 'STAT'
                        ? 'bg-red-50/40 border-red-200'
                        : 'bg-surface-container-lowest border-outline-variant/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{o.orderId}</span>
                        <span className="font-semibold text-on-surface text-body-md">{o.patient}</span>
                        <span className="text-label-sm text-outline">#{o.mrn} • {o.time}</span>
                      </div>
                      <div className="text-body-sm font-medium text-on-surface mt-1">{o.tests}</div>
                      <div className="text-label-sm text-on-surface-variant mt-0.5">Ordered by: {o.doc}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-label-sm font-bold ${
                          o.priority === 'STAT'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : o.priority === 'Urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {o.priority}
                      </span>
                      <button
                        onClick={() => openLabResultModal()}
                        className="btn-primary text-label-sm py-1.5 px-3 touch-tap"
                      >
                        Enter Results
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </>
      )}

      {/* ── 2. SAMPLE TRACKING ── */}
      {slug === 'samples' && (
        <>
          <SubScreenHeader
            parentLabel="Lab & Diagnostics"
            parentHref="/lab"
            title="Specimen Accessioning & Barcode Tracking"
            badge="16 Samples in Transit"
            description="Phlebotomy collection log, barcode labeling, tube centrifuge status, and incubator tracking."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3">Barcode</th>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Specimen Type</th>
                    <th className="px-5 py-3">Container / Additive</th>
                    <th className="px-5 py-3">Collection Time</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {[
                    { bar: 'SMP-99014', patient: 'Marcus Delacroix', type: 'Whole Blood', container: 'Lavender Top (EDTA)', time: '08:15 AM', status: 'Centrifuged' },
                    { bar: 'SMP-99015', patient: 'Marcus Delacroix', type: 'Venous Blood', container: 'Gold Top (SST Gel)', time: '08:15 AM', status: 'Analyzing' },
                    { bar: 'SMP-99016', patient: 'Priya Mehta', type: 'Serum / Clot', container: 'Red Top (No additive)', time: '08:30 AM', status: 'Accessioned' },
                    { bar: 'SMP-99017', patient: 'George Tanner', type: 'Clean Catch Urine', container: 'Sterile Urine Cup', time: '08:45 AM', status: 'Completed' },
                  ].map((s) => (
                    <tr key={s.bar} className="hover:bg-surface-container-low/30">
                      <td className="px-5 py-3.5 font-mono font-bold text-primary">{s.bar}</td>
                      <td className="px-5 py-3.5 font-semibold text-on-surface">{s.patient}</td>
                      <td className="px-5 py-3.5">{s.type}</td>
                      <td className="px-5 py-3.5 text-on-surface-variant">{s.container}</td>
                      <td className="px-5 py-3.5 font-mono text-outline">{s.time}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-label-sm font-semibold bg-blue-100 text-blue-800">
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

      {/* ── 3. RESULT ENTRY ── */}
      {slug === 'results' && (
        <>
          <SubScreenHeader
            parentLabel="Lab & Diagnostics"
            parentHref="/lab"
            title="Direct Analyte Result Entry"
            description="Enter test readings from automated hematology and clinical chemistry analyzers with abnormal range flags."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4 max-w-3xl">
            {/* Feedback alert */}
            {inlineFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-body-sm flex items-start gap-2.5 ${
                  inlineFeedback.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] mt-0.5">
                  {inlineFeedback.success ? 'check_circle' : 'error'}
                </span>
                <span>{inlineFeedback.msg}</span>
              </div>
            )}

            {/* Select Order Banner */}
            <div className="p-3.5 bg-surface-container-low rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-on-surface text-body-md">
                  {currentOrder?.patient_name || 'Marcus Delacroix (54M)'}
                </span>
                <span className="text-label-sm text-outline ml-2 font-mono">
                  #{currentOrder?.mrn || '00482910'}
                </span>
                {currentOrder?.doctor_name && (
                  <span className="text-label-sm text-on-surface-variant block mt-0.5">
                    Attending: {currentOrder.doctor_name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeOrders && activeOrders.length > 1 && (
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="px-2.5 py-1 text-label-sm rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface"
                  >
                    {activeOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.patient_name || 'Patient'} - #{o.id.slice(0, 6)}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-label-sm font-bold text-red-700 uppercase bg-red-100/70 px-2 py-0.5 rounded-full">
                  {currentOrder?.priority === 'stat' ? 'STAT Panel' : 'Priority Specimen'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 items-center text-body-sm font-medium text-on-surface-variant pb-2 border-b border-outline-variant/20">
                <span>Analyte / Parameter</span>
                <span>Measured Value</span>
                <span>Biological Reference</span>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="font-semibold text-on-surface">hs-Troponin I</span>
                <input
                  type="text"
                  value={troponinVal}
                  onChange={(e) => setTroponinVal(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-red-300 text-red-700 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <span className="text-label-sm text-outline">&lt; 0.04 ng/mL</span>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="font-semibold text-on-surface">Serum Potassium (K+)</span>
                <input
                  type="text"
                  value={potassiumVal}
                  onChange={(e) => setPotassiumVal(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="text-label-sm text-outline">3.5 - 5.0 mEq/L</span>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="font-semibold text-on-surface">Serum Creatinine</span>
                <input
                  type="text"
                  value={creatinineVal}
                  onChange={(e) => setCreatinineVal(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="text-label-sm text-outline">0.7 - 1.3 mg/dL</span>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => openLabResultModal(currentOrder?.id)}
                className="btn-secondary touch-tap text-label-sm"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>Open Detailed Dialog</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleInlineSave}
                  disabled={isInlineSubmitting}
                  className="btn-primary touch-tap"
                >
                  {isInlineSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Verify & Authorize Report</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 4. REPORT DELIVERY ── */}
      {slug === 'reports' && (
        <>
          <SubScreenHeader
            parentLabel="Lab & Diagnostics"
            parentHref="/lab"
            title="Authorized Diagnostic Reports & Dispatch"
            badge="3 Pending Dispatch"
            badgeVariant="alert"
            description="Verified pathologist reports ready for real-time electronic dispatch to Doctor Workspace and Patient Portal."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-3">
            {[
              { repId: 'REP-1092', patient: 'Marcus Delacroix', test: 'Acute Coronary Biomarker Panel', authBy: 'David Kalu, MLS', status: 'Dispatched to Doctor' },
              { repId: 'REP-1091', patient: 'George Tanner', test: 'Comprehensive Glycemic Index (HbA1c)', authBy: 'Dr. Helen Frost, Pathologist', status: 'Available in Portal' },
              { repId: 'REP-1088', patient: 'David Chen', test: 'Complete Lipid Profile & Apolipoproteins', authBy: 'David Kalu, MLS', status: 'Available in Portal' },
            ].map((r) => (
              <div key={r.repId} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{r.repId}</span>
                    <span className="font-semibold text-on-surface">{r.patient}</span>
                  </div>
                  <div className="text-body-sm text-on-surface-variant mt-1">{r.test}</div>
                  <div className="text-label-sm text-outline mt-0.5">Signed by: {r.authBy}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-label-sm font-semibold bg-emerald-100 text-emerald-800">
                    {r.status}
                  </span>
                  <button className="btn-secondary text-label-sm py-1 px-3">
                    View PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 5. REFERENCE RANGES ── */}
      {slug === 'reference' && (
        <>
          <SubScreenHeader
            parentLabel="Lab & Diagnostics"
            parentHref="/lab"
            title="Biological Reference Intervals Master"
            description="Standardized reference ranges categorized by age, gender, pregnancy, and calibration equipment."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3">Analyte</th>
                    <th className="px-5 py-3">Adult Male</th>
                    <th className="px-5 py-3">Adult Female</th>
                    <th className="px-5 py-3">Critical Low</th>
                    <th className="px-5 py-3">Critical High</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {[
                    { name: 'Potassium (K+)', male: '3.5 - 5.1 mmol/L', female: '3.5 - 5.1 mmol/L', low: '< 2.8', high: '> 6.0' },
                    { name: 'Sodium (Na+)', male: '136 - 145 mmol/L', female: '136 - 145 mmol/L', low: '< 120', high: '> 160' },
                    { name: 'Glucose (Fasting)', male: '70 - 99 mg/dL', female: '70 - 99 mg/dL', low: '< 50', high: '> 400' },
                    { name: 'Hemoglobin (Hgb)', male: '13.8 - 17.2 g/dL', female: '12.1 - 15.1 g/dL', low: '< 7.0', high: '> 20.0' },
                  ].map((row) => (
                    <tr key={row.name} className="hover:bg-surface-container-low/30">
                      <td className="px-5 py-3.5 font-semibold text-on-surface">{row.name}</td>
                      <td className="px-5 py-3.5">{row.male}</td>
                      <td className="px-5 py-3.5">{row.female}</td>
                      <td className="px-5 py-3.5 font-bold text-amber-700">{row.low}</td>
                      <td className="px-5 py-3.5 font-bold text-red-700">{row.high}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 6. SETTINGS ── */}
      {slug === 'settings' && (
        <>
          <SubScreenHeader
            parentLabel="Lab & Diagnostics"
            parentHref="/lab"
            title="Laboratory Analyzer & QC Settings"
            description="Interface settings for Roche Cobas, Sysmex hematology analyzers, and LIS bidirectional sync."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4 max-w-2xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-primary h-4 w-4" />
              <span className="text-body-sm text-on-surface font-medium">Automatic HL7/ASTM barcode order download to analyzer</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-primary h-4 w-4" />
              <span className="text-body-sm text-on-surface font-medium">Auto-page attending physician on any Panic / Critical value</span>
            </label>
            <button className="btn-primary">Save Laboratory Settings</button>
          </div>
        </>
      )}
    </div>
  )
}
