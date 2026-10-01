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
            aria-label="Emergency SOS & Ambulance Dispatch"
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#C94A4A] hover:bg-[#B73D3D] active:scale-[0.98] text-white rounded-xl font-semibold shadow-card transition-all touch-tap border border-[#C94A4A]"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <ClinivaIcon name="emergency" size={16} strokeWidth={1.5} className="text-white" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-white/80">
                Dispatch
              </span>
              <span className="block text-xs font-bold text-white">
                Emergency SOS
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
              <ClinivaIcon name="emergency" size={18} strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xs uppercase tracking-wider">
                  Emergency SOS & Ambulance
                </span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold">
                  GPS Dispatch
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Broadcast coordinates to Trauma Center & dispatch ambulance.
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
          className={`px-3 py-1.5 rounded-lg bg-[#C94A4A] hover:bg-[#B73D3D] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
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
