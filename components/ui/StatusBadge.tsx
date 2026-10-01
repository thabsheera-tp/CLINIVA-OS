import React from 'react'
import { clsx } from 'clsx'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

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
    container: 'bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/20 dark:bg-[#2E7D5B]/20 dark:text-[#3E9F76] dark:border-[#2E7D5B]/30',
    dot: 'bg-[#2E7D5B]',
    defaultIcon: 'check_circle',
  },
  warning: {
    container: 'bg-[#C58A24]/10 text-[#C58A24] border-[#C58A24]/20 dark:bg-[#C58A24]/20 dark:text-[#E0A238] dark:border-[#C58A24]/30',
    dot: 'bg-[#C58A24]',
    defaultIcon: 'schedule',
  },
  critical: {
    container: 'bg-[#C94A4A]/10 text-[#C94A4A] border-[#C94A4A]/20 dark:bg-[#C94A4A]/20 dark:text-[#E06262] dark:border-[#C94A4A]/30 font-bold',
    dot: 'bg-[#C94A4A]',
    defaultIcon: 'priority_high',
  },
  info: {
    container: 'bg-[#E8F6F5] text-[#0F8B8D] border-[#0F8B8D]/30 dark:bg-[#0F8B8D]/20 dark:text-[#28B5B7] dark:border-[#0F8B8D]/40',
    dot: 'bg-[#0F8B8D]',
    defaultIcon: 'info',
  },
  neutral: {
    container: 'bg-[#F0F4F7] text-[#60727F] border-[#E2E8EC] dark:bg-[#1B354A] dark:text-[#92A6B5] dark:border-[#22425B]',
    dot: 'bg-[#60727F]',
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
        <ClinivaIcon
          name={displayIcon}
          size={size === 'sm' ? 12 : 14}
          strokeWidth={1.5}
          className="flex-shrink-0"
        />
      ) : null}
      <span className="truncate">{label}</span>
    </span>
  )
}
