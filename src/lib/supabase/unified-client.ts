import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Single source of truth for Supabase client configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton instance to prevent multiple client creation
let singletonClient: ReturnType<typeof createSupabaseClient> | null = null

/**
 * Get or create the unified Supabase client instance
 * This ensures only ONE GoTrueClient instance exists across the entire app
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create a new instance (stateless)
    console.warn('[Unified Client] Creating server-side client - this should use server.ts instead')
    return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  // Client-side: use singleton pattern
  if (!singletonClient) {
    console.log('[Unified Client] Creating singleton browser client')
    singletonClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: window.localStorage,
        storageKey: `sb-${SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'local'}-auth-token`,
        debug: process.env.NODE_ENV === 'development',
      },
      global: {
        headers: {
          'X-Client-Info': 'coverimage-web'
        }
      }
    })

    // Add auth state change listener for debugging
    if (process.env.NODE_ENV === 'development') {
      singletonClient.auth.onAuthStateChange((event, session) => {
        console.log('[Unified Client] Auth state changed:', event, session?.user?.email)
      })
    }
  }

  return singletonClient
}

// Export the same instance that supabase-simple was exporting
// This maintains backward compatibility
export const supabase = getSupabaseClient()

// Helper functions that were in supabase-simple
export async function getSession() {
  try {
    const client = getSupabaseClient()
    const { data: { session }, error } = await client.auth.getSession()
    if (error) {
      console.error('[Unified Client] Error getting session:', error)
      return null
    }
    return session
  } catch (error) {
    console.error('[Unified Client] Unexpected error getting session:', error)
    return null
  }
}

export function onAuthStateChange(callback: (session: any) => void) {
  const client = getSupabaseClient()
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return subscription
}

// Reset function for testing or when needed
export function resetSupabaseClient() {
  if (typeof window !== 'undefined' && singletonClient) {
    console.log('[Unified Client] Resetting singleton client')
    singletonClient = null
  }
}