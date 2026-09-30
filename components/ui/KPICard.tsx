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
        'group relative bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800',
        'transition-all duration-150 ease-out hover:border-slate-300 dark:hover:border-slate-700 shadow-xs',
        onClick && 'cursor-pointer active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {live && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
            <span className="truncate">{title}</span>
          </span>
          <div className="flex items-baseline gap-1 mt-1.5 sm:mt-2">
            <span className="font-heading text-[22px] sm:text-display-lg text-slate-900 dark:text-slate-50 font-bold leading-none tabular-nums font-mono">
              {value}
            </span>
            {unit && <span className="text-body-sm text-slate-500 dark:text-slate-400 font-medium">{unit}</span>}
          </div>
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{icon}</span>
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-body-sm">
          {trend && (
            <div
              className={clsx(
                'flex items-center gap-1 text-[12px] font-medium',
                trendDir === 'up' && 'text-emerald-700 dark:text-emerald-400',
                trendDir === 'down' && 'text-rose-700 dark:text-rose-400',
                trendDir === 'neutral' && 'text-slate-500 dark:text-slate-400'
              )}
            >
              <span className="material-symbols-outlined text-[15px]">
                {trendDir === 'up' ? 'trending_up' : trendDir === 'down' ? 'trending_down' : 'trending_flat'}
              </span>
              <span>{trend}</span>
            </div>
          )}
          {subtitle && <span className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
