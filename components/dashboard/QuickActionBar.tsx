'use client'

import React, { useEffect } from 'react'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'

interface QuickActionBarProps {
  className?: string
}

export default function QuickActionBar({ className = '' }: QuickActionBarProps) {
  const {
    setBookingOpen,
    setPrescriptionOpen,
    setRegisterOpen,
    setVitalsOpen,
  } = useClinicRealtime()

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      if ((e.metaKey || e.ctrlKey)) {
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault()
          setBookingOpen(true)
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault()
          setPrescriptionOpen(true)
        } else if (e.key.toLowerCase() === 'e') {
          e.preventDefault()
          setRegisterOpen(true)
        } else if (e.key.toLowerCase() === 'v') {
          e.preventDefault()
          setVitalsOpen(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setBookingOpen, setPrescriptionOpen, setRegisterOpen, setVitalsOpen])

  return (
    <div
      className={`flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto smooth-touch-scroll ${className}`}
    >
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-label-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex-shrink-0">
          <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-[18px]">bolt</span>
          <span>Quick Actions</span>
        </div>

        <button
          onClick={() => setBookingOpen(true)}
          className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap flex-shrink-0"
          title="Instant Book (⌘B)"
        >
          <span className="material-symbols-outlined text-[16px] text-teal-600 dark:text-teal-400">event_available</span>
          <span>Book Appt</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ⌘B
          </kbd>
        </button>

        <button
          onClick={() => setPrescriptionOpen(true)}
          className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap flex-shrink-0"
          title="Write Prescription (⌘P)"
        >
          <span className="material-symbols-outlined text-[16px] text-teal-600 dark:text-teal-400">prescriptions</span>
          <span>e-Prescription</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ⌘P
          </kbd>
        </button>

        <button
          onClick={() => setRegisterOpen(true)}
          className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap flex-shrink-0"
          title="Emergency Intake (⌘E)"
        >
          <span className="material-symbols-outlined text-[16px] text-rose-600 dark:text-rose-400">emergency</span>
          <span>Emergency Intake</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ⌘E
          </kbd>
        </button>

        <button
          onClick={() => setVitalsOpen(true)}
          className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap flex-shrink-0"
          title="Record Vitals (⌘V)"
        >
          <span className="material-symbols-outlined text-[16px] text-sky-600 dark:text-sky-400">monitor_heart</span>
          <span>Record Vitals</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ⌘V
          </kbd>
        </button>
      </div>
  )
}
