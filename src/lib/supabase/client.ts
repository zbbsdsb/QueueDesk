import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createBrowserClient>

export function createClient(): AnyClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as AnyClient
}
