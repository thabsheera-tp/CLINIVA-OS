'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClientSideClient } from '@/lib/supabase/client'
import { fetchBeds, assignBedToPatient, dischargePatientFromBed } from '@/lib/data'

export type QueuePatient = {
  id: string
  token: number
  name: string
  age: string
  complaint: string
  wait: string
  priority?: 'routine' | 'urgent' | 'emergency'
  status?: 'waiting' | 'in_examination' | 'completed'
}

export type VitalsData = {
  patientName: string
  mrn: string
  bp: string
  heartRate: string
  spo2: string
  temperature: string
  recordedAt: string
}

export type BedItem = {
  id: string
  patient: string | null
  age: string | null
  condition: string | null
  status: 'occupied' | 'available' | 'maintenance' | 'reserved'
  ward: string
}

type ClinicContextType = {
  // Live Queue
  queue: QueuePatient[]
  activePatient: QueuePatient | null
  addQueuePatient: (patient: Omit<QueuePatient, 'id' | 'token' | 'wait'>) => QueuePatient
  callNextPatient: () => void
  completeConsultation: (patientId: string) => void

  // Telemetry
  vitals: VitalsData
  updateVitals: (newVitals: Partial<VitalsData>) => void

  // Bed Board
  beds: BedItem[]
  assignBed: (
    bedId: string,
    patientName: string,
    age: string,
    condition: string,
    expectedDischargeAt?: string,
    patientId?: string
  ) => Promise<boolean> | void
  releaseBed: (bedId: string) => Promise<boolean> | void
  bedRefreshKey: number
  triggerBedRefresh: () => void
  isAssignBedOpen: boolean
  setAssignBedOpen: (open: boolean) => void
  activeAssignBedId: string | null
  setActiveAssignBedId: (id: string | null) => void
  openAssignBedModal: (bedId?: string) => void

  // Modals state
  isRegisterOpen: boolean
  setRegisterOpen: (open: boolean) => void
  isVitalsOpen: boolean
  setVitalsOpen: (open: boolean) => void
  isConsultOpen: boolean
  setConsultOpen: (open: boolean) => void
  isPaymentOpen: boolean
  setPaymentOpen: (open: boolean) => void
  isDispenseOpen: boolean
  setDispenseOpen: (open: boolean) => void
  dispensePrescriptionId: string | null
  setDispensePrescriptionId: (id: string | null) => void
  openDispenseModal: (prescriptionId?: string) => void
  pharmacyRefreshKey: number
  triggerPharmacyRefresh: () => void
  isPrescriptionOpen: boolean
  setPrescriptionOpen: (open: boolean) => void
  isBookingOpen: boolean
  setBookingOpen: (open: boolean) => void
  isLabResultOpen: boolean
  setLabResultOpen: (open: boolean) => void
  activeLabOrderId: string | null
  setActiveLabOrderId: (id: string | null) => void
  openLabResultModal: (orderId?: string) => void
  labRefreshKey: number
  triggerLabRefresh: () => void
  bookingPrefill: { department?: string; doctor?: string; complaint?: string } | null
  setBookingPrefill: (prefill: { department?: string; doctor?: string; complaint?: string } | null) => void
  openBookingWithPrefill: (prefill: { department?: string; doctor?: string; complaint?: string }) => void
}

const INITIAL_QUEUE: QueuePatient[] = [
  { id: 'q-1', token: 7,  name: 'Marcus Delacroix', age: '54M', complaint: 'Chest tightness, shortness of breath', wait: 'In Exam', status: 'in_examination', priority: 'emergency' },
  { id: 'q-2', token: 8,  name: 'Priya Mehta',      age: '41F', complaint: 'High fever & persistent cough',     wait: '8m wait', status: 'waiting',        priority: 'urgent' },
  { id: 'q-3', token: 9,  name: 'George Tanner',    age: '67M', complaint: 'Diabetes type 2 follow-up',         wait: '19m wait', status: 'waiting',       priority: 'routine' },
  { id: 'q-4', token: 10, name: 'Aisha Nkosi',      age: '29F', complaint: 'Palpitations upon exertion',        wait: '24m wait', status: 'waiting',       priority: 'urgent' },
  { id: 'q-5', token: 11, name: 'David Chen',       age: '52M', complaint: 'Blood pressure check',             wait: '31m wait', status: 'waiting',       priority: 'routine' },
  { id: 'q-6', token: 12, name: 'Maria Sanchez',    age: '38F', complaint: 'Annual routine health checkup',     wait: '40m wait', status: 'waiting',       priority: 'routine' },
]

