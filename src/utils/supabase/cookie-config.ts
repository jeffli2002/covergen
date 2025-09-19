import { type CookieOptions } from '@supabase/ssr'

/**
 * Enhanced cookie options for Chrome compatibility
 * Chrome requires SameSite=None; Secure for OAuth cookies
 */
export function getEnhancedCookieOptions(
  name: string, 
  options: CookieOptions = {}
): CookieOptions {
  // Check if this is an OAuth-related cookie
  const isOAuthCookie = name.startsWith('sb-') && 
    (name.includes('auth') || name.includes('session') || name.includes('token'))

  // For OAuth cookies, we MUST use SameSite=None; Secure
  if (isOAuthCookie) {
    return {
      ...options,
      sameSite: 'none' as const,
      secure: true, // Required for SameSite=None
      httpOnly: true, // Security best practice
      path: '/', // Ensure cookie is available site-wide
      // Increase max age for auth cookies (30 days)
      maxAge: options.maxAge || 60 * 60 * 24 * 30,
    }
  }

  // For non-OAuth cookies, use default or provided options
  return {
    ...options,
    sameSite: (options.sameSite || 'lax') as const,
    secure: options.secure ?? true,
    httpOnly: options.httpOnly ?? true,
    path: options.path || '/',
  }
}

/**
 * Log cookie operations for debugging
 */
export function logCookieOperation(
  operation: 'get' | 'set' | 'remove',
  name: string,
  value?: string,
  options?: CookieOptions
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cookie ${operation}] ${name}`, {
      value: value ? '***' : undefined,
      options,
      timestamp: new Date().toISOString(),
    })
  }
}