/**
 * Auth helper utilities for handling OAuth in different environments
 * Based on common patterns from Supabase + Vercel deployments
 */

/**
 * Get the URL for the current deployment
 * Handles localhost, Vercel preview, and production environments
 */
export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this in your env
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    'http://localhost:3000/'
    
  // Make sure to include `https://` when not localhost
  url = url.includes('http') ? url : `https://${url}`
  // Make sure to include trailing `/`
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
  
  return url
}

/**
 * Get the OAuth redirect URL for the current environment
 */
export function getRedirectURL(path: string = '/auth/callback') {
  return `${getURL()}${path.startsWith('/') ? path.slice(1) : path}`
}

/**
 * OAuth configuration for Supabase
 * Use this when calling signInWithOAuth
 */
export function getOAuthConfig(redirectPath?: string) {
  return {
    redirectTo: getRedirectURL(redirectPath),
    options: {
      redirectTo: getRedirectURL(redirectPath),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  }
}