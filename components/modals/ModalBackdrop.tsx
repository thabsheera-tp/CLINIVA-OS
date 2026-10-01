'use client'

import React, { useEffect } from 'react'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

type ModalBackdropProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: string
  children: React.ReactNode
  maxWidth?: string
}

export default function ModalBackdrop({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = 'clinical_notes',
  children,
  maxWidth = 'max-w-2xl',
}: ModalBackdropProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[#123047]/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal dialog: bottom sheet on small mobile, centered dialog on sm+ */}
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-[#122433] rounded-t-xl sm:rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] shadow-modal overflow-hidden z-10 flex flex-col max-h-[92dvh] sm:max-h-[88dvh] my-0 sm:my-auto animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150`}
      >
        {/* Mobile drag handle (bottom sheet indicator) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#E2E8EC] dark:bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#E2E8EC] dark:border-white/[0.08] bg-[#F7F9FA] dark:bg-[#122433] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-lg bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 border border-[#0F8B8D]/30 flex items-center justify-center text-[#0F8B8D] dark:text-[#28B5B7] flex-shrink-0">
              <ClinivaIcon name={icon} size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading text-base sm:text-lg text-[#123047] dark:text-white font-bold tracking-tight truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-[#60727F] dark:text-[#92A6B5] truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F4F7] dark:hover:bg-white/10 text-[#60727F] hover:text-[#172B3A] dark:text-[#92A6B5] dark:hover:text-white transition-colors flex-shrink-0 touch-tap"
            aria-label="Close modal"
          >
            <ClinivaIcon name="close" size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content body with smooth touch scrolling */}
        <div className="p-4 sm:p-5 overflow-y-auto smooth-touch-scroll flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
