'use client'

import { useEffect, useCallback } from 'react'
import { createClientSideClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

type UseRealtimeSubscriptionOptions<T = Record<string, unknown>> = {
  /** Supabase table to subscribe to */
  table: string
  /** Optional filter e.g. `tenant_id=eq.${tenantId}` */
  filter?: string
  /** Which DML events to listen for */
  events?: RealtimeEvent[]
  /** Callback fired on each matching row change */
  onChanged: (payload: {
    eventType: RealtimeEvent
    new: T
    old: Partial<T>
  }) => void
  /** Set false to skip subscription (e.g. when tenant_id isn't loaded yet) */
  enabled?: boolean
}

/**
 * useRealtimeSubscription — wraps Supabase Realtime postgres_changes.
 *
 * Usage:
 * ```ts
 * useRealtimeSubscription({
 *   table: 'appointments',
 *   filter: `tenant_id=eq.${tenantId}`,
 *   onChanged: ({ eventType, new: row }) => {
 *     if (eventType === 'UPDATE') refreshQueue()
 *   }
 * })
 * ```
 */
export function useRealtimeSubscription<T = Record<string, unknown>>({
  table,
  filter,
  events = ['*'],
  onChanged,
  enabled = true,
}: UseRealtimeSubscriptionOptions<T>) {
  const supabase = createClientSideClient()

  const stableOnChanged = useCallback(onChanged, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled) return

    let channel: RealtimeChannel | null = null

    const channelName = `cliniva:${table}:${filter ?? 'all'}:${Date.now()}`
    channel = supabase.channel(channelName)

    events.forEach((event) => {
      channel!.on(
        // @ts-expect-error — Supabase types for postgres_changes are complex
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: { eventType: RealtimeEvent; new: T; old: Partial<T> }) => {
          stableOnChanged(payload)
        }
      )
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.debug(`[Cliniva Realtime] Subscribed to ${table}${filter ? ` (${filter})` : ''}`)
      }
      if (status === 'CHANNEL_ERROR') {
        console.error(`[Cliniva Realtime] Error on channel ${channelName}`)
      }
    })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, filter, enabled, supabase, stableOnChanged, events])
}
