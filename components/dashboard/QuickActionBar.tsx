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
      className={`flex items-center gap-2 p-1.5 bg-surface-container-low/80 backdrop-blur-sm rounded-2xl border border-outline-variant/30 overflow-x-auto smooth-touch-scroll ${className}`}
    >
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
          <span>Quick Actions</span>
        </div>

        <button
          onClick={() => setBookingOpen(true)}
          className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap hover-lift btn-press flex-shrink-0"
          title="Instant Book (⌘B)"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">event_available</span>
          <span>Book Appt</span>
          <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded text-[10px] bg-surface-container font-mono text-outline">
            ⌘B
          </kbd>
        </button>

        <button
          onClick={() => setPrescriptionOpen(true)}
          className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap hover-lift btn-press flex-shrink-0"
          title="Write Prescription (⌘P)"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">prescriptions</span>
          <span>e-Prescription</span>
          <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded text-[10px] bg-surface-container font-mono text-outline">
            ⌘P
          </kbd>
        </button>

        <button
          onClick={() => setRegisterOpen(true)}
          className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap hover-lift btn-press flex-shrink-0"
          title="Emergency Intake (⌘E)"
        >
          <span className="material-symbols-outlined text-[16px] text-tertiary">emergency</span>
          <span>Emergency Intake</span>
          <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded text-[10px] bg-surface-container font-mono text-outline">
            ⌘E
          </kbd>
        </button>

        <button
          onClick={() => setVitalsOpen(true)}
          className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap hover-lift btn-press flex-shrink-0"
          title="Record Vitals (⌘V)"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary">monitor_heart</span>
          <span>Record Vitals</span>
          <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded text-[10px] bg-surface-container font-mono text-outline">
            ⌘V
          </kbd>
        </button>
      </div>
  )
}
