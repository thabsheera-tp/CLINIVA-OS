import { clsx } from 'clsx'

type KPICardProps = {
  title: string
  value: string | number
  icon: string
  trend?: string
  trendDir?: 'up' | 'down' | 'neutral'
  subtitle?: string
  className?: string
  live?: boolean
}

export default function KPICard({
  title,
  value,
  icon,
  trend,
  trendDir = 'neutral',
  subtitle,
  className,
  live = false,
}: KPICardProps) {
  return (
    <div className={clsx('stat-card group', className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
            {live && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            {title}
          </span>
          <span className="font-heading text-display-lg text-on-surface mt-1 leading-none tabular-nums">
            {value}
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-secondary-fixed/40 flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-space-md pt-space-sm flex items-center justify-between border-t border-outline-variant/20">
          {trend && (
            <div className={clsx(
              'flex items-center gap-1.5 text-label-sm',
              trendDir === 'up' ? 'text-status-success' :
              trendDir === 'down' ? 'text-tertiary' : 'text-on-surface-variant'
            )}>
              <span className="material-symbols-outlined text-[16px]">
                {trendDir === 'up' ? 'trending_up' : trendDir === 'down' ? 'trending_down' : 'trending_flat'}
              </span>
              <span>{trend}</span>
            </div>
          )}
          {subtitle && (
            <span className="text-body-sm text-on-surface-variant">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  )
}
