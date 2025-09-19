import { createClient } from '@supabase/supabase-js'

// Production OAuth configuration helper
export function getOAuthConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Get the site URL with proper fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 
     isProduction ? 'https://covergen.pro' : 'http://localhost:3001')

  // Cookie options for production vs development
  // For OAuth flows, we need SameSite=None; Secure for Chrome compatibility
  const cookieOptions = {
    domain: isProduction && typeof window !== 'undefined' 
      ? `.${window.location.hostname.replace('www.', '')}` // .covergen.pro
      : undefined, // Let browser handle it in dev
    sameSite: 'none' as const, // Required for cross-site OAuth flows in Chrome
    secure: true, // Always required for SameSite=None
    maxAge: 60 * 60 * 24 * 30, // 30 days
  }

  // Storage options
  const storageOptions = {
    // Use a consistent storage key prefix
    storageKey: 'sb-auth-token',
    // In production, we might want to use httpOnly cookies instead
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }

  // Debug logging in development
  if (isDevelopment && typeof window !== 'undefined') {
    console.log('[OAuth Config]', {
      siteUrl,
      cookieOptions,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
    })
  }

  return {
    siteUrl,
    cookieOptions,
    storageOptions,
    authOptions: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' as const,
      storage: storageOptions.storage,
      storageKey: storageOptions.storageKey,
      // Cookie options for auth
      cookies: {
        ...cookieOptions,
        name: 'sb-auth-token',
      }
    }
  }
}

// Create a properly configured Supabase client for OAuth
export function createOAuthSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const { authOptions } = getOAuthConfig()

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: authOptions
  })
}

// Helper to get redirect URL
export function getOAuthRedirectUrl(next?: string) {
  const { siteUrl } = getOAuthConfig()
  const baseUrl = `${siteUrl}/auth/callback`
  
  if (next) {
    return `${baseUrl}?next=${encodeURIComponent(next)}`
  }
  
  return baseUrl
}

// Helper to validate OAuth state
export async function validateOAuthEnvironment() {
  const errors: string[] = []
  const warnings: string[] = []

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }

  // Check site URL configuration
  if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === 'production') {
    warnings.push('NEXT_PUBLIC_SITE_URL is not set, using fallback')
  }

  // Check HTTPS in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    if (window.location.protocol !== 'https:') {
      warnings.push('OAuth requires HTTPS in production')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}