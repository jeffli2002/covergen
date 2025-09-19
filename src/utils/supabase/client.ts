import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disable to prevent COOP issues with popup handling
        flowType: 'pkce', // Explicitly set PKCE flow for OAuth
        debug: false, // Set to true for debugging auth flow
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') {
              return null
            }
            return window.localStorage.getItem(key)
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') {
              return
            }
            window.localStorage.setItem(key, value)
          },
          removeItem: (key) => {
            if (typeof window === 'undefined') {
              return
            }
            window.localStorage.removeItem(key)
          },
        }
      },
      cookies: {
        get(name: string) {
          if (typeof window === 'undefined') {
            return undefined
          }
          const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1]
          // Decode the cookie value if it exists
          return value ? decodeURIComponent(value) : undefined
        },
        set(name: string, value: string, options?: any) {
          if (typeof window === 'undefined') {
            return
          }
          // Encode the cookie value
          let cookieString = `${name}=${encodeURIComponent(value)}`
          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`
          }
          if (options?.path) {
            cookieString += `; path=${options.path}`
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`
          }
          // For OAuth flows, we need SameSite=None; Secure for Chrome compatibility
          const isOAuthFlow = name.startsWith('sb-') && (name.includes('auth') || name.includes('session'))
          const sameSiteValue = isOAuthFlow ? 'None' : (options?.sameSite || 'lax')
          cookieString += `; samesite=${sameSiteValue}`
          
          // Always set Secure for SameSite=None cookies (required by Chrome)
          if (sameSiteValue === 'None' || options?.secure) {
            cookieString += `; secure`
          }
          document.cookie = cookieString
        },
        remove(name: string, options?: any) {
          if (typeof window === 'undefined') {
            return
          }
          document.cookie = `${name}=; max-age=0; path=${options?.path || '/'}`
        },
      },
    }
  )
}