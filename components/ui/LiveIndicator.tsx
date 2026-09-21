import { clsx } from 'clsx'

type LiveIndicatorProps = {
  label?: string
  className?: string
  size?: 'sm' | 'md'
}

export default function LiveIndicator({ label, className, size = 'md' }: LiveIndicatorProps) {
  return (
    <div className={clsx('flex items-center gap-1.5', className)}>
      <span className={clsx(
        'rounded-full bg-primary animate-pulse',
        size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
      )} />
      {label && (
        <span className={clsx(
          'text-on-surface font-semibold',
          size === 'sm' ? 'text-label-sm' : 'text-label-md'
        )}>
          {label}
        </span>
      )}
    </div>
  )
}
