import { createBrowserClient } from '@supabase/ssr'

// Singleton instance to prevent multiple clients
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

// Create Supabase client for browser-side usage
export function createSupabaseClient() {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Client] Missing required environment variables')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'missing')
    
    // Return a mock client that won't crash the app
    return null as any
  }
  
  // Create and store the singleton instance
  supabaseInstance = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )
  
  return supabaseInstance
}

// Legacy export for backward compatibility - ensure it's the same instance
export const supabase = createSupabaseClient()