const INITIAL_VITALS: VitalsData = {
  patientName: 'Marcus Delacroix',
  mrn: '00482910',
  bp: '128/82',
  heartRate: '74',
  spo2: '98%',
  temperature: '98.4',
  recordedAt: 'Just now',
}

const INITIAL_BEDS: BedItem[] = [
  { id: 'A-01', patient: 'Marcus Delacroix', age: '54M', condition: 'Hypertension', status: 'occupied', ward: 'Ward A' },
  { id: 'A-02', patient: 'Priya Mehta',      age: '41F', condition: 'Pneumonia',    status: 'occupied', ward: 'Ward A' },
  { id: 'A-03', patient: null,               age: null,  condition: null,            status: 'available', ward: 'Ward A' },
  { id: 'A-04', patient: 'George Tanner',    age: '67M', condition: 'Post-op Knee', status: 'occupied', ward: 'Ward A' },
  { id: 'A-05', patient: null,               age: null,  condition: null,            status: 'maintenance', ward: 'Ward A' },
  { id: 'A-06', patient: 'Aisha Nkosi',      age: '29F', condition: 'Appendicitis', status: 'occupied', ward: 'Ward A' },
  { id: 'B-01', patient: null,               age: null,  condition: null,            status: 'available', ward: 'Ward B' },
  { id: 'B-02', patient: 'David Chen',       age: '52M', condition: 'Diabetes',     status: 'occupied', ward: 'Ward B' },
]

const ClinicRealtimeContext = createContext<ClinicContextType | null>(null)

