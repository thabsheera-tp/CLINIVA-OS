'use client'

import React from 'react'

export function ClinivaMark({
  size = 32,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#0F8B8D" />
      <path
        d="M20 10v20M10 20h20"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="28" cy="12" r="3.5" fill="#28B5B7" />
    </svg>
  )
}

type ClinivaLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  subtitle?: string
  badge?: string
  className?: string
  showTextOnMobile?: boolean
}

export default function ClinivaLogo({
  size = 'md',
  subtitle,
  badge,
  className = '',
  showTextOnMobile = true,
}: ClinivaLogoProps) {
  const iconSize = size === 'sm' ? 26 : size === 'lg' ? 36 : 30
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <ClinivaMark size={iconSize} />
      <div className={`flex flex-col min-w-0 ${showTextOnMobile ? 'flex' : 'hidden sm:flex'}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`font-heading font-bold tracking-tight text-[#123047] dark:text-white leading-none whitespace-nowrap ${textSize}`}
          >
            CLINIVA <span className="text-[#0F8B8D] dark:text-[#28B5B7]">OS</span>
          </span>
          {badge && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] border border-[#0F8B8D]/30 whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[11px] text-[#4A5D6B] dark:text-[#9FB1C0] font-medium truncate mt-0.5 leading-tight">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
