import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Authentication features will be disabled.')
}

// Create a singleton browser client with proper cookie handling
let browserClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Return a dummy client for SSR
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // We handle OAuth callbacks server-side via /auth/callback route
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development' // Enable debug logs in dev
    },
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') {
          return undefined
        }
        const cookies = document.cookie.split(';')
        for (const cookie of cookies) {
          const [cookieName, ...cookieValueParts] = cookie.trim().split('=')
          if (cookieName === name) {
            const value = cookieValueParts.join('=') // Handle values with = in them
            try {
              return decodeURIComponent(value)
            } catch {
              return value // Return raw value if decoding fails
            }
          }
        }
        return undefined
      },
      set(name: string, value: string, options?: any) {
        if (typeof document === 'undefined') {
          return
        }
        
        // Build cookie string with all necessary options
        const cookieParts = [`${name}=${encodeURIComponent(value)}`]
        
        if (options?.maxAge) {
          cookieParts.push(`Max-Age=${options.maxAge}`)
        } else if (options?.expires) {
          cookieParts.push(`Expires=${new Date(options.expires).toUTCString()}`)
        }
        
        cookieParts.push(`Path=${options?.path || '/'}`)
        
        if (options?.domain) {
          cookieParts.push(`Domain=${options.domain}`)
        }
        
        cookieParts.push(`SameSite=${options?.sameSite || 'Lax'}`)
        
        if (window.location.protocol === 'https:' || options?.secure) {
          cookieParts.push('Secure')
        }
        
        if (options?.httpOnly) {
          // Note: httpOnly cannot be set from JavaScript, but we include for completeness
          console.warn(`[Supabase] Cannot set httpOnly cookie from browser: ${name}`)
        }
        
        document.cookie = cookieParts.join('; ')
        
        // Log cookie operations in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Supabase] Set cookie: ${name} (length: ${value?.length || 0})`)
        }
      },
      remove(name: string, options?: any) {
        if (typeof document === 'undefined') {
          return
        }
        const cookieParts = [`${name}=`]
        cookieParts.push('Max-Age=0')
        cookieParts.push(`Path=${options?.path || '/'}`)
        
        if (options?.domain) {
          cookieParts.push(`Domain=${options.domain}`)
        }
        
        document.cookie = cookieParts.join('; ')
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Supabase] Removed cookie: ${name}`)
        }
      }
    }
  })

  return browserClient
}

export const supabase = getSupabaseClient()