export function ClinicRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<QueuePatient[]>(INITIAL_QUEUE)
  const [activePatient, setActivePatient] = useState<QueuePatient | null>(INITIAL_QUEUE[0])
  const [vitals, setVitals] = useState<VitalsData>(INITIAL_VITALS)
  const [beds, setBeds] = useState<BedItem[]>(INITIAL_BEDS)
  const [isAssignBedOpen, setAssignBedOpen] = useState(false)
  const [activeAssignBedId, setActiveAssignBedId] = useState<string | null>(null)
  const [bedRefreshKey, setBedRefreshKey] = useState<number>(0)

  const triggerBedRefresh = useCallback(() => {
    setBedRefreshKey((prev) => prev + 1)
  }, [])

  const openAssignBedModal = useCallback((bedId?: string) => {
    setActiveAssignBedId(bedId ?? null)
    setAssignBedOpen(true)
  }, [])

  // Modal dialog states
  const [isRegisterOpen, setRegisterOpen] = useState(false)
  const [isVitalsOpen, setVitalsOpen] = useState(false)
  const [isConsultOpen, setConsultOpen] = useState(false)
  const [isPaymentOpen, setPaymentOpen] = useState(false)
  const [isDispenseOpen, setDispenseOpen] = useState(false)
  const [dispensePrescriptionId, setDispensePrescriptionId] = useState<string | null>(null)
  const [pharmacyRefreshKey, setPharmacyRefreshKey] = useState<number>(0)
  const [isPrescriptionOpen, setPrescriptionOpen] = useState(false)
  const [isBookingOpen, setBookingOpen] = useState(false)
  const [isLabResultOpen, setLabResultOpen] = useState(false)
  const [activeLabOrderId, setActiveLabOrderId] = useState<string | null>(null)
  const [labRefreshKey, setLabRefreshKey] = useState<number>(0)
  const [bookingPrefill, setBookingPrefill] = useState<{ department?: string; doctor?: string; complaint?: string } | null>(null)

  // Fetch initial beds from database and re-fetch on bedRefreshKey
  useEffect(() => {
    let isMounted = true
    fetchBeds()
      .then((dbBeds) => {
        if (!isMounted || !dbBeds || dbBeds.length === 0) return
        setBeds(
          dbBeds.map((b) => ({
            id: b.bed_number || b.id,
            patient: b.patient_name || null,
            age: b.age || null,
            condition: b.condition || (b.status === 'occupied' ? 'Inpatient' : null),
            status: (b.status as any) || 'available',
            ward: b.ward_name || (b.bed_number?.startsWith('A') ? 'Ward A' : 'Ward B'),
          }))
        )
      })
      .catch((err) => {
        console.warn('[ClinicRealtime] fetchBeds error:', err)
      })

    return () => {
      isMounted = false
    }
  }, [bedRefreshKey])

  const triggerLabRefresh = useCallback(() => {
    setLabRefreshKey((prev) => prev + 1)
  }, [])

  const openLabResultModal = useCallback((orderId?: string) => {
    setActiveLabOrderId(orderId ?? null)
    setLabResultOpen(true)
  }, [])

  const triggerPharmacyRefresh = useCallback(() => {
    setPharmacyRefreshKey((prev) => prev + 1)
  }, [])

  const openDispenseModal = useCallback((prescriptionId?: string) => {
    setDispensePrescriptionId(prescriptionId ?? null)
    setDispenseOpen(true)
  }, [])

  const openBookingWithPrefill = useCallback((prefill: { department?: string; doctor?: string; complaint?: string }) => {
    setBookingPrefill(prefill)
    setBookingOpen(true)
  }, [])

  // 1. Supabase Realtime Channel Subscription (live across devices and database events)
  useEffect(() => {
    const supabase = createClientSideClient()
    const channel = supabase
      .channel('cliniva_realtime_db')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as any
            const newPatient: QueuePatient = {
              id: row.id,
              token: row.queue_token || Date.now() % 100,
              name: `Patient #${row.patient_id?.slice(0, 6) || 'New'}`,
              age: 'Scheduled',
              complaint: row.chief_complaint || 'General Checkup',
              wait: 'Just checked in',
              status: 'waiting',
              priority: 'routine',
            }
            setQueue((prev) => (prev.some((p) => p.id === newPatient.id) ? prev : [...prev, newPatient]))
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as any
            if (row.status === 'completed') {
              setQueue((prev) => prev.filter((p) => p.id !== row.id))
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'patient_vitals' },
        (payload) => {
          const row = payload.new as any
          setVitals((prev) => ({
            ...prev,
            bp: row.bp_systolic && row.bp_diastolic ? `${row.bp_systolic}/${row.bp_diastolic}` : prev.bp,
            heartRate: row.heart_rate ? `${row.heart_rate}` : prev.heartRate,
            spo2: row.spo2 ? `${row.spo2}%` : prev.spo2,
            temperature: row.temperature ? `${row.temperature}` : prev.temperature,
            recordedAt: 'Just now',
          }))
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'beds' },
        () => {
          setBedRefreshKey((k) => k + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // 2. Cross-tab real-time event bus (instant optimistic sync across local tabs)
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return

    const channel = new BroadcastChannel('cliniva_realtime_sync')
    channel.onmessage = (event) => {
      const { type, payload } = event.data ?? {}
      if (type === 'NEW_PATIENT') {
        setQueue((prev) => [...prev, payload])
      } else if (type === 'UPDATE_VITALS') {
        setVitals(payload)
      } else if (type === 'CALL_PATIENT') {
        setQueue((prev) =>
          prev.map((p) =>
            p.id === payload.id ? { ...p, status: 'in_examination', wait: 'In Exam' } : p
          )
        )
        setActivePatient(payload)
      } else if (type === 'COMPLETE_CONSULT') {
        setQueue((prev) => prev.filter((p) => p.id !== payload.patientId))
      } else if (type === 'ASSIGN_BED') {
        setBeds((prev) =>
          prev.map((b) => (b.id === payload.bedId ? { ...b, ...payload } : b))
        )
        setBedRefreshKey((k) => k + 1)
      } else if (type === 'BED_UPDATED') {
        setBedRefreshKey((k) => k + 1)
      } else if (type === 'DISPENSE_MEDICATION') {
        setPharmacyRefreshKey((k) => k + 1)
      } else if (type === 'LAB_RESULTS_UPDATED') {
        setLabRefreshKey((k) => k + 1)
      }
    }

    return () => {
      channel.close()
    }
  }, [])

  const broadcast = useCallback((type: string, payload: any) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('cliniva_realtime_sync')
        channel.postMessage({ type, payload })
        channel.close()
      } catch {}
    }
  }, [])

  const addQueuePatient = useCallback(
    (patientData: Omit<QueuePatient, 'id' | 'token' | 'wait'>) => {
      const nextToken = (queue[queue.length - 1]?.token ?? 12) + 1
      const newPatient: QueuePatient = {
        ...patientData,
        id: `q-${Date.now()}`,
        token: nextToken,
        wait: 'Just registered',
        status: 'waiting',
      }
      setQueue((prev) => [...prev, newPatient])
      broadcast('NEW_PATIENT', newPatient)
      return newPatient
    },
    [queue, broadcast]
  )

  const callNextPatient = useCallback(() => {
    const nextInLine = queue.find((p) => p.status === 'waiting')
    if (!nextInLine) return

    setQueue((prev) =>
      prev.map((p) =>
        p.id === nextInLine.id
          ? { ...p, status: 'in_examination', wait: 'In Exam' }
          : p
      )
    )
    setActivePatient(nextInLine)
    broadcast('CALL_PATIENT', nextInLine)
  }, [queue, broadcast])

  const completeConsultation = useCallback(
    (patientId: string) => {
      setQueue((prev) => prev.filter((p) => p.id !== patientId))
      if (activePatient?.id === patientId) {
        const next = queue.find((p) => p.id !== patientId && p.status === 'waiting')
        setActivePatient(next ?? null)
      }
      broadcast('COMPLETE_CONSULT', { patientId })
    },
    [queue, activePatient, broadcast]
  )

  const updateVitals = useCallback(
    (newVitals: Partial<VitalsData>) => {
      setVitals((prev) => {
        const updated = { ...prev, ...newVitals, recordedAt: 'Just now' }
        broadcast('UPDATE_VITALS', updated)
        return updated
      })
    },
    [broadcast]
  )

  const assignBed = useCallback(
    async (
      bedId: string,
      patientName: string,
      age: string,
      condition: string,
      expectedDischargeAt?: string,
      patientId?: string
    ) => {
      setBeds((prev) =>
        prev.map((b) =>
          b.id === bedId
            ? { ...b, patient: patientName, age, condition, status: 'occupied' as const }
            : b
        )
      )
      broadcast('ASSIGN_BED', { bedId, patient: patientName, age, condition, status: 'occupied' })

      try {
        const res = await assignBedToPatient({
          bed_id: bedId,
          patient_name: patientName,
          age,
          condition,
          expected_discharge_at: expectedDischargeAt,
          patient_id: patientId,
        })
        triggerBedRefresh()
        return res.success
      } catch (err) {
        console.error('[ClinicRealtime] assignBed error:', err)
        triggerBedRefresh()
        return false
      }
    },
    [broadcast, triggerBedRefresh]
  )

  const releaseBed = useCallback(
    async (bedId: string) => {
      setBeds((prev) =>
        prev.map((b) =>
          b.id === bedId
            ? { ...b, patient: null, age: null, condition: null, status: 'available' as const }
            : b
        )
      )
      broadcast('ASSIGN_BED', { bedId, patient: null, age: null, condition: null, status: 'available' })

      try {
        const res = await dischargePatientFromBed(bedId)
        triggerBedRefresh()
        return res.success
      } catch (err) {
        console.error('[ClinicRealtime] releaseBed error:', err)
        triggerBedRefresh()
        return false
      }
    },
    [broadcast, triggerBedRefresh]
  )

  return (
    <ClinicRealtimeContext.Provider
      value={{
        queue,
        activePatient,
        addQueuePatient,
        callNextPatient,
        completeConsultation,
        vitals,
        updateVitals,
        beds,
        assignBed,
        releaseBed,
        bedRefreshKey,
        triggerBedRefresh,
        isAssignBedOpen,
        setAssignBedOpen,
        activeAssignBedId,
        setActiveAssignBedId,
        openAssignBedModal,
        isRegisterOpen,
        setRegisterOpen,
        isVitalsOpen,
        setVitalsOpen,
        isConsultOpen,
        setConsultOpen,
        isPaymentOpen,
        setPaymentOpen,
        isDispenseOpen,
        setDispenseOpen,
        dispensePrescriptionId,
        setDispensePrescriptionId,
        openDispenseModal,
        pharmacyRefreshKey,
        triggerPharmacyRefresh,
        isPrescriptionOpen,
        setPrescriptionOpen,
        isBookingOpen,
        setBookingOpen,
        isLabResultOpen,
        setLabResultOpen,
        activeLabOrderId,
        setActiveLabOrderId,
        openLabResultModal,
        labRefreshKey,
        triggerLabRefresh,
        bookingPrefill,
        setBookingPrefill,
        openBookingWithPrefill,
      }}
    >
      {children}
    </ClinicRealtimeContext.Provider>
  )
}

export function useClinicRealtime() {
  const ctx = useContext(ClinicRealtimeContext)
  if (!ctx) {
    throw new Error('useClinicRealtime must be used within ClinicRealtimeProvider')
  }
  return ctx
}
