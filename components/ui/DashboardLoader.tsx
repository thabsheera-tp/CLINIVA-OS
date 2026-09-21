import { SkeletonCard, SkeletonRow } from '@/components/ui/LoadingSkeleton'

/** Full dashboard loading skeleton — shown while any dashboard page segment is loading */
export default function DashboardLoader() {
  return (
    <div className="flex flex-col w-full space-y-gutter-desktop animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2 pb-4 border-b border-outline-variant/20">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-7 w-48 rounded" />
        <div className="skeleton h-3 w-72 rounded" />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter-mobile">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {/* Table skeleton */}
      <div className="clinical-card overflow-hidden">
        <div className="p-4 border-b border-outline-variant/20">
          <div className="skeleton h-4 w-40 rounded" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  )
}
