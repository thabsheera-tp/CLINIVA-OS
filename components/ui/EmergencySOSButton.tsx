'use client'

import React, { useState } from 'react'
import EmergencySOSModal from '@/components/modals/EmergencySOSModal'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

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
        <div className={`relative ${className}`}>
          <button
            onClick={() => setIsSOSOpen(true)}
            type="button"
            aria-label="Emergency Ambulance Dispatch"
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#C94A4A] hover:bg-[#B73D3D] active:scale-[0.98] text-white rounded-xl font-semibold shadow-card transition-all touch-tap border border-[#C94A4A]"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <ClinivaIcon name="ambulance" size={16} strokeWidth={1.8} className="text-white" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-white/80">
                108 Emergency
              </span>
              <span className="block text-xs font-bold text-white">
                Ambulance
              </span>
            </div>
          </button>
        </div>
      )}

      {variant === 'banner' && (
        <div
          onClick={() => setIsSOSOpen(true)}
          className={`p-3.5 bg-[#C94A4A] hover:bg-[#B73D3D] rounded-xl text-white flex items-center justify-between shadow-card cursor-pointer transition-all border border-[#C94A4A] ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <ClinivaIcon name="ambulance" size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xs uppercase tracking-wider">
                  Emergency Ambulance
                </span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold">
                  108 / GPS Dispatch
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Broadcast GPS coordinates to Trauma Center &amp; dispatch nearest ambulance.
              </p>
            </div>
          </div>
          <ClinivaIcon name="arrow_forward" size={18} strokeWidth={1.5} className="text-white/80" />
        </div>
      )}

      {variant === 'compact' && (
        <button
          onClick={() => setIsSOSOpen(true)}
          type="button"
          aria-label="Call Emergency Ambulance"
          className={`px-3 py-1.5 rounded-lg bg-[#C94A4A] hover:bg-[#B73D3D] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all ${className}`}
        >
          <ClinivaIcon name="ambulance" size={14} strokeWidth={1.8} className="text-white animate-pulse" />
          <span>Ambulance</span>
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
