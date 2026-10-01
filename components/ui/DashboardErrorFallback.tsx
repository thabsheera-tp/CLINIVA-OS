'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
  /** Department home link, e.g. "/doctor" */
  homeHref?: string
  homeLabel?: string
}

export default function DashboardErrorFallback({ error, reset, homeHref = '/', homeLabel = 'Dashboard' }: Props) {
  useEffect(() => {
    console.error('[Cliniva OS]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center">
        <ClinivaIcon name="error" size={36} strokeWidth={1.5} className="text-[#C94A4A]" />
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-headline-md font-bold text-on-surface">
          Failed to load this page
        </h2>
        <p className="text-body-md text-on-surface-variant max-w-xs mx-auto">
          A server or network error occurred. No data was changed.
        </p>
        {error.digest && (
          <p className="text-label-sm text-outline font-mono bg-surface-container px-2 py-1 rounded-lg inline-block">
            Ref: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary flex items-center gap-2">
          <ClinivaIcon name="refresh" size={18} strokeWidth={1.5} />
          Retry
        </button>
        <Link href={homeHref} className="btn-secondary flex items-center gap-2">
          <ClinivaIcon name="arrow_back" size={18} strokeWidth={1.5} />
          {homeLabel}
        </Link>
      </div>
    </div>
  )
}
