import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client for API routes
 * This ensures proper token validation in server contexts
 */

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Get user from request headers in API routes
 * This properly validates tokens from the client-side Supabase instance
 */
export async function getUserFromRequest(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null, error: 'No authorization header' }
    }

    const token = authHeader.substring(7)
    
    // First, try to get the user directly with the token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (!error && user) {
      return { user, error: null }
    }

    // If direct token validation fails, try to validate through cookie session
    // This handles cases where the token format might be different
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // Look for Supabase session cookies
    const sessionCookies = allCookies.filter(cookie => 
      cookie.name.includes('sb-') && 
      (cookie.name.includes('auth-token') || cookie.name.includes('access-token'))
    )
    
    console.log('[Server Auth] Session cookies found:', sessionCookies.length)
    
    if (sessionCookies.length > 0) {
      // Try to reconstruct session from cookies
      for (const cookie of sessionCookies) {
        try {
          // Parse the cookie value which might contain the session
          const cookieData = JSON.parse(cookie.value)
          if (cookieData.access_token) {
            const { data: { user: cookieUser }, error: cookieError } = 
              await supabaseAdmin.auth.getUser(cookieData.access_token)
            
            if (!cookieError && cookieUser) {
              return { user: cookieUser, error: null }
            }
          }
        } catch (e) {
          // Cookie might not be JSON, try direct token validation
          const { data: { user: directUser }, error: directError } = 
            await supabaseAdmin.auth.getUser(cookie.value)
          
          if (!directError && directUser) {
            return { user: directUser, error: null }
          }
        }
      }
    }

    // If all validation attempts fail, return the original error
    return { user: null, error: error?.message || 'Invalid token' }
  } catch (error) {
    console.error('[Server Auth] Unexpected error:', error)
    return { user: null, error: 'Server error during authentication' }
  }
}

/**
 * Create a server-side Supabase client with user context
 * Useful for making authenticated requests on behalf of the user
 */
export async function createServerClientWithAuth(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization header')
  }

  const token = authHeader.substring(7)
  
  // Create a client that acts on behalf of the user
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}