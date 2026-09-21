'use client'

import React, { useEffect } from 'react'

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
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal dialog: bottom sheet on small mobile, centered dialog on sm+ */}
      <div
        className={`relative w-full ${maxWidth} bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] my-0 sm:my-auto animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150`}
        style={{ boxShadow: 'var(--shadow-modal)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-space-lg py-3 sm:py-space-md border-b border-outline-variant/20 bg-surface-container-low/50 flex-shrink-0">
          <div className="flex items-center gap-space-sm min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">{icon}</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-heading text-headline-sm text-on-surface font-semibold tracking-tight truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-body-sm text-on-surface-variant truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0 touch-tap"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content body with smooth touch scrolling */}
        <div className="p-4 sm:p-space-lg overflow-y-auto smooth-touch-scroll flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
