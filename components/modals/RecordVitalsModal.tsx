'use client'

import React, { useState } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'

export default function RecordVitalsModal() {
  const { isVitalsOpen, setVitalsOpen, updateVitals, activePatient } = useClinicRealtime()

  const [systolic, setSystolic] = useState('128')
  const [diastolic, setDiastolic] = useState('82')
  const [heartRate, setHeartRate] = useState('74')
  const [spo2, setSpo2] = useState('98')
  const [temp, setTemp] = useState('98.4')
  const [respRate, setRespRate] = useState('16')
  const [saved, setSaved] = useState(false)

  const patientName = activePatient?.name ?? 'Marcus Delacroix'
  const isHighBp = Number(systolic) >= 140 || Number(diastolic) >= 90
  const isLowSpo2 = Number(spo2) < 95
  const isFever = Number(temp) > 99.5

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateVitals({
      patientName,
      mrn: '00482910',
      bp: `${systolic}/${diastolic}`,
      heartRate,
      spo2: `${spo2}%`,
      temperature: temp,
    })

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setVitalsOpen(false)
    }, 1200)
  }

  return (
    <ModalBackdrop
      isOpen={isVitalsOpen}
      onClose={() => setVitalsOpen(false)}
      title="Record Patient Vitals & Telemetry"
      subtitle={`Live bedside observation • ${patientName}`}
      icon="monitor_heart"
    >
      {saved ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary animate-pulse">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>
          <h3 className="font-heading text-headline-md text-on-surface font-bold">
            Vitals Telemetry Synced!
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            Telemetry streamed live to Doctor Workspace, Nursing Ward, and Patient Chart.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-space-md">
          {/* Patient Banner */}
          <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
                {patientName.charAt(0)}
              </div>
              <div>
                <p className="text-label-lg font-heading text-on-surface font-semibold">{patientName}</p>
                <p className="text-body-sm text-on-surface-variant">MRN: 00482910 • Room 304 - Exam B</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed text-label-sm font-semibold">
              In Examination
            </span>
          </div>

          {/* Blood Pressure Input */}
          <div className="p-space-md bg-surface-container-low/50 rounded-xl border border-outline-variant/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">favorite</span>
                Blood Pressure (mmHg)
              </label>
              {isHighBp && (
                <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-label-sm font-bold animate-pulse">
                  Stage 1/2 Hypertension
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-space-sm">
              <div>
                <span className="text-label-sm text-on-surface-variant block mb-1">Systolic (Normal &lt; 120)</span>
                <input
                  type="number"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="120"
                  className="input-field font-semibold text-headline-sm tabular-nums"
                />
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant block mb-1">Diastolic (Normal &lt; 80)</span>
                <input
                  type="number"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="80"
                  className="input-field font-semibold text-headline-sm tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* HR & SpO2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-primary text-[18px]">ecg_heart</span>
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                required
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="72"
                className="input-field text-headline-sm font-semibold tabular-nums"
              />
              <span className="text-body-sm text-on-surface-variant mt-1 block">Normal resting: 60–100 bpm</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">air</span>
                  Oxygen Saturation SpO₂ (%)
                </label>
                {isLowSpo2 && (
                  <span className="px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary text-label-sm font-bold">
                    Low SpO2
                  </span>
                )}
              </div>
              <input
                type="number"
                required
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="98"
                min="70"
                max="100"
                className="input-field text-headline-sm font-semibold tabular-nums"
              />
              <span className="text-body-sm text-on-surface-variant mt-1 block">Normal: 95–100%</span>
            </div>
          </div>

          {/* Temp & Respiratory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">thermometer</span>
                  Body Temperature (°F)
                </label>
                {isFever && (
                  <span className="px-1.5 py-0.5 rounded bg-status-warning/10 text-status-warning text-label-sm font-bold">
                    Elevated
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.1"
                required
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="98.6"
                className="input-field text-headline-sm font-semibold tabular-nums"
              />
              <span className="text-body-sm text-on-surface-variant mt-1 block">Baseline: 97.8 – 99.1°F</span>
            </div>
            <div>
              <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-primary text-[18px]">pulmonology</span>
                Respiratory Rate
              </label>
              <input
                type="number"
                value={respRate}
                onChange={(e) => setRespRate(e.target.value)}
                placeholder="16"
                className="input-field text-headline-sm font-semibold tabular-nums"
              />
              <span className="text-body-sm text-on-surface-variant mt-1 block">Normal: 12–20 breaths/min</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-space-md border-t border-outline-variant/20 flex items-center justify-end gap-space-sm">
            <button
              type="button"
              onClick={() => setVitalsOpen(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span className="material-symbols-outlined text-[18px]">sync_saved_locally</span>
              <span>Sync & Stream Vitals</span>
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
