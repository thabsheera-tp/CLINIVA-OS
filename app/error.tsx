'use client'

import DashboardErrorFallback from '@/components/ui/DashboardErrorFallback'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <DashboardErrorFallback
        error={error}
        reset={reset}
        homeHref="/login"
        homeLabel="Back to Safety"
      />
    </div>
  )
}
