'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error monitoring service (e.g. Sentry) in production
    console.error('[Cliniva OS Error]', error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-surface text-on-surface font-body antialiased flex items-center justify-center min-h-screen px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-error/10 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-error text-[44px]">error_med</span>
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-headline-lg font-bold text-on-surface">
              Something went wrong
            </h1>
            <p className="text-body-md text-on-surface-variant">
              An unexpected error occurred. Your session and data are safe.
            </p>
            {error.digest && (
              <p className="text-label-sm text-outline font-mono bg-surface-container px-3 py-1.5 rounded-lg inline-block">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="btn-primary flex items-center gap-2 justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Try Again
            </button>
            <Link href="/" className="btn-secondary flex items-center gap-2 justify-center">
              <span className="material-symbols-outlined text-[18px]">home</span>
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
