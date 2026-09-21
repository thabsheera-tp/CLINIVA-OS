'use client'

import React, { useState } from 'react'
import EmergencySOSModal from '@/components/modals/EmergencySOSModal'

type Props = {
  className?: string
  patientName?: string
  patientPhone?: string
  variant?: 'floating' | 'banner' | 'compact'
}

export default function EmergencySOSButton({
  className = '',
  patientName = 'Marcus Delacroix',
  patientPhone = '+1 (555) 201-9481',
  variant = 'floating',
}: Props) {
  const [isSOSOpen, setIsSOSOpen] = useState(false)

  return (
    <>
      {variant === 'floating' && (
        <div className={`fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 ${className}`}>
          {/* Pulsating Glowing Ring Behind Button */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-600 to-red-600 opacity-75 blur-sm animate-pulse group-hover:opacity-100 transition duration-300" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-black text-white items-center justify-center">
                !
              </span>
            </span>

            <button
              onClick={() => setIsSOSOpen(true)}
              type="button"
              aria-label="Emergency SOS & Ambulance Dispatch"
              className="relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white rounded-full font-black shadow-xl shadow-rose-600/40 border-2 border-white/30 transition-all transform hover:scale-105 active:scale-95 touch-tap"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                <span className="material-symbols-outlined text-[20px] text-white">
                  e911_emergency
                </span>
              </div>
              <div className="text-left leading-tight pr-1">
                <span className="block text-[11px] font-black tracking-widest uppercase text-white/90">
                  One-Tap
                </span>
                <span className="block text-label-md font-extrabold tracking-wider text-white">
                  SOS EMERGENCY
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {variant === 'banner' && (
        <div
          onClick={() => setIsSOSOpen(true)}
          className={`p-3.5 bg-gradient-to-r from-rose-600 to-red-700 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-rose-600/25 cursor-pointer hover:brightness-105 transition-all ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[24px]">e911_emergency</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-label-md uppercase tracking-wider">
                  Emergency SOS & Ambulance
                </span>
                <span className="px-2 py-0.2 bg-white/20 rounded-full text-[10px] font-bold">
                  Instant GPS Dispatch
                </span>
              </div>
              <p className="text-body-xs text-white/80">
                Tap to broadcast live coordinates to Trauma Center & dispatch ambulance.
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[20px] text-white/80">arrow_forward</span>
        </div>
      )}

      {variant === 'compact' && (
        <button
          onClick={() => setIsSOSOpen(true)}
          type="button"
          className={`px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-label-xs flex items-center gap-1.5 shadow-sm transition-all ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>SOS Emergency</span>
        </button>
      )}

      {/* Emergency Modal */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        patientName={patientName}
        patientPhone={patientPhone}
      />
    </>
  )
}
