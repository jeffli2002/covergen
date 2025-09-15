import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Singleton instance to prevent multiple client creation
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Create Supabase client for browser-side usage
export function createSupabaseClient() {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[supabase-client] Missing required environment variables:', {
      url: supabaseUrl ? 'SET' : 'MISSING',
      key: supabaseAnonKey ? 'SET' : 'MISSING'
    })
    throw new Error('Supabase environment variables are not configured')
  }

  console.log('[supabase-client] Creating singleton Supabase client instance')
  
  // Create and store the singleton instance
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // Use PKCE flow consistently
    }
  })

  return supabaseInstance
}

// Export singleton instance
export const supabase = createSupabaseClient()