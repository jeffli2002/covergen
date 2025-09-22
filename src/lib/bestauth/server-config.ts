// BestAuth Server Configuration Helper
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for BestAuth server operations
 * This ensures we have proper access to environment variables
 */
export async function createBestAuthServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[BestAuth] Missing required environment variables for server client')
    throw new Error('BestAuth configuration error: Missing database credentials')
  }

  const cookieStore = await cookies()

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      }
    }
  })
}

/**
 * Execute a database operation with proper error handling
 */
export async function executeBestAuthQuery<T>(
  operation: (client: any) => Promise<T>
): Promise<T | null> {
  try {
    const client = await createBestAuthServerClient()
    return await operation(client)
  } catch (error) {
    console.error('[BestAuth] Database operation failed:', error)
    return null
  }
}