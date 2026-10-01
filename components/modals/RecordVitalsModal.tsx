'use client'

import React, { useState, useEffect } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import { recordPatientVitals } from '@/lib/data'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

export default function RecordVitalsModal() {
  const { isVitalsOpen, setVitalsOpen, updateVitals, activePatient, queue, beds } = useClinicRealtime()

  const [selectedPatientName, setSelectedPatientName] = useState('')
  const [systolic, setSystolic] = useState('128')
  const [diastolic, setDiastolic] = useState('82')
  const [heartRate, setHeartRate] = useState('74')
  const [spo2, setSpo2] = useState('98')
  const [temp, setTemp] = useState('98.4')
  const [respRate, setRespRate] = useState('16')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Initialize patient name when modal opens
  useEffect(() => {
    if (!isVitalsOpen) {
      setErrorMsg(null)
      setSaved(false)
      setIsSubmitting(false)
      return
    }

    if (activePatient?.name) {
      setSelectedPatientName(activePatient.name)
    } else {
      const occupiedBed = beds.find((b) => b.status === 'occupied' && b.patient)
      if (occupiedBed?.patient) {
        setSelectedPatientName(occupiedBed.patient)
      } else if (queue[0]?.name) {
        setSelectedPatientName(queue[0].name)
      } else {
        setSelectedPatientName('Marcus Delacroix')
      }
    }
  }, [isVitalsOpen, activePatient, beds, queue])

  const patientName = selectedPatientName || 'Marcus Delacroix'
  const isHighBp = Number(systolic) >= 140 || Number(diastolic) >= 90
  const isLowSpo2 = Number(spo2) < 95
  const isFever = Number(temp) > 99.5

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await recordPatientVitals({
        patient_name: patientName,
        bp_systolic: Number(systolic),
        bp_diastolic: Number(diastolic),
        heart_rate: Number(heartRate),
        spo2: Number(spo2),
        temperature: Number(temp),
        respiratory_rate: respRate ? Number(respRate) : undefined,
        weight_kg: weight ? Number(weight) : undefined,
        height_cm: height ? Number(height) : undefined,
        notes: notes.trim() || undefined,
      })

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save patient vitals.')
        setIsSubmitting(false)
        return
      }

      // Stream to local realtime state and telemetry components
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
        setIsSubmitting(false)
        setVitalsOpen(false)
      }, 1300)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unexpected error occurred while saving vitals.')
      setIsSubmitting(false)
    }
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
          <div className="w-16 h-16 rounded-full bg-status-success/20 flex items-center justify-center text-status-success animate-bounce">
            <ClinivaIcon name="check_circle" size={36} strokeWidth={1.5} />
          </div>
          <h3 className="font-heading text-headline-md text-on-surface font-bold">
            Vitals Saved & Telemetry Streamed!
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            Observation for <span className="font-semibold text-on-surface">{patientName}</span> saved to clinical record and streamed to Ward telemetry.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-space-md">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-status-critical/10 border border-status-critical/30 text-status-critical text-body-sm flex items-start gap-2">
              <ClinivaIcon name="error" size={18} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Patient Selection Banner */}
          <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                <ClinivaIcon name="person" size={18} strokeWidth={1.5} className="text-primary" />
                Patient
              </label>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-label-sm font-semibold">
                Clinical Observation
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                required
                value={selectedPatientName}
                onChange={(e) => setSelectedPatientName(e.target.value)}
                placeholder="Patient Full Name"
                className="input-field font-semibold text-body-lg flex-1"
              />
              {(queue.length > 0 || beds.some((b) => b.patient)) && (
                <select
                  onChange={(e) => {
                    if (e.target.value) setSelectedPatientName(e.target.value)
                  }}
                  defaultValue=""
                  className="input-field text-body-sm w-44"
                >
                  <option value="" disabled>
                    Pick Patient...
                  </option>
                  {beds
                    .filter((b) => b.patient)
                    .map((b) => (
                      <option key={b.id} value={b.patient!}>
                        Bed {b.id}: {b.patient}
                      </option>
                    ))}
                  {queue.map((p) => (
                    <option key={p.id} value={p.name}>
                      OPD #{p.token}: {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Blood Pressure Input */}
          <div className="p-space-md bg-surface-container-low/50 rounded-xl border border-outline-variant/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                <ClinivaIcon name="favorite" size={18} strokeWidth={1.5} className="text-primary" />
                Blood Pressure (mmHg) *
              </label>
              {isHighBp && (
                <span className="px-2 py-0.5 rounded-full bg-status-critical/10 text-status-critical text-label-sm font-bold animate-pulse">
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
                  min="50"
                  max="260"
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
                  min="30"
                  max="160"
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
                <ClinivaIcon name="ecg_heart" size={18} strokeWidth={1.5} className="text-primary" />
                Heart Rate (bpm) *
              </label>
              <input
                type="number"
                required
                min="30"
                max="240"
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
                  <ClinivaIcon name="air" size={18} strokeWidth={1.5} className="text-primary" />
                  Oxygen Saturation SpO₂ (%) *
                </label>
                {isLowSpo2 && (
                  <span className="px-1.5 py-0.5 rounded bg-status-critical/10 text-status-critical text-label-sm font-bold">
                    Hypoxemia Risk
                  </span>
                )}
              </div>
              <input
                type="number"
                required
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="98"
                min="50"
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
                  <ClinivaIcon name="thermometer" size={18} strokeWidth={1.5} className="text-primary" />
                  Body Temperature (°F) *
                </label>
                {isFever && (
                  <span className="px-1.5 py-0.5 rounded bg-status-warning/10 text-status-warning text-label-sm font-bold">
                    Pyrexia / Fever
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.1"
                required
                min="80"
                max="115"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="98.6"
                className="input-field text-headline-sm font-semibold tabular-nums"
              />
              <span className="text-body-sm text-on-surface-variant mt-1 block">Baseline: 97.8 – 99.1°F</span>
            </div>
            <div>
              <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5 mb-1">
                <ClinivaIcon name="pulmonology" size={18} strokeWidth={1.5} className="text-primary" />
                Respiratory Rate
              </label>
              <input
                type="number"
                min="6"
                max="60"
                value={respRate}
                onChange={(e) => setRespRate(e.target.value)}
                placeholder="16"
                className="input-field text-headline-sm font-semibold tabular-nums"
              />
              <span className="text-body-sm text-on-surface-variant mt-1 block">Normal: 12–20 breaths/min</span>
            </div>
          </div>

          {/* Optional Weight & Height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="400"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70.5"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="input-field"
              />
            </div>
          </div>

          {/* Clinical Observation Notes */}
          <div>
            <label className="text-label-md text-on-surface font-semibold block mb-1">
              Nursing Notes & Telemetry Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient resting comfortably, regular sinus rhythm, denies chest pain."
              className="input-field text-body-sm"
            />
          </div>

          {/* Actions */}
          <div className="pt-space-md border-t border-outline-variant/20 flex items-center justify-end gap-space-sm">
            <button
              type="button"
              onClick={() => setVitalsOpen(false)}
              className="btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <ClinivaIcon name="progress_activity" size={18} strokeWidth={1.5} className="animate-spin" />
                  <span>Saving Vitals...</span>
                </>
              ) : (
                <>
                  <ClinivaIcon name="sync_saved_locally" size={18} strokeWidth={1.5} />
                  <span>Sync & Save Vitals</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
