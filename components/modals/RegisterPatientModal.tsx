'use client'

import React, { useState } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'

export default function RegisterPatientModal() {
  const { isRegisterOpen, setRegisterOpen, addQueuePatient, queue } = useClinicRealtime()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M')
  const [phone, setPhone] = useState('')
  const [complaint, setComplaint] = useState('')
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'emergency'>('routine')
  const [visitType, setVisitType] = useState('opd')
  const [successToken, setSuccessToken] = useState<number | null>(null)

  const nextToken = (queue[queue.length - 1]?.token ?? 12) + 1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !complaint) return

    const fullName = `${firstName.trim()} ${lastName.trim()}`
    const ageStr = `${age || '35'}${gender === 'M' ? 'M' : gender === 'F' ? 'F' : ''}`

    const newPatient = addQueuePatient({
      name: fullName,
      age: ageStr,
      complaint,
      priority,
      status: 'waiting',
    })

    setSuccessToken(newPatient.token)
    setTimeout(() => {
      setSuccessToken(null)
      setFirstName('')
      setLastName('')
      setAge('')
      setPhone('')
      setComplaint('')
      setPriority('routine')
      setRegisterOpen(false)
    }, 1800)
  }

  return (
    <ModalBackdrop
      isOpen={isRegisterOpen}
      onClose={() => setRegisterOpen(false)}
      title="Register & Issue OPD Token"
      subtitle="St. Jude Medical Center — Front Desk Registration"
      icon="person_add"
    >
      {successToken !== null ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary animate-bounce">
            <span className="material-symbols-outlined text-[36px]">confirmation_number</span>
          </div>
          <h3 className="font-heading text-headline-md text-on-surface font-bold">
            Token #{successToken} Issued!
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            Patient registered successfully and queued in Doctor Workspace.
          </p>
          <span className="px-3 py-1 bg-secondary-fixed/50 text-on-secondary-fixed text-label-sm rounded-full font-semibold uppercase tracking-wider">
            Realtime Synced Across Clinics
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-space-md">
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
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant block mb-1">Visit Type</label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
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
                  onClick={() => setPriority(t.level as any)}
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
              onClick={() => setRegisterOpen(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Register & Issue Token #{nextToken}</span>
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
