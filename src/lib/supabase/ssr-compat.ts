import { supabase } from '@/lib/supabase-simple'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * SSR compatibility layer for modules expecting @supabase/ssr API
 * This wraps the unified client to provide the same interface
 */

interface CookieOptions {
  name: string
  value: string
  options?: {
    domain?: string
    path?: string
    sameSite?: string
    secure?: boolean
    httpOnly?: boolean
    maxAge?: number
  }
}

interface CookieMethods {
  get?: (name: string) => string | undefined
  set?: (name: string, value: string, options?: CookieOptions['options']) => void
  remove?: (name: string, options?: CookieOptions['options']) => void
  getAll?: () => { name: string; value: string }[]
  setAll?: (cookies: CookieOptions[]) => void
}

export function createBrowserClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: {
    cookies?: CookieMethods
    cookieOptions?: CookieOptions['options']
    [key: string]: any
  }
): SupabaseClient {
  // Return the singleton instance from supabase-simple
  // This ensures we always use the same GoTrueClient
  console.log('[SSR Compat] Returning singleton client instead of creating new SSR client')
  return supabase
}

// For server-side, we should still use the proper server client
// This is just a re-export for consistency
export { createClient as createServerClient } from '@/lib/supabase/server'