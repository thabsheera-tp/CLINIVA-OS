'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './server'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://fospnuhjxebcfoinzlsw.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvc3BudWhqeGViY2ZvaW56bHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTk0MzYsImV4cCI6MjEwNTI5NTQzNn0.7_PMUD4OSUI3xhVRQJJUUdRWccGLPRyPYKrt0NSp7FM'

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
