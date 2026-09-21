'use client'

import React, { useState } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import VoiceNoteRecorder from '@/components/ui/VoiceNoteRecorder'

export default function StartConsultationModal() {
  const { isConsultOpen, setConsultOpen, activePatient, completeConsultation } = useClinicRealtime()

  const [assessment, setAssessment] = useState('I10 — Essential (primary) hypertension')
  const [subjective, setSubjective] = useState('Patient reports intermittent chest tightness and shortness of breath upon climbing stairs. Denies radiating arm pain or diaphoresis.')
  const [objective, setObjective] = useState('BP: 128/82 mmHg, HR: 74 bpm regular rhythm. Lungs clear to auscultation bilaterally. No peripheral edema noted.')
  const [plan, setPlan] = useState('Continue Lisinopril 10mg PO daily. Low sodium dietary protocol (canteen order updated). STAT Troponin I and follow-up in 2 weeks.')
  const [rxDrug, setRxDrug] = useState('Lisinopril 10mg')
  const [rxDosage, setRxDosage] = useState('1 tablet daily')
  const [rxDuration, setRxDuration] = useState('30 days')
  const [orderLabs, setOrderLabs] = useState<string[]>(['Troponin I', 'Serum Potassium'])
  const [completed, setCompleted] = useState(false)

  const patientName = activePatient?.name ?? 'Marcus Delacroix'

  const toggleLab = (lab: string) => {
    setOrderLabs((prev) =>
      prev.includes(lab) ? prev.filter((l) => l !== lab) : [...prev, lab]
    )
  }

  const handleAppendVoiceNote = (text: string, targetSection?: string) => {
    if (targetSection === 'objective') {
      setObjective((prev) => (prev ? `${prev} ${text}` : text))
    } else if (targetSection === 'plan') {
      setPlan((prev) => (prev ? `${prev} ${text}` : text))
    } else {
      setSubjective((prev) => (prev ? `${prev} ${text}` : text))
    }
  }

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault()
    if (activePatient) {
      completeConsultation(activePatient.id)
    }
    setCompleted(true)
    setTimeout(() => {
      setCompleted(false)
      setConsultOpen(false)
    }, 1500)
  }

  return (
    <ModalBackdrop
      isOpen={isConsultOpen}
      onClose={() => setConsultOpen(false)}
      title="Clinical Encounter & Consultation"
      subtitle={`Encounter Note • ${patientName}`}
      icon="stethoscope"
      maxWidth="max-w-3xl"
    >
      {completed ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary animate-pulse">
            <span className="material-symbols-outlined text-[36px]">verified</span>
          </div>
          <h3 className="font-heading text-headline-md text-on-surface font-bold">
            Consultation Completed!
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-md">
            SOAP note signed, Rx dispatched to Central Pharmacy, and STAT lab order routed to Diagnostics.
          </p>
          <span className="px-3 py-1 bg-secondary-fixed/50 text-on-secondary-fixed text-label-sm rounded-full font-semibold uppercase tracking-wider">
            Queue Advanced Live
          </span>
        </div>
      ) : (
        <form onSubmit={handleFinish} className="space-y-space-md">
          {/* Active Encounter Banner */}
          <div className="flex items-center justify-between p-space-md bg-secondary-fixed/20 rounded-xl border border-primary/20">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">personal_injury</span>
              <div>
                <p className="text-headline-sm font-heading font-semibold text-on-surface">{patientName}</p>
                <p className="text-body-sm text-on-surface-variant">
                  MRN: 00482910 • 54Y Male • Token #{activePatient?.token ?? 7} • Chief Complaint: {activePatient?.complaint ?? 'Chest tightness'}
                </p>
              </div>
            </div>
            <span className="text-label-sm bg-primary text-on-primary px-3 py-1 rounded-full font-bold">
              Active Exam
            </span>
          </div>

          {/* Clinical Voice Note Dictation Option */}
          <VoiceNoteRecorder onAppendNote={handleAppendVoiceNote} />

          {/* SOAP Notes Grid */}
          <div className="space-y-space-sm">
            <div>
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Subjective (S) — History of Present Illness
              </label>
              <textarea
                rows={2}
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                className="input-field text-body-sm resize-none"
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Objective (O) — Clinical Exam & Vitals
              </label>
              <textarea
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="input-field text-body-sm resize-none"
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Assessment (A) — Primary Diagnosis / ICD-10
              </label>
              <select
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                className="input-field bg-white font-medium"
              >
                <option value="I10 — Essential (primary) hypertension">I10 — Essential (primary) hypertension</option>
                <option value="R07.9 — Chest pain, unspecified">R07.9 — Chest pain, unspecified</option>
                <option value="E11.9 — Type 2 diabetes mellitus without complications">E11.9 — Type 2 diabetes mellitus without complications</option>
                <option value="J06.9 — Acute upper respiratory infection">J06.9 — Acute upper respiratory infection</option>
              </select>
            </div>
            <div>
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Plan (P) — Treatment & Orders
              </label>
              <textarea
                rows={2}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="input-field text-body-sm resize-none"
              />
            </div>
          </div>

          {/* Rx Builder Section */}
          <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-space-sm">
            <div className="flex items-center gap-space-xs text-primary font-semibold text-label-md uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">prescriptions</span>
              Electronic Prescription (e-Rx)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <div>
                <span className="text-label-sm text-on-surface-variant block mb-1">Medication</span>
                <select
                  value={rxDrug}
                  onChange={(e) => setRxDrug(e.target.value)}
                  className="input-field bg-white text-label-md"
                >
                  <option value="Lisinopril 10mg">Lisinopril 10mg</option>
                  <option value="Atorvastatin 20mg">Atorvastatin 20mg</option>
                  <option value="Amoxicillin 500mg">Amoxicillin 500mg</option>
                  <option value="Metformin 500mg">Metformin 500mg</option>
                  <option value="Albuterol HFA">Albuterol Inhaler</option>
                </select>
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant block mb-1">Dosage & Frequency</span>
                <input
                  type="text"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  className="input-field text-label-md"
                />
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant block mb-1">Duration</span>
                <input
                  type="text"
                  value={rxDuration}
                  onChange={(e) => setRxDuration(e.target.value)}
                  className="input-field text-label-md"
                />
              </div>
            </div>
          </div>

          {/* Lab Requisitions */}
          <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-space-xs">
            <div className="flex items-center gap-space-xs text-primary font-semibold text-label-md uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">biotech</span>
              Diagnostic Lab Orders
            </div>
            <div className="flex flex-wrap gap-space-xs pt-1">
              {[
                'Troponin I (STAT)',
                'Serum Potassium',
                'Comprehensive Metabolic Panel',
                '12-Lead ECG',
                'CBC with Differential',
              ].map((lab) => {
                const checked = orderLabs.includes(lab)
                return (
                  <button
                    type="button"
                    key={lab}
                    onClick={() => toggleLab(lab)}
                    className={`px-3 py-1.5 rounded-full text-label-sm flex items-center gap-1.5 transition-all ${
                      checked
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {checked ? 'check' : 'add'}
                    </span>
                    {lab}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-space-md border-t border-outline-variant/20 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setConsultOpen(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <div className="flex items-center gap-space-sm">
              <button type="submit" className="btn-primary">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Sign & Complete Encounter</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
