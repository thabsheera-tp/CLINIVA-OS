type LoadingSkeletonProps = {
  rows?: number
  className?: string
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`stat-card ${className ?? ''}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-10 w-16" />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl" />
      </div>
      <div className="mt-4 pt-3 flex items-center justify-between">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-space-md p-space-md border-b border-outline-variant/20">
      <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton h-3 w-48" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  )
}

export default function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={`clinical-card overflow-hidden ${className ?? ''}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}
