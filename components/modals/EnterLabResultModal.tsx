'use client'

import React, { useState, useEffect, useMemo } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import {
  fetchLabOrderDetails,
  fetchLabTests,
  saveLabResult,
  type DetailedLabOrder,
} from '@/lib/data'

export default function EnterLabResultModal() {
  const {
    isLabResultOpen,
    setLabResultOpen,
    activeLabOrderId,
    setActiveLabOrderId,
    triggerLabRefresh,
  } = useClinicRealtime()

  const [order, setOrder] = useState<DetailedLabOrder | null>(null)
  const [catalogTests, setCatalogTests] = useState<{ id: string; test_code: string; test_name: string; sample_type: string }[]>([])
  const [selectedTestId, setSelectedTestId] = useState<string>('')
  const [resultValue, setResultValue] = useState('')
  const [resultUnit, setResultUnit] = useState('mEq/L')
  const [refRangeLow, setRefRangeLow] = useState('3.5')
  const [refRangeHigh, setRefRangeHigh] = useState('5.0')
  const [severity, setSeverity] = useState<'normal' | 'low' | 'high' | 'critical_low' | 'critical_high'>('normal')
  const [isCritical, setIsCritical] = useState(false)
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{
    resultId: string
    patientName: string
    testName: string
    isCritical: boolean
  } | null>(null)

  // Load order details & catalog when modal opens
  useEffect(() => {
    if (!isLabResultOpen) {
      setErrorMsg(null)
      setSuccessInfo(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setErrorMsg(null)
    setSuccessInfo(null)

    Promise.all([
      fetchLabOrderDetails(activeLabOrderId),
      fetchLabTests(),
    ])
      .then(([orderDetails, tests]) => {
        if (!isMounted) return
        setCatalogTests(tests)
        if (orderDetails) {
          setOrder(orderDetails)
          setSelectedTestId(orderDetails.lab_test_id || tests[0]?.id || '')
          setResultValue(orderDetails.result_value || '')
          setResultUnit(orderDetails.result_unit || 'mEq/L')
          setRefRangeLow(orderDetails.ref_range_low || '3.5')
          setRefRangeHigh(orderDetails.ref_range_high || '5.0')
          setSeverity(orderDetails.severity || 'normal')
          setIsCritical(Boolean(orderDetails.is_critical))
        }
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        console.warn('[EnterLabResultModal] Error loading order details:', err)
        setErrorMsg('Failed to load lab order details.')
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isLabResultOpen, activeLabOrderId])

  // Handle test selection change from catalog
  const handleTestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const testId = e.target.value
    setSelectedTestId(testId)
    const matched = catalogTests.find((t) => t.id === testId)
    if (matched) {
      if (matched.test_code === 'POTASS') {
        setResultUnit('mEq/L')
        setRefRangeLow('3.5')
        setRefRangeHigh('5.0')
      } else if (matched.test_code === 'TROP-I') {
        setResultUnit('ng/mL')
        setRefRangeLow('0.00')
        setRefRangeHigh('0.04')
      } else if (matched.test_code === 'HBA1C') {
        setResultUnit('%')
        setRefRangeLow('4.0')
        setRefRangeHigh('5.6')
      }
    }
  }

  // Handle severity change
  const handleSeverityChange = (newSev: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high') => {
    setSeverity(newSev)
    if (newSev === 'critical_high' || newSev === 'critical_low') {
      setIsCritical(true)
    } else {
      setIsCritical(false)
    }
  }

  const handleCriticalToggle = (checked: boolean) => {
    setIsCritical(checked)
    if (checked && severity === 'normal') {
      setSeverity('critical_high')
    } else if (!checked && (severity === 'critical_high' || severity === 'critical_low')) {
      setSeverity('normal')
    }
  }

  const handleClose = () => {
    setLabResultOpen(false)
    setActiveLabOrderId(null)
    setOrder(null)
    setErrorMsg(null)
    setSuccessInfo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    if (!resultValue.trim()) {
      setErrorMsg('Please enter a measured test result value.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    const selectedTestObj = catalogTests.find((t) => t.id === selectedTestId)
    const testName = selectedTestObj?.test_name || order.test_name || 'Laboratory Test'

    const res = await saveLabResult({
      lab_order_id: order.id,
      patient_id: order.patient_id,
      test_name: testName,
      lab_test_id: selectedTestId || order.lab_test_id,
      result_value: resultValue.trim(),
      result_unit: resultUnit.trim(),
      ref_range_low: refRangeLow.trim(),
      ref_range_high: refRangeHigh.trim(),
      severity,
      is_critical: isCritical,
      notes: notes.trim() || undefined,
    })

    setIsSubmitting(false)

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save lab result.')
      return
    }

    setSuccessInfo({
      resultId: res.resultId || 'res-confirmed',
      patientName: res.patientName || order.patient_name,
      testName: res.testName || testName,
      isCritical: Boolean(res.isCritical),
    })

    // Trigger realtime updates across all tabs and components
    triggerLabRefresh()

    // Auto-close after 1.8 seconds on success
    setTimeout(() => {
      handleClose()
    }, 1800)
  }

  const selectedTestName = useMemo(() => {
    const found = catalogTests.find((t) => t.id === selectedTestId)
    return found?.test_name || order?.test_name || 'Laboratory Panel'
  }, [catalogTests, selectedTestId, order?.test_name])

  const orderTitle = `Requisition #${order?.order_id || 'LO-4421'} • ${order?.patient_name || 'Patient'}`

  return (
    <ModalBackdrop
      isOpen={isLabResultOpen}
      onClose={handleClose}
      title="Enter Diagnostic Test Result"
      subtitle={orderTitle}
      icon="biotech"
      maxWidth="max-w-2xl"
    >
      {/* Loading State */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
            progress_activity
          </span>
          <p className="text-body-md font-medium">Loading requisition details...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Patient & Order Banner */}
          <div className="bg-surface-container-low/60 rounded-2xl p-4 border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-semibold text-on-surface text-body-lg">
                  {order?.patient_name || 'Marcus Delacroix'}
                </span>
                <span className="text-label-sm font-mono text-outline">
                  #{order?.mrn || '00482910'}
                </span>
                {order?.age && (
                  <span className="text-label-sm text-on-surface-variant">
                    • {order.age} {order.gender}
                  </span>
                )}
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Ordered by: <span className="font-medium text-on-surface">{order?.doctor_name || 'Dr. Sarah Jenkins'}</span>
              </p>
              {order?.clinical_info && (
                <p className="text-label-sm text-outline mt-0.5">
                  Indication: {order.clinical_info}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span
                className={`px-3 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider ${
                  order?.is_stat
                    ? 'bg-red-100 text-red-800 animate-pulse border border-red-200'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                {order?.is_stat ? 'STAT Requisition' : 'Routine'}
              </span>
              <span className="text-label-sm font-mono text-outline bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-outline-variant/30">
                {order?.order_id || 'LO-4421'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl text-body-sm flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-red-600 mt-0.5">
                error
              </span>
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Success Message */}
          {successInfo && (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-body-sm flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
              <span className="material-symbols-outlined text-[22px] text-emerald-600 mt-0.5">
                check_circle
              </span>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">
                  Result successfully saved & verified!
                </p>
                <p className="text-emerald-700 text-label-sm mt-0.5">
                  Test: {successInfo.testName} • Patient: {successInfo.patientName}
                  {successInfo.isCritical && ' • Critical alert broadcasted to attending doctor.'}
                </p>
              </div>
            </div>
          )}

          {/* Test Selection & Specimen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-sm font-semibold text-on-surface block mb-1.5">
                Analyte / Test Parameter
              </label>
              {catalogTests.length > 0 ? (
                <select
                  value={selectedTestId}
                  onChange={handleTestChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                >
                  {catalogTests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.test_name} ({t.test_code})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={selectedTestName}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-md font-semibold"
                />
              )}
            </div>

            <div>
              <label className="text-label-sm font-semibold text-on-surface block mb-1.5">
                Specimen Type
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-outline">
                  colorize
                </span>
                <span>{order?.sample_type || 'Blood'}</span>
              </div>
            </div>
          </div>

          {/* Result Value & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-label-sm font-semibold text-on-surface block mb-1.5">
                Measured Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 6.2 or 0.08"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border text-body-lg font-mono font-bold focus:outline-none focus:ring-2 ${
                  isCritical
                    ? 'border-red-400 text-red-700 bg-red-50/30 focus:ring-red-400'
                    : 'border-outline-variant/30 text-on-surface focus:ring-primary/40'
                }`}
              />
            </div>

            <div>
              <label className="text-label-sm font-semibold text-on-surface block mb-1.5">
                Unit
              </label>
              <input
                type="text"
                placeholder="e.g. mEq/L"
                value={resultUnit}
                onChange={(e) => setResultUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-md font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Reference Interval (Low & High) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-sm font-semibold text-on-surface block mb-1.5">
                Biological Ref Low
              </label>
              <input
                type="text"
                placeholder="e.g. 3.5"
                value={refRangeLow}
                onChange={(e) => setRefRangeLow(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-md font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="text-label-sm font-semibold text-on-surface block mb-1.5">
                Biological Ref High
              </label>
              <input
                type="text"
                placeholder="e.g. 5.0"
                value={refRangeHigh}
                onChange={(e) => setRefRangeHigh(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-md font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Severity Flag Selector */}
          <div>
            <label className="text-label-sm font-semibold text-on-surface block mb-1.5">
              Severity / Interpretation Flag
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'normal', label: 'Normal', color: 'border-emerald-300 text-emerald-800 bg-emerald-50/40' },
                { id: 'low', label: 'Low', color: 'border-amber-300 text-amber-800 bg-amber-50/40' },
                { id: 'high', label: 'High', color: 'border-amber-400 text-amber-900 bg-amber-50/60' },
                { id: 'critical_low', label: 'Panic Low', color: 'border-red-400 text-red-800 bg-red-50/50' },
                { id: 'critical_high', label: 'Panic High', color: 'border-red-500 text-red-900 bg-red-100/60' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSeverityChange(s.id as any)}
                  className={`py-2 px-2.5 rounded-xl border text-label-sm font-semibold text-center transition-all ${
                    severity === s.id
                      ? `${s.color} ring-2 ring-primary ring-offset-1 font-bold shadow-sm`
                      : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Critical Panic Value Checkbox & Warning Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isCritical
              ? 'bg-red-50/70 border-red-300 shadow-sm'
              : 'bg-surface-container-low/40 border-outline-variant/20'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => handleCriticalToggle(e.target.checked)}
                className="mt-1 h-5 w-5 rounded text-red-600 border-red-300 focus:ring-red-400 cursor-pointer"
              />
              <div className="flex-1">
                <span className={`text-body-sm font-bold ${isCritical ? 'text-red-900' : 'text-on-surface'}`}>
                  Flag as Critical / Panic Value (Immediate Doctor Alert)
                </span>
                <p className="text-label-sm text-on-surface-variant mt-0.5">
                  Critical values automatically alert the ordering physician ({order?.doctor_name || 'Dr. Sarah Jenkins'}) and log a timestamped critical value event in the audit trail.
                </p>
              </div>
            </label>

            {isCritical && (
              <div className="mt-3 pt-3 border-t border-red-200/80 flex items-center gap-2 text-red-800 text-label-sm font-medium animate-in fade-in duration-150">
                <span className="material-symbols-outlined text-[18px] text-red-600 animate-pulse">
                  notifications_active
                </span>
                <span>Priority Realtime Telemetry alert will be dispatched on verification.</span>
              </div>
            )}
          </div>

          {/* Remarks / Analyzer Calibration */}
          <div>
            <label className="text-label-sm font-semibold text-on-surface block mb-1.5">
              Technician Notes / Analyzer Calibration (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Verified on Roche Cobas c501 • Re-run duplicate matched"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-secondary touch-tap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!successInfo}
              className={`btn-primary touch-tap min-w-[170px] justify-center ${
                isCritical ? 'bg-red-600 hover:bg-red-700 text-white' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Saving Result...</span>
                </>
              ) : successInfo ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                  <span>Verified</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    verified
                  </span>
                  <span>Verify & Save Result</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
