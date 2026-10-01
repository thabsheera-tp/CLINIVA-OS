'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

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
      className={`relative inline-flex items-center gap-2 p-2 rounded-full transition-all duration-200 hover:bg-[#F0F4F7] dark:hover:bg-white/10 text-[#60727F] dark:text-[#92A6B5] hover:text-[#172B3A] dark:hover:text-[#E8F0F5] touch-tap active:scale-95 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform duration-300 rotate-0" />
        ) : (
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-primary transition-transform duration-300 -rotate-12" />
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
