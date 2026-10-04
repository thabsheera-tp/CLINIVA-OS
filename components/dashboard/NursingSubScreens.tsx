'use client'

import React, { useState, useEffect } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import ClinivaIcon from '@/components/ui/ClinivaIcon'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import { fetchRecentVitals, type VitalsRow } from '@/lib/data'

type Props = {
  slug: string
  userName: string
}

const SAMPLE_INPATIENTS = [
  { bed: 'Bed A-01', name: 'Marcus Delacroix', mrn: '00482910', age: '54M', doc: 'Dr. Sarah Jenkins', admit: '2 days ago', diet: 'Low Sodium', risk: 'Moderate Fall Risk', diagnosis: 'Hypertensive Heart Disease' },
  { bed: 'Bed A-02', name: 'Priya Mehta', mrn: '00482911', age: '41F', doc: 'Dr. Alan Bradley', admit: '1 day ago', diet: 'Vegetarian', risk: 'Low Risk', diagnosis: 'Bilateral Pneumonia' },
  { bed: 'Bed A-04', name: 'George Tanner', mrn: '00482912', age: '67M', doc: 'Dr. Rajesh Patel', admit: '4 days ago', diet: 'Diabetic 1800kcal', risk: 'High Fall Risk', diagnosis: 'Post-op Knee Arthroplasty' },
  { bed: 'Bed A-06', name: 'Aisha Nkosi', mrn: '00482913', age: '29F', doc: 'Dr. Sarah Jenkins', admit: 'Today', diet: 'NPO (Fasting)', risk: 'Low Risk', diagnosis: 'Appendectomy Pre-Op' },
  { bed: 'Bed B-02', name: 'David Chen', mrn: '00482914', age: '52M', doc: 'Dr. Alan Bradley', admit: '3 days ago', diet: 'Diabetic', risk: 'Low Risk', diagnosis: 'Hyperglycemia Crisis' },
]

const SAMPLE_MAR = [
  { time: '08:00 AM', bed: 'A-01', patient: 'Marcus Delacroix', med: 'Atorvastatin 40mg PO', dose: '1 Tab', nurse: 'Priya Sharma, RN', status: 'Given', color: 'emerald' },
  { time: '08:00 AM', bed: 'A-01', patient: 'Marcus Delacroix', med: 'Lisinopril 10mg PO', dose: '1 Tab', nurse: 'Priya Sharma, RN', status: 'Given', color: 'emerald' },
  { time: '12:00 PM', bed: 'A-02', patient: 'Priya Mehta', med: 'IV Ceftriaxone 1g', dose: 'IVPB 100mL', nurse: 'Pending', status: 'Due Soon', color: 'amber' },
  { time: '12:00 PM', bed: 'A-04', patient: 'George Tanner', med: 'Regular Insulin 6 Units', dose: 'Sub-Q pre-meal', nurse: 'Pending', status: 'Due Soon', color: 'amber' },
  { time: '06:00 PM', bed: 'A-04', patient: 'George Tanner', med: 'Enoxaparin 40mg', dose: 'Sub-Q daily', nurse: 'Scheduled', status: 'Scheduled', color: 'slate' },
  { time: '08:00 PM', bed: 'A-02', patient: 'Priya Mehta', med: 'Paracetamol 500mg IV', dose: 'IV infusion PRN', nurse: 'Scheduled', status: 'PRN', color: 'slate' },
]

