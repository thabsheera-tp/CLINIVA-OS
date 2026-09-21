'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './server'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * Create (or reuse) a Supabase client for use in Client Components.
 * Singleton pattern prevents multiple instances during re-renders.
 */
export function createClientSideClient() {
  if (client) return client

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
