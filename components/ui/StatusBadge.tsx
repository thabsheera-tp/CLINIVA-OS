import React from 'react'
import { clsx } from 'clsx'

type Variant = 'routine' | 'warning' | 'critical' | 'neutral' | 'info'

type StatusBadgeProps = {
  variant: Variant
  label: string
  icon?: string
  pulse?: boolean
  className?: string
  size?: 'sm' | 'md'
}

const variantStyles: Record<Variant, { container: string; dot: string; defaultIcon?: string }> = {
  routine: {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
    defaultIcon: 'check_circle',
  },
  warning: {
    container: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    dot: 'bg-amber-500',
    defaultIcon: 'schedule',
  },
  critical: {
    container: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50 font-bold',
    dot: 'bg-rose-500',
    defaultIcon: 'priority_high',
  },
  info: {
    container: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50',
    dot: 'bg-sky-500',
    defaultIcon: 'info',
  },
  neutral: {
    container: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
}

export default function StatusBadge({
  variant,
  label,
  icon,
  pulse = false,
  className,
  size = 'md',
}: StatusBadgeProps) {
  const style = variantStyles[variant] ?? variantStyles.neutral
  const showPulse = pulse || variant === 'critical'
  const displayIcon = icon ?? style.defaultIcon

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider font-semibold select-none transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]',
        style.container,
        className
      )}
    >
      {showPulse ? (
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', style.dot)} />
          <span className={clsx('relative inline-flex rounded-full h-1.5 w-1.5', style.dot)} />
        </span>
      ) : displayIcon ? (
        <span className={clsx('material-symbols-outlined flex-shrink-0', size === 'sm' ? 'text-[12px]' : 'text-[14px]')}>
          {displayIcon}
        </span>
      ) : null}
      <span className="truncate">{label}</span>
    </span>
  )
}