export default function NursingSubScreens({ slug, userName }: Props) {
  const { beds, vitals, setVitalsOpen, openAssignBedModal, releaseBed, isVitalsOpen } = useClinicRealtime()
  const [selectedWard, setSelectedWard] = useState<'all' | 'Ward A' | 'Ward B'>('all')
  const [observations, setObservations] = useState<VitalsRow[]>([])
  const [loadingObs, setLoadingObs] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadObservations = () => {
      setLoadingObs(true)
      fetchRecentVitals(20)
        .then((data) => {
          if (isMounted) {
            setObservations(data)
            setLoadingObs(false)
          }
        })
        .catch(() => {
          if (isMounted) setLoadingObs(false)
        })
    }

    loadObservations()

    const handler = () => loadObservations()
    if (typeof window !== 'undefined') {
      window.addEventListener('cliniva:vitals-updated', handler)
    }
    return () => {
      isMounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('cliniva:vitals-updated', handler)
      }
    }
  }, [isVitalsOpen])

  const filteredBeds = selectedWard === 'all' ? beds : beds.filter(b => b.ward === selectedWard)

  const computeNews2 = (v: {
    respiratory_rate?: number | null
    spo2?: number | null
    bp_systolic?: number | null
    heart_rate?: number | null
    temperature?: number | null
  }) => {
    let score = 0
    if (v.respiratory_rate) {
      if (v.respiratory_rate <= 8 || v.respiratory_rate >= 25) score += 3
      else if (v.respiratory_rate >= 21) score += 2
      else if (v.respiratory_rate <= 11) score += 1
    }
    if (v.spo2) {
      if (v.spo2 <= 91) score += 3
      else if (v.spo2 <= 93) score += 2
      else if (v.spo2 <= 94) score += 1
    }
    if (v.bp_systolic) {
      if (v.bp_systolic <= 90 || v.bp_systolic >= 220) score += 3
      else if (v.bp_systolic <= 100) score += 2
      else if (v.bp_systolic <= 110) score += 1
    }
    if (v.heart_rate) {
      if (v.heart_rate <= 40 || v.heart_rate >= 131) score += 3
      else if (v.heart_rate >= 111) score += 2
      else if (v.heart_rate <= 50 || v.heart_rate >= 91) score += 1
    }
    if (v.temperature) {
      if (v.temperature <= 95.0) score += 3
      else if (v.temperature >= 102.4) score += 2
      else if (v.temperature <= 96.8 || v.temperature >= 100.5) score += 1
    }

    if (score >= 7) return { score, label: `${score} (High Alert)`, color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40' }
    if (score >= 5) return { score, label: `${score} (Medium)`, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40' }
    if (score >= 1) return { score, label: `${score} (Low)`, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40' }
    return { score, label: '0 (Normal)', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40' }
  }

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">

      {/* ── 1. BED BOARD ── */}
      {slug === 'beds' && (
        <>
          <SubScreenHeader
            parentLabel="Nursing / IP Ward"
            parentHref="/nursing"
            title="Ward Bed Management & Occupancy Board"
            badge={`${beds.filter(b => b.status === 'occupied').length} Occupied / ${beds.length} Total`}
            badgeVariant="live"
            description="Live occupancy state for Inpatient Ward A (Cardio/General) and Ward B (Surgical/Stepdown)."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-4">
            {/* Filter segmented controls + Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
              {/* Segmented control */}
              <div className="inline-flex items-center p-1 bg-surface-container rounded-xl border border-outline-variant/30">
                {[
                  { id: 'all', label: 'All Wards' },
                  { id: 'Ward A', label: 'Ward A (Medical)' },
                  { id: 'Ward B', label: 'Ward B (Surgical)' },
                ].map((tab) => {
                  const isSelected = selectedWard === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedWard(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Status pills legend */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Occupied ({beds.filter(b => b.status === 'occupied').length})</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Available ({beds.filter(b => b.status === 'available').length})</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Maintenance ({beds.filter(b => b.status === 'maintenance' || b.status === 'reserved').length})</span>
                </span>
              </div>
            </div>

            {/* Beds Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
              {filteredBeds.map((bed) => {
                const isOccupied = bed.status === 'occupied'
                const isAvailable = bed.status === 'available'
                const initials = bed.patient
                  ? bed.patient
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : ''

                return (
                  <div
                    key={bed.id}
                    className={`group relative p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isOccupied
                        ? 'bg-surface-container-lowest border-outline-variant/40 shadow-xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-500/40'
                        : isAvailable
                        ? 'bg-surface-container-lowest border-outline-variant/40 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/40'
                        : 'bg-surface-container-lowest border-outline-variant/40 shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500/40'
                    }`}
                  >
                    {/* Top status line */}
                    <div
                      className={`absolute top-0 left-4 right-4 h-[2px] rounded-b ${
                        isOccupied
                          ? 'bg-rose-500/70'
                          : isAvailable
                          ? 'bg-emerald-500/70'
                          : 'bg-amber-500/70'
                      }`}
                    />

                    <div>
                      {/* Bed ID & Status Pill */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                            <ClinivaIcon name="bed" size={14} />
                          </div>
                          <span className="font-mono font-bold text-sm text-on-surface">
                            {bed.id}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isOccupied
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50'
                              : isAvailable
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOccupied
                                ? 'bg-rose-500 animate-pulse'
                                : isAvailable
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {bed.status}
                        </span>
                      </div>

                      {/* Patient / Bed Info */}
                      <div className="mt-3.5 min-h-[58px]">
                        {isOccupied && bed.patient ? (
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm text-on-surface truncate leading-snug">
                                {bed.patient}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                                <span className="truncate">{bed.condition || 'Inpatient Care'}</span>
                                {bed.age && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container font-medium text-on-surface-variant flex-shrink-0">
                                    {bed.age}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : isAvailable ? (
                          <div className="py-2 px-2.5 rounded-xl border border-dashed border-emerald-300/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/10 flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                              <ClinivaIcon name="check" size={12} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                Ready for Admission
                              </div>
                              <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70">
                                Sanitized & Inspected
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 px-2.5 rounded-xl border border-dashed border-amber-300/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10 flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                              <ClinivaIcon name="refresh" size={12} className="animate-spin text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                Sanitization In Progress
                              </div>
                              <div className="text-[10px] text-amber-600/80 dark:text-amber-400/70">
                                Deep cleaning & turnover
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-3.5 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-on-surface-variant">
                        <ClinivaIcon name="building" size={11} className="text-outline" />
                        {bed.ward}
                      </span>

                      {isOccupied ? (
                        <button
                          onClick={() => releaseBed(bed.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 border border-rose-200/70 dark:border-rose-900/50 transition-colors"
                        >
                          <ClinivaIcon name="logout" size={11} />
                          <span>Discharge</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openAssignBedModal(bed.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 border border-primary/30 transition-colors"
                        >
                          <ClinivaIcon name="person_add" size={11} />
                          <span>Assign Patient</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── 2. VITALS ENTRY ── */}
      {slug === 'vitals' && (
        <>
          <SubScreenHeader
            parentLabel="Nursing / IP Ward"
            parentHref="/nursing"
            title="Ward Vitals Observation & Telemetry Sheet"
            badge="NEWS2 Scoring"
            description="Continuous telemetry and intermittent vital signs observation log with early warning threshold alerts."
            actions={
              <button onClick={() => setVitalsOpen(true)} className="btn-primary flex items-center gap-2">
                <ClinivaIcon name="monitor_heart" size={16} strokeWidth={1.5} />
                <span>Log Vitals Entry</span>
              </button>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant font-medium">Blood Pressure</span>
              <div className="text-headline-md font-bold text-on-surface mt-1 font-mono">{vitals.bp}</div>
              <span className="text-label-sm text-emerald-600 dark:text-emerald-400 font-semibold">Normal MAP</span>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant font-medium">Pulse Rate</span>
              <div className="text-headline-md font-bold text-primary mt-1 font-mono">{vitals.heartRate} bpm</div>
              <span className="text-label-sm text-emerald-600 dark:text-emerald-400 font-semibold">Normal Sinus</span>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant font-medium">SpO2 (Room Air)</span>
              <div className="text-headline-md font-bold text-on-surface mt-1 font-mono">{vitals.spo2}</div>
              <span className="text-label-sm text-emerald-600 dark:text-emerald-400 font-semibold">Adequate</span>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant font-medium">Temperature</span>
              <div className="text-headline-md font-bold text-on-surface mt-1 font-mono">{vitals.temperature}°F</div>
              <span className="text-label-sm text-emerald-600 dark:text-emerald-400 font-semibold">Afebrile</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-3">
            <span className="text-label-lg font-semibold text-on-surface">Recent Ward Observations</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-4 py-2.5">Bed / Patient</th>
                    <th className="px-4 py-2.5">BP</th>
                    <th className="px-4 py-2.5">HR</th>
                    <th className="px-4 py-2.5">SpO2</th>
                    <th className="px-4 py-2.5">Temp</th>
                    <th className="px-4 py-2.5">NEWS2</th>
                    <th className="px-4 py-2.5">Nurse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {observations.length > 0 ? (
                    observations.map((obs) => {
                      const news = computeNews2(obs)
                      const timeStr = obs.recorded_at
                        ? new Date(obs.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now'
                      return (
                        <tr key={obs.id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-on-surface-variant font-medium">{timeStr}</td>
                          <td className="px-4 py-3 font-semibold text-on-surface">
                            {obs.patient_name || 'Inpatient'}{' '}
                            {obs.mrn ? <span className="font-mono text-xs text-on-surface-variant font-normal">({obs.mrn})</span> : null}
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold">
                            {obs.bp_systolic && obs.bp_diastolic ? `${obs.bp_systolic}/${obs.bp_diastolic}` : '-'}
                          </td>
                          <td className="px-4 py-3 font-mono">{obs.heart_rate ? `${obs.heart_rate} bpm` : '-'}</td>
                          <td className="px-4 py-3 font-mono">{obs.spo2 ? `${obs.spo2}%` : '-'}</td>
                          <td className="px-4 py-3 font-mono">{obs.temperature ? `${obs.temperature}°F` : '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-label-sm font-bold ${news.color}`}>
                              {news.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-on-surface-variant">{obs.nurse_name || 'Staff Nurse'}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="px-4 py-3 font-mono text-on-surface-variant font-medium">08:00 AM</td>
                        <td className="px-4 py-3 font-semibold text-on-surface">Bed A-01 (Marcus Delacroix)</td>
                        <td className="px-4 py-3 font-mono font-semibold">{vitals.bp}</td>
                        <td className="px-4 py-3 font-mono">{vitals.heartRate}</td>
                        <td className="px-4 py-3 font-mono">{vitals.spo2}</td>
                        <td className="px-4 py-3 font-mono">{vitals.temperature}°F</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-label-sm font-bold">0 (Low)</span></td>
                        <td className="px-4 py-3 text-on-surface-variant">P. Sharma, RN</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-on-surface-variant font-medium">06:00 AM</td>
                        <td className="px-4 py-3 font-semibold text-on-surface">Bed A-02 (Priya Mehta)</td>
                        <td className="px-4 py-3 font-mono font-semibold">118/76</td>
                        <td className="px-4 py-3 font-mono">92 bpm</td>
                        <td className="px-4 py-3 font-mono">95%</td>
                        <td className="px-4 py-3 font-mono text-amber-700 font-bold">100.2°F</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-sm font-bold">3 (Medium)</span></td>
                        <td className="px-4 py-3 text-on-surface-variant">J. Doe, RN</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 3. MAR (MEDICATION ADMINISTRATION RECORD) ── */}
      {slug === 'mar' && (
        <>
          <SubScreenHeader
            parentLabel="Nursing / IP Ward"
            parentHref="/nursing"
            title="Medication Administration Record (MAR)"
            badge="4 Due Soon"
            badgeVariant="alert"
            description="Prescription schedule verification, 5-Rights checks, and administration tracking."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3">Scheduled Time</th>
                    <th className="px-5 py-3">Bed / Patient</th>
                    <th className="px-5 py-3">Medication & Route</th>
                    <th className="px-5 py-3">Dose</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {SAMPLE_MAR.map((m, i) => (
                    <tr key={i} className="hover:bg-surface-container-low/30">
                      <td className="px-5 py-3.5 font-mono font-semibold text-primary">{m.time}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-on-surface">{m.patient}</div>
                        <div className="text-label-sm text-outline">{m.bed}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-on-surface">{m.med}</td>
                      <td className="px-5 py-3.5 font-mono">{m.dose}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                          m.status === 'Given' ? 'bg-emerald-100 text-emerald-800' : m.status === 'Due Soon' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {m.status === 'Due Soon' ? (
                          <button className="btn-primary text-label-sm py-1 px-3">
                            Confirm Given
                          </button>
                        ) : (
                          <span className="text-label-sm text-outline">{m.nurse}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 4. SHIFT HANDOVER ── */}
      {slug === 'handover' && (
        <>
          <SubScreenHeader
            parentLabel="Nursing / IP Ward"
            parentHref="/nursing"
            title="Nursing Shift Handover (SBAR)"
            badge="Morning Shift (07:00 - 15:00)"
            description="Structured inter-shift clinical clinical handover using the SBAR protocol."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 sm:p-6 shadow-sm space-y-4 max-w-3xl">
            <div className="p-3 sm:p-4 rounded-xl bg-surface-container-low/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-on-surface text-body-md">Bed A-01: Marcus Delacroix (54M)</span>
                <span className="text-label-sm font-mono text-on-surface-variant font-medium">Attending: Dr. Sarah Jenkins</span>
              </div>
              <div className="text-body-sm space-y-1.5">
                <div><strong className="text-primary">S (Situation):</strong> Admitted 2 days ago for accelerated hypertension and atypical chest discomfort.</div>
                <div><strong className="text-primary">B (Background):</strong> Past medical history significant for poorly controlled hypertension. Known sulfa allergy.</div>
                <div><strong className="text-primary">A (Assessment):</strong> Morning BP stabilized at 128/82 mmHg after Lisinopril. Pain free throughout morning.</div>
                <div><strong className="text-primary">R (Recommendation):</strong> Repeat troponin panel at 14:00. If normal, prepare discharge summary for tomorrow.</div>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-surface-container-low/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-semibold text-on-surface text-body-md">Bed A-02: Priya Mehta (41F)</span>
                <span className="text-label-sm font-mono text-on-surface-variant font-medium">Attending: Dr. Alan Bradley</span>
              </div>
              <div className="text-body-sm space-y-1.5">
                <div><strong className="text-primary">S (Situation):</strong> Bilateral pneumonia on IV antibiotics. Temp spiked to 100.2°F at 06:00.</div>
                <div><strong className="text-primary">B (Background):</strong> 3-day history of cough prior to admission. On 2L nasal cannula.</div>
                <div><strong className="text-primary">A (Assessment):</strong> SpO2 stable at 95% on 2L O2. Breathing slightly labored on exertion.</div>
                <div><strong className="text-primary">R (Recommendation):</strong> Monitor temp Q2H; second dose of IV Ceftriaxone due at 12:00.</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 5. PATIENT ROSTER ── */}
      {slug === 'patients' && (
        <>
          <SubScreenHeader
            parentLabel="Nursing / IP Ward"
            parentHref="/nursing"
            title="Inpatient Ward Patient Roster"
            badge={`${SAMPLE_INPATIENTS.length} Admitted`}
            description="Comprehensive roster of all current inpatients, clinical diet flags, and mobility alerts."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            {/* Mobile Card View */}
            <div className="block sm:hidden divide-y divide-outline-variant/20">
              {SAMPLE_INPATIENTS.map((p) => (
                <div key={p.mrn} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-primary text-label-md">{p.bed}</span>
                      <span className="mx-2 text-outline-variant">•</span>
                      <span className="font-semibold text-on-surface">{p.name} <span className="text-on-surface-variant font-normal">({p.age})</span></span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold flex-shrink-0 ${
                      p.risk.includes('High') ? 'bg-red-100 text-red-800' : p.risk.includes('Moderate') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>{p.risk.split(' ')[0]}</span>
                  </div>
                  <div className="text-body-sm text-on-surface font-medium">{p.diagnosis}</div>
                  <div className="flex items-center justify-between gap-2 text-label-sm text-on-surface-variant">
                    <span>{p.doc}</span>
                    <span className="px-2 py-0.5 rounded-full text-label-sm font-medium bg-secondary-fixed/50 text-on-secondary-fixed-variant">{p.diet}</span>
                  </div>
                  <div className="text-label-sm text-on-surface-variant font-mono font-medium">#{p.mrn}</div>
                </div>
              ))}
            </div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3">Bed</th>
                    <th className="px-5 py-3">Patient / MRN</th>
                    <th className="px-5 py-3">Primary Diagnosis</th>
                    <th className="px-5 py-3">Admitting Doctor</th>
                    <th className="px-5 py-3">Dietary Flag</th>
                    <th className="px-5 py-3">Fall Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {SAMPLE_INPATIENTS.map((p) => (
                    <tr key={p.mrn} className="hover:bg-surface-container-low/30">
                      <td className="px-5 py-3.5 font-mono font-bold text-primary">{p.bed}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-on-surface">{p.name} ({p.age})</div>
                        <div className="text-label-sm text-on-surface-variant font-mono font-medium">#{p.mrn}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-on-surface">{p.diagnosis}</td>
                      <td className="px-5 py-3.5 text-on-surface-variant">{p.doc}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-label-sm font-medium bg-secondary-fixed/50 text-on-secondary-fixed-variant">
                          {p.diet}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                          p.risk.includes('High') ? 'bg-red-100 text-red-800' : p.risk.includes('Moderate') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.risk}
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

      {/* ── 6. SETTINGS ── */}
      {slug === 'settings' && (
        <>
          <SubScreenHeader
            parentLabel="Nursing / IP Ward"
            parentHref="/nursing"
            title="Ward Nursing Settings"
            description="Configure shift timings, NEWS2 alert thresholds, and telemetry interval alarms."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4 max-w-2xl">
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Standard Vitals Interval</label>
              <select defaultValue="4" className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm">
                <option value="2">Every 2 Hours (Intensive)</option>
                <option value="4">Every 4 Hours (Standard Inpatient)</option>
                <option value="8">Every 8 Hours (Stable / Stepdown)</option>
              </select>
            </div>
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Ward Station Code</label>
              <input type="text" defaultValue="WARD-A-STN-1" className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm" />
            </div>
            <button className="btn-primary">Save Settings</button>
          </div>
        </>
      )}
    </div>
  )
}
