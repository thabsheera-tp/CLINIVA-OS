'use client'

import React, { useState } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { SkeletonRow } from '@/components/ui/LoadingSkeleton'
import { usePendingLabOrders, useCriticalLabResults } from '@/hooks/useClinicData'

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

export default function LabSubScreens({ slug, userName }: Props) {
  const [searchTerm, setSearchTerm] = useState('')

  // ── Real data hooks ──
  const labOrders = usePendingLabOrders()
  const criticalResults = useCriticalLabResults()

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      {/* ── 1. TEST ORDERS ── */}
      {slug === 'orders' && (
        <>
          <SubScreenHeader
            parentLabel="Lab & Diagnostics"
            parentHref="/lab"
            title="Diagnostic Test Orders Inbox"
            badge="9 Active Orders"
            badgeVariant="live"
            description="Specimen requisitions ordered by attending physicians across OPD, Emergency, and Wards."
          />

          <div className="grid grid-cols-1 gap-3">
            {SAMPLE_LAB_ORDERS.map((o) => (
              <div key={o.orderId} className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                o.priority === 'STAT' ? 'bg-red-50/40 border-red-200' : 'bg-surface-container-lowest border-outline-variant/30'
              }`}>
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
                  <span className={`px-2.5 py-1 rounded-full text-label-sm font-bold ${
                    o.priority === 'STAT' ? 'bg-red-100 text-red-800 animate-pulse' : o.priority === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-surface-container text-on-surface'
                  }`}>
                    {o.priority}
                  </span>
                  <button className="btn-primary text-label-sm py-1.5 px-3">
                    Accession Sample
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
            <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-on-surface text-body-md">Marcus Delacroix (54M)</span>
                <span className="text-label-sm text-outline ml-2 font-mono">#00482910</span>
              </div>
              <span className="text-label-sm font-bold text-red-700 uppercase">STAT Panel</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 items-center text-body-sm font-medium text-on-surface-variant pb-2 border-b border-outline-variant/20">
                <span>Analyte / Parameter</span>
                <span>Measured Value</span>
                <span>Biological Reference</span>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="font-semibold text-on-surface">hs-Troponin I</span>
                <input type="text" defaultValue="0.04" className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-red-300 text-red-700 font-mono font-bold" />
                <span className="text-label-sm text-outline">&lt; 0.01 ng/mL</span>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="font-semibold text-on-surface">Serum Potassium (K+)</span>
                <input type="text" defaultValue="4.2" className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono" />
                <span className="text-label-sm text-outline">3.5 - 5.1 mmol/L</span>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="font-semibold text-on-surface">Serum Creatinine</span>
                <input type="text" defaultValue="1.1" className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono" />
                <span className="text-label-sm text-outline">0.7 - 1.3 mg/dL</span>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
              <button className="btn-secondary">Save Draft</button>
              <button className="btn-primary">Verify & Authorize Report</button>
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
