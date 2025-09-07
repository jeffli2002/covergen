/**
 * Safe access token extraction without creating new Supabase client instances
 * This prevents the "Multiple GoTrueClient instances" error
 */

import type { UnifiedUser } from '@/services/unified/UserSessionService'

/**
 * Extract access token from unified user object
 * @param user - The UnifiedUser from AuthContext
 * @returns The access token or null if not available
 */
export function getAccessTokenFromUser(user: UnifiedUser | null): string | null {
  if (!user?.session?.accessToken) {
    return null
  }
  
  // Check if token is still valid (not expired)
  if (user.session.expiresAt) {
    const now = Math.floor(Date.now() / 1000)
    if (now >= user.session.expiresAt) {
      console.warn('[getAccessToken] Token has expired')
      return null
    }
  }
  
  return user.session.accessToken
}

/**
 * Extract access token from localStorage without importing Supabase client
 * This is a fallback method and should only be used if AuthContext is not available
 * @returns The access token or null if not found
 */
export function getAccessTokenFromStorage(): string | null {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || ''
    const storageKey = `sb-${projectRef}-auth-token`
    
    const storedData = localStorage.getItem(storageKey)
    if (!storedData) {
      return null
    }
    
    const parsed = JSON.parse(storedData)
    return parsed.access_token || null
  } catch (error) {
    console.error('[getAccessToken] Error reading from localStorage:', error)
    return null
  }
}