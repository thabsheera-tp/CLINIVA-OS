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
    container: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-500',
    defaultIcon: 'check_circle',
  },
  warning: {
    container: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    dot: 'bg-amber-500',
    defaultIcon: 'schedule',
  },
  critical: {
    container: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 font-extrabold',
    dot: 'bg-rose-500',
    defaultIcon: 'priority_high',
  },
  info: {
    container: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
    dot: 'bg-indigo-500',
    defaultIcon: 'info',
  },
  neutral: {
    container: 'bg-surface-container text-on-surface-variant border-outline-variant/30',
    dot: 'bg-outline',
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
