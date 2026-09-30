'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './server'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn('[Supabase Client] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.')
  }
}

/**
 * Create (or reuse) a Supabase client for use in Client Components.
 * Singleton pattern prevents multiple instances during re-renders.
 */
export function createClientSideClient() {
  if (client) return client

  client = createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )

  return client
}
