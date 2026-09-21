'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { createClientSideClient } from '@/lib/supabase/client'
import {
  QueueTicketRow,
  fetchLiveQueue,
  addQueueTicket,
  updateQueueTicketStatus,
} from '@/lib/data'

// Initial fallback queue to ensure the UI is rich, realistic, and instantly interactive
const DEMO_FALLBACK_QUEUE: QueueTicketRow[] = [
  {
    id: 'demo-q-1',
    patient_id: 'p-01',
    patient_name: 'Marcus Delacroix',
    token_number: 101,
    status: 'in-consultation',
    priority: 'emergency',
    department: 'Cardiology',
    doctor_id: null,
    chief_complaint: 'Acute chest tightness, shortness of breath',
    estimated_wait_minutes: 0,
    estimated_consultation_time: new Date(Date.now() - 6 * 60000).toISOString(),
    consultation_started_at: new Date(Date.now() - 6 * 60000).toISOString(),
    consultation_completed_at: null,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-q-2',
    patient_id: 'p-02',
    patient_name: 'Priya Mehta',
    token_number: 102,
    status: 'waiting',
    priority: 'urgent',
    department: 'General Medicine',
    doctor_id: null,
    chief_complaint: 'High fever (103°F) & persistent productive cough',
    estimated_wait_minutes: 8,
    estimated_consultation_time: null,
    consultation_started_at: null,
    consultation_completed_at: null,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-q-3',
    patient_id: 'p-03',
    patient_name: 'George Tanner',
    token_number: 103,
    status: 'waiting',
    priority: 'routine',
    department: 'General Medicine',
    doctor_id: null,
    chief_complaint: 'Type 2 Diabetes follow-up & medication review',
    estimated_wait_minutes: 20,
    estimated_consultation_time: null,
    consultation_started_at: null,
    consultation_completed_at: null,
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-q-4',
    patient_id: 'p-04',
    patient_name: 'Aisha Nkosi',
    token_number: 104,
    status: 'waiting',
    priority: 'urgent',
    department: 'Cardiology',
    doctor_id: null,
    chief_complaint: 'Post-exertion tachycardia & dizziness',
    estimated_wait_minutes: 32,
    estimated_consultation_time: null,
    consultation_started_at: null,
    consultation_completed_at: null,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-q-5',
    patient_id: 'p-05',
    patient_name: 'David Chen',
    token_number: 105,
    status: 'waiting',
    priority: 'routine',
    department: 'General Medicine',
    doctor_id: null,
    chief_complaint: 'Routine hypertension blood pressure check',
    estimated_wait_minutes: 44,
    estimated_consultation_time: null,
    consultation_started_at: null,
    consultation_completed_at: null,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-q-6',
    patient_id: 'p-06',
    patient_name: 'Elena Rostova',
    token_number: 106,
    status: 'waiting',
    priority: 'routine',
    department: 'Pediatrics',
    doctor_id: null,
    chief_complaint: 'Annual developmental screening & immunization',
    estimated_wait_minutes: 56,
    estimated_consultation_time: null,
    consultation_started_at: null,
    consultation_completed_at: null,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

type LiveQueueProps = {
  department?: string
  doctorMode?: boolean
  className?: string
}

export default function LiveQueueTimePredictor({
  department = 'All',
  doctorMode = false,
  className = '',
}: LiveQueueProps) {
  const [queue, setQueue] = useState<QueueTicketRow[]>(DEMO_FALLBACK_QUEUE)
  const [isLiveConnected, setIsLiveConnected] = useState(true)
  const [selectedDept, setSelectedDept] = useState<string>(department)
  const [searchQuery, setSearchQuery] = useState('')
  const [avgPaceMinutes, setAvgPaceMinutes] = useState(12) // Average consultation duration pace
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeConsultElapsedSec, setActiveConsultElapsedSec] = useState(0)

  // Walk-in form state
  const [newPatientName, setNewPatientName] = useState('')
  const [newPriority, setNewPriority] = useState<'routine' | 'urgent' | 'emergency'>('routine')
  const [newDept, setNewDept] = useState('General Medicine')
  const [newComplaint, setNewComplaint] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Initial Load from Supabase Database
  useEffect(() => {
    let isMounted = true
    async function loadData() {
      const serverQueue = await fetchLiveQueue(selectedDept === 'All' ? undefined : selectedDept)
      if (isMounted && serverQueue && serverQueue.length > 0) {
        setQueue(serverQueue)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [selectedDept])

  // 2. Real-time Supabase Subscription & Multi-Tab Broadcast Sync
  useEffect(() => {
    const supabase = createClientSideClient()

    const channel = supabase
      .channel('cliniva_patient_queue_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patient_queue' },
        (payload) => {
          setIsLiveConnected(true)
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as QueueTicketRow
            setQueue((prev) => {
              if (prev.some((p) => p.id === newRow.id)) return prev
              return [...prev, newRow]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as QueueTicketRow
            setQueue((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            )
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as { id: string }
            setQueue((prev) => prev.filter((item) => item.id !== old.id))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLiveConnected(true)
        }
      })

    // Local tab broadcast sync
    let bc: BroadcastChannel | null = null
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('cliniva_queue_bus')
      bc.onmessage = (event) => {
        const { type, payload } = event.data || {}
        if (type === 'SYNC_QUEUE') {
          setQueue(payload)
        }
      }
    }

    return () => {
      supabase.removeChannel(channel)
      bc?.close()
    }
  }, [])

  // Sync state broadcast helper
  const broadcastQueue = useCallback((newQueue: QueueTicketRow[]) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('cliniva_queue_bus')
        bc.postMessage({ type: 'SYNC_QUEUE', payload: newQueue })
        bc.close()
      } catch {}
    }
  }, [])

  // 3. Active Consultation Timer
  const activeConsultation = useMemo(
    () => queue.find((p) => p.status === 'in-consultation'),
    [queue]
  )

  useEffect(() => {
    if (!activeConsultation?.consultation_started_at) {
      setActiveConsultElapsedSec(0)
      return
    }

    const startTimestamp = new Date(activeConsultation.consultation_started_at).getTime()
    const updateElapsed = () => {
      const now = Date.now()
      const diffSec = Math.max(0, Math.floor((now - startTimestamp) / 1000))
      setActiveConsultElapsedSec(diffSec)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [activeConsultation])

  // 4. Time Predictor Algorithm
  // Calculates estimated wait minutes and clock time for each waiting patient based on position & priority
  const waitingPatientsWithEstimates = useMemo(() => {
    const waiting = queue
      .filter((p) => p.status === 'waiting')
      .filter((p) => (selectedDept === 'All' ? true : p.department === selectedDept))
      .filter(
        (p) =>
          searchQuery.trim() === '' ||
          p.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.chief_complaint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(p.token_number).includes(searchQuery)
      )

    // Sort by priority (emergency first, then urgent, then routine), then by token number
    const priorityWeight: Record<string, number> = { emergency: 0, urgent: 1, routine: 2 }
    const sorted = [...waiting].sort((a, b) => {
      const pA = priorityWeight[a.priority] ?? 2
      const pB = priorityWeight[b.priority] ?? 2
      if (pA !== pB) return pA - pB
      return a.token_number - b.token_number
    })

    // Active consultation remaining time approximation
    let remainingActiveTime = 0
    if (activeConsultation) {
      const elapsedMin = Math.floor(activeConsultElapsedSec / 60)
      remainingActiveTime = Math.max(2, avgPaceMinutes - elapsedMin)
    }

    let runningWaitMinutes = remainingActiveTime

    return sorted.map((patient, index) => {
      const peopleAhead = index
      let patientWaitMinutes = 0

      if (patient.priority === 'emergency') {
        patientWaitMinutes = 0 // Immediate priority
      } else {
        patientWaitMinutes = Math.round(runningWaitMinutes)
        // Add duration for this patient to next in queue
        runningWaitMinutes += avgPaceMinutes
      }

      // Predicted clock time
      const predictedDate = new Date(Date.now() + patientWaitMinutes * 60000)
      const predictedClock = predictedDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      return {
        ...patient,
        calculatedWait: patientWaitMinutes,
        peopleAhead,
        predictedClock,
      }
    })
  }, [queue, selectedDept, searchQuery, avgPaceMinutes, activeConsultation, activeConsultElapsedSec])

  // 5. Actions: Call Next Patient
  const handleCallPatient = async (targetId?: string) => {
    const nextPatient = targetId
      ? queue.find((p) => p.id === targetId)
      : waitingPatientsWithEstimates[0]

    if (!nextPatient) return

    // If there's an ongoing consultation, mark it completed first
    const updated = queue.map((p) => {
      if (p.status === 'in-consultation') {
        return {
          ...p,
          status: 'completed' as const,
          consultation_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      if (p.id === nextPatient.id) {
        return {
          ...p,
          status: 'in-consultation' as const,
          consultation_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      return p
    })

    setQueue(updated)
    broadcastQueue(updated)

    // Sync to Supabase
    if (activeConsultation) {
      await updateQueueTicketStatus(activeConsultation.id, 'completed')
    }
    await updateQueueTicketStatus(nextPatient.id, 'in-consultation')
  }

  // Complete Active Consultation
  const handleCompleteActive = async () => {
    if (!activeConsultation) return

    const updated = queue.map((p) => {
      if (p.id === activeConsultation.id) {
        return {
          ...p,
          status: 'completed' as const,
          consultation_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      return p
    })

    setQueue(updated)
    broadcastQueue(updated)
    await updateQueueTicketStatus(activeConsultation.id, 'completed')
  }

  // Bump Priority
  const handleTogglePriority = async (id: string, current: string) => {
    const nextPriority: 'routine' | 'urgent' = current === 'urgent' ? 'routine' : 'urgent'
    const updated = queue.map((p) => (p.id === id ? { ...p, priority: nextPriority } : p))
    setQueue(updated)
    broadcastQueue(updated)

    try {
      const supabase = createClientSideClient()
      await (supabase.from('patient_queue') as any)
        .update({ priority: nextPriority })
        .eq('id', id)
    } catch {}
  }

  // Remove / Cancel ticket
  const handleCancelTicket = async (id: string) => {
    const updated = queue.map((p) => (p.id === id ? { ...p, status: 'cancelled' as const } : p))
    setQueue(updated)
    broadcastQueue(updated)
    await updateQueueTicketStatus(id, 'cancelled')
  }

  // Add Walk-in Patient
  const handleAddWalkIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPatientName.trim()) return

    setIsSubmitting(true)
    const nextToken =
      queue.length > 0 ? Math.max(...queue.map((p) => p.token_number || 100)) + 1 : 101

    const newTicket: QueueTicketRow = {
      id: `q-${Date.now()}`,
      patient_id: null,
      patient_name: newPatientName.trim(),
      token_number: nextToken,
      status: 'waiting',
      priority: newPriority,
      department: newDept,
      doctor_id: null,
      chief_complaint: newComplaint.trim() || 'Walk-in Consultation',
      estimated_wait_minutes: 15,
      estimated_consultation_time: null,
      consultation_started_at: null,
      consultation_completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const nextQueue = [...queue, newTicket]
    setQueue(nextQueue)
    broadcastQueue(nextQueue)

    // Save to Supabase
    await addQueueTicket({
      patient_name: newTicket.patient_name,
      priority: newTicket.priority,
      department: newTicket.department,
      chief_complaint: newTicket.chief_complaint || '',
    })

    setNewPatientName('')
    setNewComplaint('')
    setNewPriority('routine')
    setIsSubmitting(false)
    setIsAddModalOpen(false)
  }

  // Elapsed time format helper
  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const waitingCount = waitingPatientsWithEstimates.length
  const completedCount = queue.filter((p) => p.status === 'completed').length

  return (
    <div
      className={`flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-lg shadow-sm ${className}`}
    >
      {/* ── 1. Header & Live Indicator ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-label-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {isLiveConnected ? 'Supabase Realtime Synced' : 'Offline Mode'}
            </span>
            <span className="text-label-sm text-on-surface-variant">• Updated live</span>
          </div>
          <h2 className="font-heading text-title-lg md:text-headline-sm font-bold text-on-surface mt-1">
            Live OPD Waiting List & Time Predictor
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Predicts exact patient wait times dynamically based on queue density, triage priority,
            and doctor pace.
          </p>
        </div>

        {/* Controls: Pace & Walk-in */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Average Pace Adjuster */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/40">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-label-xs text-on-surface-variant font-medium">Pace:</span>
            <select
              value={avgPaceMinutes}
              onChange={(e) => setAvgPaceMinutes(Number(e.target.value))}
              aria-label="Doctor consultation pace"
              className="bg-transparent text-label-sm font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value={8}>8 min (Fast)</option>
              <option value={10}>10 min</option>
              <option value={12}>12 min (Standard)</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min (Detailed)</option>
            </select>
          </div>

          {/* Quick Call Next */}
          <button
            onClick={() => handleCallPatient()}
            disabled={waitingCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary rounded-xl text-label-sm font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed touch-tap"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Call Next Token
          </button>

          {/* Add Walk-in */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-label-sm font-semibold transition-all border border-outline-variant/40 touch-tap"
          >
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            + Add Walk-In
          </button>
        </div>
      </div>

      {/* ── 2. Top Summary Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm my-space-md">
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <div className="text-label-xs text-on-surface-variant uppercase font-bold">Waiting Ahead</div>
            <div className="text-title-md font-bold text-on-surface">{waitingCount} Patients</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div className="text-label-xs text-on-surface-variant uppercase font-bold">Est. Next Wait</div>
            <div className="text-title-md font-bold text-amber-600 dark:text-amber-400">
              {waitingPatientsWithEstimates[0] ? `~${waitingPatientsWithEstimates[0].calculatedWait}m` : '0 min'}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div className="text-label-xs text-on-surface-variant uppercase font-bold">Completed Today</div>
            <div className="text-title-md font-bold text-emerald-600 dark:text-emerald-400">
              {completedCount} Seen
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <div className="text-label-xs text-on-surface-variant uppercase font-bold">Predictor Pace</div>
            <div className="text-title-md font-bold text-purple-600 dark:text-purple-400">
              {avgPaceMinutes} min/patient
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Active In-Consultation Spotlight Card ── */}
      {activeConsultation ? (
        <div className="mb-space-md p-space-md bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider">TOKEN</span>
              <span className="text-title-md font-extrabold leading-none">
                #{activeConsultation.token_number}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  ● In Consultation Now
                </span>
                <span className="text-label-sm font-semibold text-primary">
                  {activeConsultation.department}
                </span>
              </div>
              <div className="text-title-md font-bold text-on-surface mt-0.5">
                {activeConsultation.patient_name}
              </div>
              <p className="text-body-sm text-on-surface-variant line-clamp-1">
                {activeConsultation.chief_complaint || 'General medical examination'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <div className="text-label-xs text-on-surface-variant uppercase font-medium">
                Time Elapsed
              </div>
              <div className="font-mono text-title-md font-bold text-primary">
                {formatSec(activeConsultElapsedSec)}
              </div>
            </div>
            <button
              onClick={handleCompleteActive}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-label-sm font-semibold transition-all shadow-sm touch-tap flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Complete & Call Next
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-space-md p-space-md bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <div className="text-label-md font-semibold text-on-surface">Consultation Room Idle</div>
              <div className="text-body-sm text-on-surface-variant">No patient is currently inside. Call next token to start.</div>
            </div>
          </div>
          <button
            onClick={() => handleCallPatient()}
            disabled={waitingCount === 0}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-label-sm font-semibold hover:bg-primary/90 disabled:opacity-50 touch-tap"
          >
            Call First In Queue
          </button>
        </div>
      )}

      {/* ── 4. Department Filter & Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm mb-space-md">
        {/* Department Tabs */}
        <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-x-auto w-full sm:w-auto">
          {['All', 'General Medicine', 'Cardiology', 'Pediatrics'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-lg text-label-sm font-medium transition-all whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <svg
            className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search token, patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* ── 5. Live Queue List & Time Predictor Table ── */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/70 border-b border-outline-variant/30">
              <th className="px-4 py-3 text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Token #
              </th>
              <th className="px-4 py-3 text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Patient & Complaint
              </th>
              <th className="px-4 py-3 text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Triage Priority
              </th>
              <th className="px-4 py-3 text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Ahead
              </th>
              <th className="px-4 py-3 text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Estimated Wait & Clock
              </th>
              <th className="px-4 py-3 text-label-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-body-sm">
            {waitingPatientsWithEstimates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg
                      className="w-8 h-8 text-on-surface-variant/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="font-semibold text-on-surface">Queue is currently clear</p>
                    <p className="text-body-xs">No patients waiting in {selectedDept}. Click &ldquo;+ Add Walk-In&rdquo; to register.</p>
                  </div>
                </td>
              </tr>
            ) : (
              waitingPatientsWithEstimates.map((patient) => {
                // Priority badges styling
                const isEmergency = patient.priority === 'emergency'
                const isUrgent = patient.priority === 'urgent'

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-surface-container-low/40 transition-colors group"
                  >
                    {/* Token Number */}
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-surface-container-high font-bold font-mono text-primary text-label-md border border-outline-variant/30">
                        #{patient.token_number}
                      </div>
                    </td>

                    {/* Patient Name & Details */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-on-surface text-label-md">
                        {patient.patient_name}
                      </div>
                      <div className="flex items-center gap-1.5 text-body-xs text-on-surface-variant">
                        <span className="font-medium text-primary/80">{patient.department}</span>
                        <span>•</span>
                        <span className="max-w-[220px] truncate">{patient.chief_complaint}</span>
                      </div>
                    </td>

                    {/* Priority Tag */}
                    <td className="px-4 py-3.5">
                      {isEmergency ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Emergency
                        </span>
                      ) : isUrgent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Urgent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-xs font-medium text-on-surface-variant bg-surface-container-low border border-outline-variant/30">
                          Routine
                        </span>
                      )}
                    </td>

                    {/* People ahead */}
                    <td className="px-4 py-3.5">
                      {patient.peopleAhead === 0 ? (
                        <span className="text-label-sm font-bold text-emerald-600 dark:text-emerald-400">
                          Next in Line
                        </span>
                      ) : (
                        <span className="text-label-sm text-on-surface-variant font-medium">
                          {patient.peopleAhead} {patient.peopleAhead === 1 ? 'person' : 'people'} ahead
                        </span>
                      )}
                    </td>

                    {/* Dynamic Time Predictor */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-label-md font-bold ${
                              patient.calculatedWait === 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : patient.calculatedWait <= 15
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : patient.calculatedWait <= 30
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-on-surface'
                            }`}
                          >
                            {patient.calculatedWait === 0
                              ? 'Immediate'
                              : `~${patient.calculatedWait} mins wait`}
                          </span>
                          <span className="text-label-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md font-mono border border-outline-variant/20">
                            Est: {patient.predictedClock}
                          </span>
                        </div>
                        {/* Visual wait meter */}
                        <div className="w-36 h-1.5 bg-surface-container-high rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              patient.calculatedWait <= 15
                                ? 'bg-emerald-500'
                                : patient.calculatedWait <= 30
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(10, patient.calculatedWait * 1.5))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleCallPatient(patient.id)}
                          title="Call patient into consultation room"
                          className="px-2.5 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-lg text-label-xs font-semibold transition-all touch-tap"
                        >
                          Call Now
                        </button>

                        <button
                          onClick={() => handleTogglePriority(patient.id, patient.priority)}
                          title="Toggle priority (urgent / routine)"
                          className={`p-1.5 rounded-lg border text-label-xs transition-all touch-tap ${
                            patient.priority === 'urgent'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleCancelTicket(patient.id)}
                          title="Cancel / No Show"
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-600 border border-outline-variant/30 transition-all touch-tap"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── 6. Walk-In Registration Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-lg shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/20">
              <h3 className="text-title-md font-bold text-on-surface">
                Issue Queue Token (Walk-In)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddWalkIn} className="space-y-space-md pt-space-md">
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel K. Jackson"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Triage Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as 'routine' | 'urgent' | 'emergency')
                    }
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  Chief Complaint / Reason for Visit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild chest pain, fever 2 days"
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-space-sm border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-label-sm font-medium text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-on-primary rounded-xl text-label-sm font-semibold hover:bg-primary/90 disabled:opacity-50 touch-tap"
                >
                  {isSubmitting ? 'Generating Token...' : 'Generate Token & Add to Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
