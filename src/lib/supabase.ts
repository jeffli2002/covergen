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
      detectSessionInUrl: true, // Enable to handle OAuth callbacks
      flowType: 'pkce'
    },
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') {
          return undefined
        }
        const cookies = document.cookie.split(';')
        const cookie = cookies.find(c => c.trim().startsWith(`${name}=`))
        if (cookie) {
          return decodeURIComponent(cookie.split('=')[1])
        }
        return undefined
      },
      set(name: string, value: string, options?: any) {
        if (typeof document === 'undefined') {
          return
        }
        let cookieStr = `${name}=${encodeURIComponent(value)}`
        if (options?.maxAge) {
          cookieStr += `; Max-Age=${options.maxAge}`
        }
        if (options?.path) {
          cookieStr += `; Path=${options.path}`
        }
        cookieStr += '; SameSite=Lax'
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          cookieStr += '; Secure'
        }
        document.cookie = cookieStr
      },
      remove(name: string, options?: any) {
        if (typeof document === 'undefined') {
          return
        }
        let cookieStr = `${name}=; Max-Age=0`
        if (options?.path) {
          cookieStr += `; Path=${options.path}`
        }
        document.cookie = cookieStr
      }
    }
  })

  return browserClient
}

export const supabase = getSupabaseClient()