'use client'

import React, { useState } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import { createClientSideClient } from '@/lib/supabase/client'

export const DEPARTMENTS = [
  { id: 'cardio', name: 'Cardiology', doctor: 'Dr. Sarah Jenkins' },
  { id: 'derm', name: 'Dermatology', doctor: 'Dr. Maya Lin' },
  { id: 'general', name: 'General Medicine', doctor: 'Dr. Alan Bradley' },
  { id: 'neuro', name: 'Neurology', doctor: 'Dr. Robert Chen' },
  { id: 'ortho', name: 'Orthopedics', doctor: 'Dr. Rajesh Patel' },
  { id: 'pediatrics', name: 'Pediatrics', doctor: 'Dr. Elena Rostova' },
  { id: 'ent', name: 'ENT & Pulmonology', doctor: 'Dr. Marcus Vance' },
  { id: 'gastro', name: 'Gastroenterology', doctor: 'Dr. Angela Davis' },
]

export default function InstantBookingModal() {
  const {
    isBookingOpen,
    setBookingOpen,
    addQueuePatient,
    bookingPrefill,
    setBookingPrefill,
  } = useClinicRealtime()

  const [patientName, setPatientName] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('General Medicine')
  const [doctor, setDoctor] = useState('Dr. Alan Bradley')
  const [timeSlot, setTimeSlot] = useState('Immediate / Walk-In')
  const [complaint, setComplaint] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [allocatedToken, setAllocatedToken] = useState<number | null>(null)

  // Auto-populate when prefill data is passed from AI Symptom Checker or other modules
  React.useEffect(() => {
    if (bookingPrefill) {
      if (bookingPrefill.department) {
        setDepartment(bookingPrefill.department)
        const match = DEPARTMENTS.find((d) => d.name.toLowerCase() === bookingPrefill.department?.toLowerCase())
        if (match) setDoctor(match.doctor)
      }
      if (bookingPrefill.doctor) setDoctor(bookingPrefill.doctor)
      if (bookingPrefill.complaint) setComplaint(bookingPrefill.complaint)
    }
  }, [bookingPrefill, isBookingOpen])

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = DEPARTMENTS.find((d) => d.name === e.target.value)
    setDepartment(e.target.value)
    if (selected) setDoctor(selected.doctor)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientName) return

    setSubmitting(true)
    const token = Date.now() % 100

    // 1. Optimistic live queue insertion
    const newQueueItem = addQueuePatient({
      name: patientName,
      age: 'Adult',
      complaint: complaint || `${department} Consultation`,
      priority: 'routine',
      status: 'waiting',
    })

    setAllocatedToken(newQueueItem.token)

    // 2. Persist to Supabase if available
    try {
      const supabase = createClientSideClient()
      await (supabase.from('appointments') as any).insert({
        scheduled_at: new Date().toISOString(),
        status: 'scheduled',
        queue_token: newQueueItem.token,
        chief_complaint: complaint || `${department} Consultation`,
      })
    } catch {
      // Graceful fallback
    }

    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setBookingOpen(false)
      setBookingPrefill(null)
      setPatientName('')
      setPhone('')
      setComplaint('')
    }, 1800)
  }

  return (
    <ModalBackdrop
      isOpen={isBookingOpen}
      onClose={() => {
        setBookingOpen(false)
        setBookingPrefill(null)
      }}
      title="Instant Appointment Booking"
      subtitle="Schedule a consultation and allocate an OPD queue token"
      icon="event_available"
      maxWidth="max-w-xl"
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mx-auto animate-bounce">
            <span className="material-symbols-outlined text-[36px]">how_to_reg</span>
          </div>
          <h3 className="font-heading text-headline-md font-bold text-on-surface">
            Appointment Booked!
          </h3>
          <p className="text-body-md text-on-surface-variant">
            Token <span className="font-bold text-primary font-mono text-headline-sm">#{allocatedToken}</span> assigned to {patientName}.
          </p>
          <span className="inline-block px-3 py-1 bg-secondary-fixed/50 text-on-secondary-fixed text-label-sm rounded-full font-semibold">
            Live Waiting Queue Updated
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-label-sm text-on-surface font-semibold block mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g., Jennifer Blake"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface font-semibold block mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-label-sm text-on-surface font-semibold block mb-1">
                Clinical Department
              </label>
              <select
                value={department}
                onChange={handleDeptChange}
                className="input-field"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface font-semibold block mb-1">
                Consulting Physician
              </label>
              <input
                type="text"
                readOnly
                value={doctor}
                className="input-field bg-surface-container-low text-on-surface-variant cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-label-sm text-on-surface font-semibold block mb-1">
                Appointment Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="input-field"
              >
                <option>Immediate / Walk-In</option>
                <option>Today 10:30 AM</option>
                <option>Today 11:45 AM</option>
                <option>Today 02:15 PM</option>
                <option>Today 04:00 PM</option>
                <option>Tomorrow Morning</option>
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface font-semibold block mb-1">
                Chief Complaint / Symptoms
              </label>
              <input
                type="text"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="e.g., Fever, routine follow-up"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !patientName}
              className="btn-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              <span>{submitting ? 'Confirming...' : 'Book & Allocate Token'}</span>
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
