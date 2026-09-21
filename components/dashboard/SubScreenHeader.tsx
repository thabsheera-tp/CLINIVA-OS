'use client'

import React from 'react'
import Link from 'next/link'

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
      className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl border border-outline-variant/30"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex flex-col space-y-1">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant flex-wrap">
          <Link
            href={parentHref}
            className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {parentLabel}
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold">{title}</span>
          {badge && (
            <span
              className={`text-label-sm px-2 py-0.5 rounded-full font-bold ml-1 ${
                badgeVariant === 'live'
                  ? 'bg-primary-fixed text-on-primary-fixed inline-flex items-center gap-1'
                  : badgeVariant === 'alert'
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              {badgeVariant === 'live' && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
              {badge}
            </span>
          )}
        </div>

        <h1 className="font-heading text-headline-md text-on-surface font-semibold tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="text-body-sm text-on-surface-variant max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto">
          {actions}
        </div>
      )}
    </section>
  )
}
