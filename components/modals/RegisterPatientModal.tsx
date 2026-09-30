'use client'

import React, { useState, useEffect, useCallback } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import {
  registerPatient,
  fetchDoctors,
  type DoctorProfile,
  type RegisterPatientPayload,
} from '@/lib/data'

// Demo-mode fallback doctors when DB returns nothing (e.g. no real auth session)
const DEMO_DOCTORS: DoctorProfile[] = [
  { id: 'demo-doctor-id', display_name: 'Dr. Sarah Jenkins, MD', department: 'Cardiology' },
  { id: 'demo-alan-id',   display_name: 'Dr. Alan Bradley, MD',  department: 'Internal Medicine' },
  { id: 'demo-emily-id', display_name: 'Dr. Emily Watson, MD',  department: 'Pediatrics' },
  { id: 'demo-rajesh-id',display_name: 'Dr. Rajesh Patel, MD',  department: 'Orthopedics' },
]

/** Convert an age in years to a rough ISO birth-date (Jan 1 of birth year). */
function ageToISODate(ageStr: string): string {
  const n = parseInt(ageStr, 10)
  if (isNaN(n) || n < 0 || n > 150) return '1990-01-01'
  return `${new Date().getFullYear() - n}-01-01`
}

export default function RegisterPatientModal() {
  const { isRegisterOpen, setRegisterOpen, addQueuePatient, queue } = useClinicRealtime()

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [age,       setAge]       = useState('')
  const [gender,    setGender]    = useState<'male' | 'female' | 'other'>('male')
  const [phone,     setPhone]     = useState('')
  const [email,     setEmail]     = useState('')
  const [complaint, setComplaint] = useState('')
  const [priority,  setPriority]  = useState<'routine' | 'urgent' | 'emergency'>('routine')
  const [visitType, setVisitType] = useState<RegisterPatientPayload['visit_type']>('opd')

  // Doctor selector
  const [doctors,          setDoctors]          = useState<DoctorProfile[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')

  // UI states
  const [isSubmitting,  setIsSubmitting]  = useState(false)
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<{ token: number; mrn: string; name: string } | null>(null)

  const nextToken = (queue[queue.length - 1]?.token ?? 12) + 1

  // Load doctors each time the modal opens
  useEffect(() => {
    if (!isRegisterOpen) return
    fetchDoctors().then((rows) => {
      const list = rows.length > 0 ? rows : DEMO_DOCTORS
      setDoctors(list)
      setSelectedDoctorId((prev) => prev || (list[0]?.id ?? ''))
    })
  }, [isRegisterOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = useCallback(() => {
    setFirstName(''); setLastName(''); setAge(''); setPhone(''); setEmail('')
    setComplaint(''); setPriority('routine'); setVisitType('opd')
    setSuccessResult(null); setErrorMsg(null)
  }, [])

  const handleClose = useCallback(() => { resetForm(); setRegisterOpen(false) }, [resetForm, setRegisterOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !complaint.trim()) return
    if (!selectedDoctorId) { setErrorMsg('Please select an attending doctor.'); return }

    setIsSubmitting(true)
    setErrorMsg(null)

    const genderMap: Record<string, RegisterPatientPayload['gender']> = {
      male: 'male', female: 'female', other: 'other',
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const validDoctorId = selectedDoctorId && uuidRegex.test(selectedDoctorId)
      ? selectedDoctorId
      : doctors.find(d => uuidRegex.test(d.id))?.id || selectedDoctorId

    const result = await registerPatient({
      first_name:      firstName.trim(),
      last_name:       lastName.trim(),
      dob:             ageToISODate(age),
      gender:          genderMap[gender] ?? 'other',
      phone:           phone.trim() || '+0000000000',
      email:           email.trim() || undefined,
      chief_complaint: complaint.trim(),
      visit_type:      visitType,
      priority,
      doctor_id:       validDoctorId,
    })

    setIsSubmitting(false)

    if (!result.ok) {
      setErrorMsg(result.error)
      return
    }

    // Optimistic local queue update (instant cross-tab broadcast)
    addQueuePatient({
      name:      `${firstName.trim()} ${lastName.trim()}`,
      age:       `${age || '?'}${gender === 'male' ? 'M' : gender === 'female' ? 'F' : ''}`,
      complaint: complaint.trim(),
      priority,
      status:    'waiting',
    })

    setSuccessResult({ token: result.queue_token, mrn: result.mrn, name: `${firstName.trim()} ${lastName.trim()}` })
    setTimeout(() => { resetForm(); setRegisterOpen(false) }, 2400)
  }

  return (
    <ModalBackdrop
      isOpen={isRegisterOpen}
      onClose={handleClose}
      title="Register & Issue OPD Token"
      subtitle="St. Jude Medical Center — Front Desk Registration"
      icon="person_add"
    >
      {successResult !== null ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary animate-bounce">
            <span className="material-symbols-outlined text-[36px]">confirmation_number</span>
          </div>
          <h3 className="font-heading text-headline-md text-on-surface font-bold">
            Token #{successResult.token} Issued!
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            <strong>{successResult.name}</strong> registered and queued in Doctor Workspace.
          </p>
          <span className="px-3 py-1 bg-primary/10 text-primary text-label-sm rounded-full font-semibold uppercase tracking-wider font-mono">
            MRN #{successResult.mrn}
          </span>
          <span className="px-3 py-1 bg-secondary-fixed/50 text-on-secondary-fixed text-label-sm rounded-full font-semibold uppercase tracking-wider">
            Saved to Database · Realtime Synced
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-space-md">
          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-body-sm">
              <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}
          {/* Token issuance banner */}
          <div className="flex items-center justify-between p-space-md bg-secondary-fixed/30 rounded-xl border border-primary/20">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">confirmation_number</span>
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase font-semibold">Next In Sequence</p>
                <p className="text-headline-sm font-heading font-bold text-primary">Token #{nextToken}</p>
              </div>
            </div>
            <span className="text-label-sm px-2.5 py-1 bg-surface-container-lowest text-primary rounded-full font-bold shadow-sm">
              Live Queue Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="text-label-md text-on-surface-variant block mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Alexander"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant block mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Hayes"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-space-sm">
            <div>
              <label className="text-label-md text-on-surface-variant block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 45"
                min="0"
                max="120"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="input-field bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant block mb-1">Visit Type</label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value as RegisterPatientPayload['visit_type'])}
                className="input-field bg-white"
              >
                <option value="opd">OPD</option>
                <option value="follow_up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="telehealth">Telehealth</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-label-md text-on-surface-variant block mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="input-field"
            />
          </div>

          {/* Attending Doctor */}
          <div>
            <label className="text-label-md text-on-surface-variant block mb-1">Attending Doctor *</label>
            <select
              required
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="input-field bg-white"
            >
              {doctors.length === 0 && <option value="">Loading doctors…</option>}
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.display_name}{doc.department ? ` — ${doc.department}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-label-md text-on-surface-variant block mb-1">Chief Complaint *</label>
            <textarea
              required
              rows={2}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="e.g. Persistent migraine with visual aura for 2 days..."
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="text-label-md text-on-surface-variant block mb-2">Triage Priority</label>
            <div className="grid grid-cols-3 gap-space-sm">
              {[
                { level: 'routine', label: 'Routine (OPD)', icon: 'schedule', color: 'border-outline-variant text-on-surface' },
                { level: 'urgent', label: 'Urgent Priority', icon: 'warning', color: 'border-status-warning/40 text-status-warning' },
                { level: 'emergency', label: 'Emergency Red', icon: 'emergency', color: 'border-tertiary/40 text-tertiary' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.level}
                  onClick={() => setPriority(t.level as 'routine' | 'urgent' | 'emergency')}
                  className={`flex flex-col items-center justify-center p-space-sm rounded-xl border-2 transition-all ${
                    priority === t.level
                      ? 'bg-secondary-fixed/40 border-primary font-bold shadow-sm'
                      : 'bg-surface-container-low hover:bg-surface-container border-transparent text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-1">{t.icon}</span>
                  <span className="text-label-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-space-md border-t border-outline-variant/20 flex items-center justify-end gap-space-sm">
            <button
              type="button"
              onClick={handleClose}
              className="btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !selectedDoctorId}>
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Registering…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Register &amp; Issue Token #{nextToken}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
