// BestAuth Database Client with Safe Initialization
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

/**
 * Get or create Supabase client for BestAuth
 * Handles both server and client-side initialization
 */
export function getBestAuthSupabaseClient(): SupabaseClient | null {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient
  }

  // Check required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[BestAuth] Missing required environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    })
    return null
  }

  try {
    // Create client with appropriate configuration
    supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'x-client-info': 'bestauth/1.0.0'
          }
        }
      }
    )
    
    return supabaseClient
  } catch (error) {
    console.error('[BestAuth] Failed to create Supabase client:', error)
    return null
  }
}

/**
 * Reset the client (useful for testing or re-initialization)
 */
export function resetBestAuthClient() {
  supabaseClient = null
}