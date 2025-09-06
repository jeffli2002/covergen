/**
 * Get the URL for the current environment
 * Handles local development, Vercel preview deployments, and production
 */
export function getURL() {
  let url = 
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/' // Default to localhost
    
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}

/**
 * Get the current URL from the window object (client-side only)
 */
export function getWindowURL() {
  if (typeof window === 'undefined') {
    return getURL()
  }
  
  const url = window.location.origin + '/'
  return url
}