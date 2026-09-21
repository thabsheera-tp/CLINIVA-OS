'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-2 p-2 rounded-full transition-all duration-200 hover:bg-surface-container text-on-surface-variant hover:text-on-surface touch-tap hover-lift ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <span className="material-symbols-outlined text-[20px] text-amber-400 transition-transform duration-300 rotate-0">
            light_mode
          </span>
        ) : (
          <span className="material-symbols-outlined text-[20px] text-primary transition-transform duration-300 -rotate-12">
            dark_mode
          </span>
        )}
      </div>

      {showLabel && (
        <span className="text-label-sm font-medium">
          {isDark ? 'Light' : 'Dark'} Mode
        </span>
      )}
    </button>
  )
}
