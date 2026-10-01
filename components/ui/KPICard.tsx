import React from 'react'
import { clsx } from 'clsx'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

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
        'group relative bg-white dark:bg-[#122433] rounded-xl p-3.5 sm:p-4 border border-[#E2E8EC] dark:border-white/[0.08]',
        'transition-all duration-150 ease-out hover:border-[#D5DFE6] dark:hover:border-white/[0.12]',
        onClick && 'cursor-pointer active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4A5D6B] dark:text-[#9FB1C0] flex items-center gap-1.5">
            {live && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F8B8D] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F8B8D]" />
              </span>
            )}
            <span className="truncate">{title}</span>
          </span>
          <div className="flex items-baseline gap-1.5 mt-1 sm:mt-1.5">
            <span className="font-heading text-[24px] sm:text-[26px] text-[#123047] dark:text-white font-bold leading-none tabular-nums font-mono">
              {value}
            </span>
            {unit && <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{unit}</span>}
          </div>
        </div>

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#E8F6F5] dark:bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7] border border-[#0F8B8D]/20 flex items-center justify-center flex-shrink-0">
          <ClinivaIcon name={icon} size={18} strokeWidth={1.5} />
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-[#E2E8EC] dark:border-white/[0.06] text-xs">
          {trend && (
            <div
              className={clsx(
                'flex items-center gap-1.5 text-xs font-medium',
                trendDir === 'up' && 'text-[#2E7D5B] dark:text-[#3E9F76]',
                trendDir === 'down' && 'text-[#C94A4A] dark:text-[#E06262]',
                trendDir === 'neutral' && 'text-[#4A5D6B] dark:text-[#9FB1C0]'
              )}
            >
              <ClinivaIcon
                name={trendDir === 'up' ? 'trending_up' : trendDir === 'down' ? 'trending_down' : 'trending_flat'}
                size={14}
                strokeWidth={1.5}
              />
              <span>{trend}</span>
            </div>
          )}
          {subtitle && <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
