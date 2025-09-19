import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Apply SameSite=None for OAuth-related cookies
              const isOAuthCookie = name.startsWith('sb-') && (name.includes('auth') || name.includes('session'))
              const enhancedOptions: CookieOptions = {
                ...options,
                sameSite: isOAuthCookie ? 'none' : (options?.sameSite || 'lax'),
                secure: isOAuthCookie ? true : (options?.secure ?? true)
              }
              cookieStore.set({ name, value, ...enhancedOptions })
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}