import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton browser client with proper OAuth configuration
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseClient() {
  if (typeof window === 'undefined') {
    // Return a new client for SSR
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  }

  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Enable to handle OAuth callbacks
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development' // Enable debug logs in dev
    }
  })

  return browserClient
}

// For backward compatibility - create a getter that returns the client
export const getSupabase = () => createSupabaseClient()