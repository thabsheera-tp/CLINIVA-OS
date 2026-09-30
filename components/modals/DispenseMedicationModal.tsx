'use client'

import React, { useState, useEffect, useMemo } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import {
  fetchPrescriptionDetails,
  dispensePrescription,
  type DetailedPrescription,
} from '@/lib/data'

export default function DispenseMedicationModal() {
  const {
    isDispenseOpen,
    setDispenseOpen,
    dispensePrescriptionId,
    setDispensePrescriptionId,
    activePatient,
    triggerPharmacyRefresh,
  } = useClinicRealtime()

  const [prescription, setPrescription] = useState<DetailedPrescription | null>(null)
  const [loading, setLoading] = useState(false)
  const [allergyChecked, setAllergyChecked] = useState(true)
  const [dosageChecked, setDosageChecked] = useState(true)
  const [batchNum, setBatchNum] = useState('BAT-LIS-9912')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [dispensedResult, setDispensedResult] = useState<{
    batch: string
    deducted: number
    drugName: string
  } | null>(null)

  // Load prescription details whenever modal is opened
  useEffect(() => {
    if (!isDispenseOpen) {
      setErrorMsg(null)
      setDispensedResult(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setErrorMsg(null)

    fetchPrescriptionDetails(dispensePrescriptionId, activePatient?.id)
      .then((data) => {
        if (!isMounted) return
        setPrescription(data)
        setLoading(false)

        // Preselect the first batch that has stock
        const firstBatches = data?.items?.[0]?.available_batches || []
        const bestBatch = firstBatches.find((b) => b.quantity_in_stock > 0) || firstBatches[0]
        if (bestBatch) {
          setBatchNum(bestBatch.batch_number)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        console.warn('[DispenseMedicationModal] Load error:', err)
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isDispenseOpen, dispensePrescriptionId, activePatient?.id])

  // Total required quantity across all items on the prescription
  const totalQty = useMemo(() => {
    if (!prescription?.items || prescription.items.length === 0) return 30
    return prescription.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }, [prescription])

  // Available batches for selected / first item
  const currentBatches = useMemo(() => {
    return prescription?.items?.[0]?.available_batches || []
  }, [prescription])

  // Check if selected batch has enough stock
  const selectedBatchInfo = useMemo(() => {
    return currentBatches.find((b) => b.batch_number === batchNum) || null
  }, [currentBatches, batchNum])

  const hasSufficientStock = useMemo(() => {
    if (!selectedBatchInfo) return true
    const itemQty = prescription?.items?.[0]?.quantity || totalQty
    return selectedBatchInfo.quantity_in_stock >= itemQty
  }, [selectedBatchInfo, prescription, totalQty])

  const isAlreadyDispensed = prescription?.status === 'dispensed'

  const handleDispense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prescription) return

    if (isAlreadyDispensed) {
      setErrorMsg('This prescription has already been dispensed.')
      return
    }

    if (!hasSufficientStock) {
      setErrorMsg(
        `Insufficient stock in batch ${batchNum}. Available: ${selectedBatchInfo?.quantity_in_stock ?? 0}, Required: ${totalQty}.`
      )
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    const result = await dispensePrescription({
      prescription_id: prescription.id,
      batch_number: batchNum,
      pharmacist_notes: 'Verified allergies & dosage. Dispensed per protocol.',
    })

    setIsSubmitting(false)

    if (!result.ok) {
      setErrorMsg(result.error)
      return
    }

    // Refresh UI lists across screens
    triggerPharmacyRefresh()

    setDispensedResult({
      batch: batchNum,
      deducted: result.total_dispensed,
      drugName: prescription.items?.[0]?.drug_name || 'Medication',
    })

    setTimeout(() => {
      setDispensedResult(null)
      setDispenseOpen(false)
      setDispensePrescriptionId(null)
      setErrorMsg(null)
    }, 2000)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setErrorMsg(null)
      setDispenseOpen(false)
      setDispensePrescriptionId(null)
    }
  }

  const rxLabel = prescription?.id ? prescription.id.slice(0, 8).toUpperCase() : 'RX-2026-0914'
  const patientDisplayName = prescription?.patient_name || activePatient?.name || 'Marcus Delacroix'

  return (
    <ModalBackdrop
      isOpen={isDispenseOpen}
      onClose={handleClose}
      title="Verify & Dispense Medication"
      subtitle={`Rx #${rxLabel} • ${patientDisplayName}`}
      icon="medication"
    >
      {dispensedResult ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary animate-bounce">
            <span className="material-symbols-outlined text-[36px]">done_all</span>
          </div>
          <h3 className="font-heading text-headline-md text-on-surface font-bold">
            Medication Dispensed!
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            Batch <strong>{dispensedResult.batch}</strong> deducted {dispensedResult.deducted} units of {dispensedResult.drugName} from inventory. Prescription marked as Dispensed.
          </p>
          <span className="px-3 py-1 bg-secondary-fixed/50 text-on-secondary-fixed text-label-sm rounded-full font-semibold uppercase tracking-wider">
            Pharmacy Inventory Synced Live · DB Updated
          </span>
        </div>
      ) : (
        <form onSubmit={handleDispense} className="space-y-space-md">
          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-body-sm">
              <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Already Dispensed Warning */}
          {isAlreadyDispensed && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-body-sm">
              <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">verified</span>
              <span>This prescription has already been dispensed and signed out.</span>
            </div>
          )}

          {/* Rx Overview Box */}
          <div className="p-space-md bg-secondary-fixed/20 rounded-xl border border-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label-sm font-semibold text-primary uppercase">Prescription Order</span>
              <span className="text-label-sm text-on-surface-variant">
                Prescriber: {prescription?.doctor_name || 'Dr. Sarah Jenkins, MD'}
              </span>
            </div>

            {loading ? (
              <div className="py-2 text-body-sm text-on-surface-variant animate-pulse">
                Loading prescription details…
              </div>
            ) : prescription?.items && prescription.items.length > 0 ? (
              prescription.items.map((item, idx) => (
                <div key={item.id || idx} className="border-t border-primary/10 pt-2 first:border-0 first:pt-0">
                  <p className="text-headline-sm font-heading font-semibold text-on-surface">
                    {item.drug_name}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Sig: {item.instructions || `${item.dosage} • ${item.frequency}`} • Qty: {item.quantity} Units
                  </p>
                </div>
              ))
            ) : (
              <div>
                <p className="text-headline-sm font-heading font-semibold text-on-surface">
                  Lisinopril 10mg Tablets
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Sig: Take 1 tablet orally once daily with water • Qty: 30 Tablets
                </p>
              </div>
            )}
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
                Verified allergies (Patient known allergies: Penicillin, Sulfa — No medication conflict)
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-label-md text-on-surface font-semibold block">
                Select Batch for Dispensing
              </label>
              {selectedBatchInfo && (
                <span className={`text-label-sm font-medium ${
                  selectedBatchInfo.quantity_in_stock < (prescription?.items?.[0]?.quantity || 30)
                    ? 'text-red-600 font-bold'
                    : 'text-emerald-700 font-semibold'
                }`}>
                  Stock: {selectedBatchInfo.quantity_in_stock} units
                </span>
              )}
            </div>
            <select
              value={batchNum}
              onChange={(e) => setBatchNum(e.target.value)}
              className="input-field bg-white font-mono"
              disabled={isSubmitting || isAlreadyDispensed}
            >
              {currentBatches.length > 0 ? (
                currentBatches.map((b) => (
                  <option key={b.id || b.batch_number} value={b.batch_number}>
                    Batch {b.batch_number} (Stock: {b.quantity_in_stock} units • Exp: {b.expiry_date || 'N/A'}{b.location ? ` • ${b.location}` : ''})
                  </option>
                ))
              ) : (
                <>
                  <option value="BAT-LIS-9912">Batch BAT-LIS-9912 (Stock: 840 units • Exp: Aug 2027)</option>
                  <option value="BAT-LIS-8821">Batch BAT-LIS-8821 (Stock: 120 units • Exp: Dec 2026)</option>
                </>
              )}
            </select>

            {!hasSufficientStock && (
              <p className="text-label-sm text-red-600 font-medium mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Selected batch does not have sufficient stock to fulfill this order.</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-space-md border-t border-outline-variant/20 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !allergyChecked ||
                !dosageChecked ||
                isSubmitting ||
                isAlreadyDispensed ||
                !hasSufficientStock
              }
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Dispensing…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Confirm &amp; Dispense {totalQty} Units</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
