import { clsx } from 'clsx'

type Variant = 'routine' | 'warning' | 'critical' | 'neutral' | 'info'

type StatusBadgeProps = {
  variant: Variant
  label: string
  pulse?: boolean
  className?: string
}

const variantClasses: Record<Variant, string> = {
  routine: 'badge-routine',
  warning: 'badge-warning',
  critical: 'badge-critical',
  neutral: 'badge-neutral',
  info: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-bold uppercase tracking-wider bg-surface-container-low border border-outline-variant text-on-surface-variant',
}

export default function StatusBadge({ variant, label, pulse = false, className }: StatusBadgeProps) {
  return (
    <span className={clsx(variantClasses[variant], className)}>
      {(pulse || variant === 'critical') && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            variant === 'critical' ? 'bg-tertiary animate-pulse' : 'bg-current animate-pulse'
          )}
        />
      )}
      {label}
    </span>
  )
}
