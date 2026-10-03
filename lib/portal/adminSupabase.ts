import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function isAdminConfigured(): boolean {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    ''
  return Boolean(serviceKey && serviceKey.trim().length > 10)
}

export function getAdminClient(): SupabaseClient<any> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fospnuhjxebcfoinzlsw.supabase.co'
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    ''

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in server environment.')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

