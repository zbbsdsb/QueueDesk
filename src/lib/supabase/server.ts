import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createServerClient>

export async function createClient(): Promise<AnyClient> {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookieStore.set(cookiesToSet[0]!.name, cookiesToSet[0]!.value, cookiesToSet[0]!.options)
          } catch {
            // Server Component — handled by middleware refresh
          }
        },
      },
    }
  )
}
