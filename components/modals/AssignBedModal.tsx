'use client'

import React, { useState, useEffect, useMemo } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'

export default function AssignBedModal() {
  const {
    isAssignBedOpen,
    setAssignBedOpen,
    activeAssignBedId,
    beds,
    assignBed,
    queue,
  } = useClinicRealtime()

  const [selectedBedId, setSelectedBedId] = useState<string>('')
  const [patientName, setPatientName] = useState('')
  const [age, setAge] = useState('45M')
  const [condition, setCondition] = useState('Inpatient Medical Observation')
  const [stayDuration, setStayDuration] = useState('3_days')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState<{
    bedId: string
    patientName: string
  } | null>(null)

  // Sync selected bed when modal opens or activeAssignBedId changes
  useEffect(() => {
    if (!isAssignBedOpen) {
      setErrorMsg(null)
      setSavedSuccess(null)
      return
    }

    if (activeAssignBedId) {
      setSelectedBedId(activeAssignBedId)
    } else {
      const firstAvailable = beds.find((b) => b.status === 'available')
      setSelectedBedId(firstAvailable ? firstAvailable.id : beds[0]?.id || 'A-01')
    }

    // Default patient if queue has waiting patients
    const waitingPat = queue.find((p) => p.status === 'waiting' || p.status === 'in_examination')
    if (waitingPat) {
      setPatientName(waitingPat.name)
      setAge(waitingPat.age || '45M')
      setCondition(waitingPat.complaint || 'Inpatient Medical Observation')
    } else {
      setPatientName('Carlos Mendez')
      setAge('49M')
      setCondition('Chest Pain Observation')
    }
    setStayDuration('3_days')
  }, [isAssignBedOpen, activeAssignBedId, beds, queue])

  const selectedBed = useMemo(() => {
    return beds.find((b) => b.id === selectedBedId) || null
  }, [beds, selectedBedId])

  const isBedOccupied = selectedBed?.status === 'occupied'
  const isBedMaintenance = selectedBed?.status === 'maintenance'

  const handlePatientSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (!val) return
    const pat = queue.find((p) => p.id === val)
    if (pat) {
      setPatientName(pat.name)
      setAge(pat.age || '45M')
      setCondition(pat.complaint || 'Inpatient Observation')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBedId) {
      setErrorMsg('Please select a hospital bed.')
      return
    }
    if (!patientName.trim()) {
      setErrorMsg('Please provide the patient name for admission.')
      return
    }
    if (isBedOccupied) {
      setErrorMsg(`Bed ${selectedBedId} is currently occupied. Please select an available bed.`)
      return
    }
    if (isBedMaintenance) {
      setErrorMsg(`Bed ${selectedBedId} is currently under maintenance.`)
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    // Calculate expected discharge timestamp
    let daysToAdd = 3
    if (stayDuration === '24_hours') daysToAdd = 1
    if (stayDuration === '5_days') daysToAdd = 5
    if (stayDuration === '7_days') daysToAdd = 7
    const expectedDischargeAt = new Date(Date.now() + daysToAdd * 86400000).toISOString()

    try {
      const ok = await assignBed(
        selectedBedId,
        patientName.trim(),
        age.trim(),
        condition.trim(),
        expectedDischargeAt
      )

      if (ok === false) {
        setErrorMsg('Failed to persist bed allocation. Please check database permissions.')
        setIsSubmitting(false)
        return
      }

      setSavedSuccess({
        bedId: selectedBedId,
        patientName: patientName.trim(),
      })

      setTimeout(() => {
        setIsSubmitting(false)
        setSavedSuccess(null)
        setAssignBedOpen(false)
      }, 1400)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred while assigning bed.')
      setIsSubmitting(false)
    }
  }

  return (
    <ModalBackdrop
      isOpen={isAssignBedOpen}
      onClose={() => setAssignBedOpen(false)}
      title="Inpatient Bed Allocation"
      subtitle="Allocate an available ward bed and initialize inpatient admission"
      icon="airline_seat_individual_suite"
    >
      {savedSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-status-success/20 flex items-center justify-center text-status-success animate-bounce">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>
          <h3 className="font-heading text-headline-md text-on-surface font-bold">
            Bed Allocated Successfully!
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            Bed <span className="font-mono font-bold text-on-surface">{savedSuccess.bedId}</span> is now assigned to{' '}
            <span className="font-semibold text-on-surface">{savedSuccess.patientName}</span>. Inpatient admission record created.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-space-md">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-status-critical/10 border border-status-critical/30 text-status-critical text-body-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bed Selection & Status Overview */}
          <div className="p-space-md bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">bed</span>
                Select Hospital Bed
              </label>
              {selectedBed && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-label-sm font-bold uppercase tracking-wider ${
                    selectedBed.status === 'available'
                      ? 'bg-status-success/20 text-status-success'
                      : selectedBed.status === 'occupied'
                      ? 'bg-status-critical/20 text-status-critical'
                      : 'bg-status-warning/20 text-status-warning'
                  }`}
                >
                  {selectedBed.status}
                </span>
              )}
            </div>

            <select
              value={selectedBedId}
              onChange={(e) => setSelectedBedId(e.target.value)}
              className="input-field font-semibold text-body-lg"
              required
            >
              {beds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} ({b.ward}) — {b.status.toUpperCase()}
                  {b.patient ? ` [Occupied: ${b.patient}]` : ''}
                </option>
              ))}
            </select>

            {isBedOccupied && (
              <p className="text-label-sm text-status-critical flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Warning: This bed is already occupied by {selectedBed?.patient}. Please select an available bed.
              </p>
            )}
            {isBedMaintenance && (
              <p className="text-label-sm text-status-warning flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px]">build</span>
                Warning: This bed is currently under maintenance / sanitation.
              </p>
            )}
          </div>

          {/* Quick Select from Queue */}
          {queue.length > 0 && (
            <div className="space-y-1">
              <label className="text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">person_search</span>
                Fast Fill from Active Patients
              </label>
              <select
                onChange={handlePatientSelectChange}
                defaultValue=""
                className="input-field text-body-sm"
              >
                <option value="" disabled>
                  -- Select a waiting patient to auto-fill details --
                </option>
                {queue.map((p) => (
                  <option key={p.id} value={p.id}>
                    Token #{p.token} • {p.name} ({p.age}) — {p.complaint}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            <div className="sm:col-span-2">
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Carlos Mendez"
                className="input-field font-medium"
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Age / Gender *
              </label>
              <input
                type="text"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="49M"
                className="input-field font-medium"
              />
            </div>
          </div>

          {/* Admission Reason / Condition */}
          <div>
            <label className="text-label-md text-on-surface font-semibold block mb-1">
              Admission Diagnosis / Condition *
            </label>
            <input
              type="text"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Chest Pain Observation, Post-op Knee Arthroplasty"
              className="input-field"
            />
          </div>

          {/* Expected Stay Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div>
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Expected Stay Duration
              </label>
              <select
                value={stayDuration}
                onChange={(e) => setStayDuration(e.target.value)}
                className="input-field text-body-sm"
              >
                <option value="24_hours">24 Hours (Observation)</option>
                <option value="3_days">3 Days (Medical Standard)</option>
                <option value="5_days">5 Days (Post-op / Complex)</option>
                <option value="7_days">7 Days (Extended Recovery)</option>
              </select>
            </div>
            <div>
              <label className="text-label-md text-on-surface font-semibold block mb-1">
                Assigned Ward
              </label>
              <input
                type="text"
                disabled
                value={selectedBed?.ward || 'General Ward'}
                className="input-field bg-surface-container text-on-surface-variant cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-space-md border-t border-outline-variant/20 flex items-center justify-end gap-space-sm">
            <button
              type="button"
              onClick={() => setAssignBedOpen(false)}
              className="btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isBedOccupied || isBedMaintenance}
              className={`btn-primary flex items-center gap-2 ${
                isBedOccupied || isBedMaintenance ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Persisting Allocation...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Confirm Bed Allocation</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
