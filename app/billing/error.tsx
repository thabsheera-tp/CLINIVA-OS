'use client'
import DashboardErrorFallback from '@/components/ui/DashboardErrorFallback'
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <DashboardErrorFallback error={error} reset={reset} homeHref="/billing" homeLabel="Billing" />
}
