'use client'

import React from 'react'
import Link from 'next/link'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

type SubScreenHeaderProps = {
  parentLabel: string
  parentHref: string
  title: string
  badge?: string
  badgeVariant?: 'default' | 'live' | 'alert'
  description?: string
  actions?: React.ReactNode
}

export default function SubScreenHeader({
  parentLabel,
  parentHref,
  title,
  badge,
  badgeVariant = 'default',
  description,
  actions,
}: SubScreenHeaderProps) {
  return (
    <section
      className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-[#122433] p-4 sm:p-5 rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] shadow-card"
    >
      <div className="flex flex-col space-y-1 min-w-0">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] flex-wrap">
          <Link
            href={parentHref}
            className="hover:text-[#0F8B8D] dark:hover:text-[#28B5B7] transition-colors flex items-center gap-1 font-medium"
          >
            <ClinivaIcon name="arrow_back" size={14} strokeWidth={1.5} />
            <span>{parentLabel}</span>
          </Link>
          <span className="text-slate-300 dark:text-white/20">/</span>
          <span className="text-[#123047] dark:text-white font-medium truncate">{title}</span>
        </div>

        {/* Title + Status Badge */}
        <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
          <h1 className="font-heading text-lg sm:text-xl text-[#123047] dark:text-white font-bold tracking-tight">
            {title}
          </h1>
          {badge && (
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                badgeVariant === 'live'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50 inline-flex items-center gap-1.5'
                  : badgeVariant === 'alert'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50'
                  : 'bg-slate-100 dark:bg-white/[0.06] text-[#4A5D6B] dark:text-[#9FB1C0] border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              {badgeVariant === 'live' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              {badge}
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto xl:flex-shrink-0">
          {actions}
        </div>
      )}
    </section>
  )
}
