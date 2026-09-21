import React from 'react'
import { clsx } from 'clsx'

type KPICardProps = {
  title: string
  value: string | number
  icon: string
  unit?: string
  trend?: string
  trendDir?: 'up' | 'down' | 'neutral'
  subtitle?: string
  className?: string
  live?: boolean
  onClick?: () => void
}

export default function KPICard({
  title,
  value,
  icon,
  unit,
  trend,
  trendDir = 'neutral',
  subtitle,
  className,
  live = false,
  onClick,
}: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'group relative bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30',
        'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary/30',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 flex items-center gap-1.5">
            {live && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
            <span className="truncate">{title}</span>
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="font-heading text-display-lg text-on-surface font-bold leading-none tabular-nums font-mono">
              {value}
            </span>
            {unit && <span className="text-body-sm text-on-surface-variant font-medium">{unit}</span>}
          </div>
        </div>

        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:bg-primary group-hover:text-white">
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-outline-variant/15 text-body-sm">
          {trend && (
            <div
              className={clsx(
                'flex items-center gap-1 text-[12px] font-semibold',
                trendDir === 'up' && 'text-emerald-600 dark:text-emerald-400',
                trendDir === 'down' && 'text-rose-600 dark:text-rose-400',
                trendDir === 'neutral' && 'text-on-surface-variant'
              )}
            >
              <span className="material-symbols-outlined text-[16px]">
                {trendDir === 'up' ? 'trending_up' : trendDir === 'down' ? 'trending_down' : 'trending_flat'}
              </span>
              <span>{trend}</span>
            </div>
          )}
          {subtitle && <span className="text-[12px] text-on-surface-variant/70 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
