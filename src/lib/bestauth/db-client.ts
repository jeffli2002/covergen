// BestAuth Database Client with Safe Initialization
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

/**
 * Get or create Supabase client for BestAuth
 * Handles both server and client-side initialization
 */
export function getBestAuthSupabaseClient(): SupabaseClient | null {
  // For server-side operations, always use service role key and create fresh client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceKey) {
    console.error('[BestAuth] Missing required environment variables:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey
    })
    return null
  }
  
  // Always create fresh client with service role key
  try {
    const client = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'x-client-info': 'bestauth/1.0.0'
        }
      }
    })
    
    console.log('[BestAuth] Database client created with service_role key')
    return client
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