'use client'

import React, { useState } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import RecordVitalsModal from '@/components/modals/RecordVitalsModal'

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
  const { beds, vitals, setVitalsOpen, assignBed, releaseBed } = useClinicRealtime()
  const [selectedWard, setSelectedWard] = useState<'all' | 'Ward A' | 'Ward B'>('all')

  const filteredBeds = selectedWard === 'all' ? beds : beds.filter(b => b.ward === selectedWard)

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      <RecordVitalsModal />

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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWard('all')}
                  className={`px-3 py-1.5 rounded-xl text-label-sm font-semibold transition-colors ${selectedWard === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                  All Wards
                </button>
                <button
                  onClick={() => setSelectedWard('Ward A')}
                  className={`px-3 py-1.5 rounded-xl text-label-sm font-semibold transition-colors ${selectedWard === 'Ward A' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                  Ward A (Medical)
                </button>
                <button
                  onClick={() => setSelectedWard('Ward B')}
                  className={`px-3 py-1.5 rounded-xl text-label-sm font-semibold transition-colors ${selectedWard === 'Ward B' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                  Ward B (Surgical)
                </button>
              </div>

              <div className="flex items-center gap-4 text-label-sm">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Occupied</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cleaning</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {filteredBeds.map((bed) => (
                <div
                  key={bed.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    bed.status === 'occupied'
                      ? 'bg-red-50/40 border-red-200'
                      : bed.status === 'available'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface text-body-md font-mono">{bed.id}</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      bed.status === 'occupied'
                        ? 'bg-red-100 text-red-800'
                        : bed.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {bed.status}
                    </span>
                  </div>

                  <div className="mt-3 min-h-[60px]">
                    {bed.patient ? (
                      <div>
                        <div className="font-semibold text-on-surface">{bed.patient}</div>
                        <div className="text-body-sm text-on-surface-variant">{bed.condition} ({bed.age})</div>
                      </div>
                    ) : (
                      <div className="text-body-sm text-outline italic pt-2">Ready for incoming patient admission</div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="text-label-sm text-outline">{bed.ward}</span>
                    {bed.status === 'occupied' ? (
                      <button
                        onClick={() => releaseBed(bed.id)}
                        className="text-label-sm font-semibold text-red-700 hover:text-red-900"
                      >
                        Discharge
                      </button>
                    ) : (
                      <button
                        onClick={() => assignBed(bed.id, 'New Admission', '45M', 'Observation')}
                        className="text-label-sm font-semibold text-primary hover:underline"
                      >
                        Assign Patient
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
                <span className="material-symbols-outlined text-[18px]">monitor_heart</span>
                <span>Log Vitals Entry</span>
              </button>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant font-medium">Blood Pressure</span>
              <div className="text-headline-md font-bold text-on-surface mt-1 font-mono">{vitals.bp}</div>
              <span className="text-label-sm text-emerald-700 font-semibold">Normal MAP</span>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant font-medium">Pulse Rate</span>
              <div className="text-headline-md font-bold text-primary mt-1 font-mono">{vitals.heartRate} bpm</div>
              <span className="text-label-sm text-emerald-700 font-semibold">Normal Sinus</span>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant font-medium">SpO2 (Room Air)</span>
              <div className="text-headline-md font-bold text-on-surface mt-1 font-mono">{vitals.spo2}</div>
              <span className="text-label-sm text-emerald-700 font-semibold">Adequate</span>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant font-medium">Temperature</span>
              <div className="text-headline-md font-bold text-on-surface mt-1 font-mono">{vitals.temperature}°F</div>
              <span className="text-label-sm text-emerald-700 font-semibold">Afebrile</span>
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
                  <tr>
                    <td className="px-4 py-3 font-mono text-outline">08:00 AM</td>
                    <td className="px-4 py-3 font-semibold text-on-surface">Bed A-01 (Marcus Delacroix)</td>
                    <td className="px-4 py-3 font-mono font-semibold">{vitals.bp}</td>
                    <td className="px-4 py-3 font-mono">{vitals.heartRate}</td>
                    <td className="px-4 py-3 font-mono">{vitals.spo2}</td>
                    <td className="px-4 py-3 font-mono">{vitals.temperature}°F</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-label-sm font-bold">0 (Low)</span></td>
                    <td className="px-4 py-3 text-on-surface-variant">P. Sharma, RN</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-outline">06:00 AM</td>
                    <td className="px-4 py-3 font-semibold text-on-surface">Bed A-02 (Priya Mehta)</td>
                    <td className="px-4 py-3 font-mono font-semibold">118/76</td>
                    <td className="px-4 py-3 font-mono">92 bpm</td>
                    <td className="px-4 py-3 font-mono">95%</td>
                    <td className="px-4 py-3 font-mono text-amber-700 font-bold">100.2°F</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-sm font-bold">3 (Medium)</span></td>
                    <td className="px-4 py-3 text-on-surface-variant">J. Doe, RN</td>
                  </tr>
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

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4 max-w-3xl">
            <div className="p-4 rounded-xl bg-surface-container-low/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-on-surface text-body-md">Bed A-01: Marcus Delacroix (54M)</span>
                <span className="text-label-sm font-mono text-outline">Attending: Dr. Sarah Jenkins</span>
              </div>
              <div className="text-body-sm space-y-1.5">
                <div><strong className="text-primary">S (Situation):</strong> Admitted 2 days ago for accelerated hypertension and atypical chest discomfort.</div>
                <div><strong className="text-primary">B (Background):</strong> Past medical history significant for poorly controlled hypertension. Known sulfa allergy.</div>
                <div><strong className="text-primary">A (Assessment):</strong> Morning BP stabilized at 128/82 mmHg after Lisinopril. Pain free throughout morning.</div>
                <div><strong className="text-primary">R (Recommendation):</strong> Repeat troponin panel at 14:00. If normal, prepare discharge summary for tomorrow.</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-on-surface text-body-md">Bed A-02: Priya Mehta (41F)</span>
                <span className="text-label-sm font-mono text-outline">Attending: Dr. Alan Bradley</span>
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
            <div className="overflow-x-auto">
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
                        <div className="text-label-sm text-outline font-mono">#{p.mrn}</div>
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
