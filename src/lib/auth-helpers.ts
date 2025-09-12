/**
 * Get the correct redirect URL for OAuth based on environment
 * This handles the case where Supabase might redirect to production URL in dev
 */
export function getOAuthRedirectUrl(next?: string) {
  // Force localhost in development
  if (process.env.NODE_ENV === 'development') {
    const devUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    return `${devUrl}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`
  }
  
  // Use site URL or current origin in production
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'https://covergen.pro')
  
  return `${siteUrl}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`
}

/**
 * Check if we're in a development environment
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
}