'use client'
/**
 * hooks/useClinicData.ts
 * React hooks that wrap the data-access layer with loading/error state.
 * Use these in client components to fetch real data from Supabase.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  fetchPatients,
  fetchTodayAppointments,
  fetchPatientVitals,
  fetchActivePrescriptions,
  fetchPendingLabOrders,
  fetchCriticalLabResults,
  fetchBeds,
  fetchRecentInvoices,
  fetchOutstandingInvoices,
  fetchDrugInventory,
  fetchPatientByMrn,
  type PatientRow,
  type AppointmentRow,
  type VitalsRow,
  type PrescriptionRow,
  type LabOrderRow,
  type BedRow,
  type InvoiceRow,
  type DrugRow,
} from '@/lib/data'

type AsyncState<T> = {
  data: T
  loading: boolean
  error: string | null
  refetch: () => void
}

function useAsync<T>(
  fetcher: () => Promise<T>,
  initialValue: T,
  deps: unknown[] = []
): AsyncState<T> {
  const [data, setData] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load data')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  const refetch = useCallback(() => setTick((t) => t + 1), [])
  return { data, loading, error, refetch }
}

// ─── Public Hooks ─────────────────────────────────────────────────────────────

export function usePatients(search = '') {
  return useAsync<PatientRow[]>(() => fetchPatients(search), [], [search])
}

export function usePatientByMrn(mrn: string) {
  return useAsync<PatientRow | null>(() => fetchPatientByMrn(mrn), null, [mrn])
}

export function useTodayAppointments() {
  return useAsync<AppointmentRow[]>(fetchTodayAppointments, [])
}

export function usePatientVitals(patientId: string) {
  return useAsync<VitalsRow[]>(() => fetchPatientVitals(patientId), [], [patientId])
}

export function useActivePrescriptions(patientId?: string) {
  return useAsync<PrescriptionRow[]>(() => fetchActivePrescriptions(patientId), [], [patientId])
}

export function usePendingLabOrders() {
  return useAsync<LabOrderRow[]>(fetchPendingLabOrders, [])
}

export function useCriticalLabResults() {
  return useAsync<LabOrderRow[]>(fetchCriticalLabResults, [])
}

export function useBeds() {
  return useAsync<BedRow[]>(fetchBeds, [])
}

export function useRecentInvoices(limit = 20) {
  return useAsync<InvoiceRow[]>(() => fetchRecentInvoices(limit), [], [limit])
}

export function useOutstandingInvoices() {
  return useAsync<InvoiceRow[]>(fetchOutstandingInvoices, [])
}

export function useDrugInventory(search = '') {
  return useAsync<DrugRow[]>(() => fetchDrugInventory(search), [], [search])
}
