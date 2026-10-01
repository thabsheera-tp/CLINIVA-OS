'use client'

import React, { useEffect } from 'react'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

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
      className={`flex items-center gap-2 p-1.5 bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] shadow-xs overflow-x-auto smooth-touch-scroll ${className}`}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-label-sm font-semibold text-[#60727F] dark:text-[#92A6B5] uppercase tracking-wider flex-shrink-0">
        <ClinivaIcon name="bolt" size={16} strokeWidth={1.5} className="text-[#0F8B8D]" />
        <span>Quick Actions</span>
      </div>

      <button
        onClick={() => setBookingOpen(true)}
        className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap flex-shrink-0"
        title="Instant Book (⌘B)"
      >
        <ClinivaIcon name="event_available" size={16} strokeWidth={1.5} className="text-[#0F8B8D]" />
        <span>Book Appt</span>
        <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-[#F0F4F7] dark:bg-white/10 font-mono text-[#60727F] dark:text-[#92A6B5] border border-[#E2E8EC] dark:border-white/[0.08]">
          ⌘B
        </kbd>
      </button>

      <button
        onClick={() => setPrescriptionOpen(true)}
        className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap flex-shrink-0"
        title="Write Prescription (⌘P)"
      >
        <ClinivaIcon name="prescriptions" size={16} strokeWidth={1.5} className="text-[#0F8B8D]" />
        <span>e-Prescription</span>
        <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-[#F0F4F7] dark:bg-white/10 font-mono text-[#60727F] dark:text-[#92A6B5] border border-[#E2E8EC] dark:border-white/[0.08]">
          ⌘P
        </kbd>
      </button>

      <button
        onClick={() => setRegisterOpen(true)}
        className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap flex-shrink-0"
        title="Emergency Intake (⌘E)"
      >
        <ClinivaIcon name="emergency" size={16} strokeWidth={1.5} className="text-[#C94A4A]" />
        <span>Emergency Intake</span>
        <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-[#F0F4F7] dark:bg-white/10 font-mono text-[#60727F] dark:text-[#92A6B5] border border-[#E2E8EC] dark:border-white/[0.08]">
          ⌘E
        </kbd>
      </button>

      <button
        onClick={() => setVitalsOpen(true)}
        className="btn-secondary text-label-sm py-1.5 px-3 whitespace-nowrap flex-shrink-0"
        title="Record Vitals (⌘V)"
      >
        <ClinivaIcon name="monitor_heart" size={16} strokeWidth={1.5} className="text-[#0F8B8D]" />
        <span>Record Vitals</span>
        <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-[#F0F4F7] dark:bg-white/10 font-mono text-[#60727F] dark:text-[#92A6B5] border border-[#E2E8EC] dark:border-white/[0.08]">
          ⌘V
        </kbd>
      </button>
    </div>
  )
}
