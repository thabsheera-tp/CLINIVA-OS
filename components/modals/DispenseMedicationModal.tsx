'use client'

import React, { useState } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'

export default function DispenseMedicationModal() {
  const { isDispenseOpen, setDispenseOpen } = useClinicRealtime()

  const [allergyChecked, setAllergyChecked] = useState(true)
  const [dosageChecked, setDosageChecked] = useState(true)
  const [batchNum, setBatchNum] = useState('BAT-LIS-9912')
  const [dispensed, setDispensed] = useState(false)

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault()
    setDispensed(true)
    setTimeout(() => {
      setDispensed(false)
      setDispenseOpen(false)
    }, 1500)
  }

  return (
    <ModalBackdrop
      isOpen={isDispenseOpen}
      onClose={() => setDispenseOpen(false)}
      title="Verify & Dispense Medication"
      subtitle="Rx #RX-2026-0914 • Marcus Delacroix"
      icon="medication"
    >
      {dispensed ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary animate-bounce">
            <span className="material-symbols-outlined text-[36px]">done_all</span>
          </div>
          <h3 className="font-heading text-headline-md text-on-surface font-bold">
            Medication Dispensed!
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            Batch BAT-LIS-9912 deducted 30 units from inventory. Patient record updated.
          </p>
          <span className="px-3 py-1 bg-secondary-fixed/50 text-on-secondary-fixed text-label-sm rounded-full font-semibold uppercase tracking-wider">
            Pharmacy Inventory Synced Live
          </span>
        </div>
      ) : (
        <form onSubmit={handleDispense} className="space-y-space-md">
          {/* Rx Overview Box */}
          <div className="p-space-md bg-secondary-fixed/20 rounded-xl border border-primary/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-label-sm font-semibold text-primary uppercase">Prescription Order</span>
              <span className="text-label-sm text-on-surface-variant">Prescriber: Dr. Sarah Jenkins, MD</span>
            </div>
            <p className="text-headline-sm font-heading font-semibold text-on-surface">Lisinopril 10mg Tablets</p>
            <p className="text-body-sm text-on-surface-variant">Sig: Take 1 tablet orally once daily with water • Qty: 30 Tablets</p>
          </div>

          {/* Safety Verification Checklist */}
          <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2">
            <p className="text-label-md font-semibold text-on-surface uppercase tracking-wider">
              Safety & Verification Checklist
            </p>
            <label className="flex items-center gap-space-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allergyChecked}
                onChange={(e) => setAllergyChecked(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20"
              />
              <span className="text-body-sm text-on-surface">
                Verified allergies (Patient known allergies: Penicillin, Sulfa — No ACE-i conflict)
              </span>
            </label>
            <label className="flex items-center gap-space-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dosageChecked}
                onChange={(e) => setDosageChecked(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20"
              />
              <span className="text-body-sm text-on-surface">
                Verified dosage range and frequency with renal function chart
              </span>
            </label>
          </div>

          {/* Batch Selector */}
          <div>
            <label className="text-label-md text-on-surface font-semibold block mb-1">
              Select Batch for Dispensing
            </label>
            <select
              value={batchNum}
              onChange={(e) => setBatchNum(e.target.value)}
              className="input-field bg-white font-mono"
            >
              <option value="BAT-LIS-9912">Batch BAT-LIS-9912 (Stock: 840 units • Exp: Aug 2027)</option>
              <option value="BAT-LIS-8821">Batch BAT-LIS-8821 (Stock: 120 units • Exp: Dec 2026)</option>
            </select>
          </div>

          <div className="pt-space-md border-t border-outline-variant/20 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setDispenseOpen(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!allergyChecked || !dosageChecked}
              className="btn-primary disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Confirm & Dispense 30 Tablets</span>
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
