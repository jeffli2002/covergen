import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Simple Supabase client for OAuth flows
// This avoids the complexity of SSR clients which can cause multiple client instance warnings
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Use PKCE flow consistently
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
)

// Helper function to get current session
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('[Supabase Simple] Error getting session:', error)
      return null
    }
    return session
  } catch (error) {
    console.error('[Supabase Simple] Unexpected error getting session:', error)
    return null
  }
}

// Helper function to listen for auth changes
export function onAuthStateChange(callback: (session: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
    callback(session)
  })
  return subscription
}