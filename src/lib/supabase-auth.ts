import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a simple Supabase client specifically for auth operations
// This avoids any SSR/cookie complexity during OAuth flows
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      // Use a custom storage that works reliably across environments
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null
        try {
          // First try sessionStorage for temporary storage
          const sessionValue = window.sessionStorage.getItem(key)
          if (sessionValue) return sessionValue
          
          // Then try localStorage for persistent storage
          return window.localStorage.getItem(key)
        } catch {
          return null
        }
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return
        try {
          // Store in both for redundancy
          window.localStorage.setItem(key, value)
          window.sessionStorage.setItem(key, value)
          
          // Also set as a cookie for server-side access
          const data = JSON.parse(value)
          if (data?.access_token) {
            const cookieName = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`
            const cookieValue = encodeURIComponent(value)
            const secure = window.location.protocol === 'https:' ? '; Secure' : ''
            document.cookie = `${cookieName}=${cookieValue}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
          }
        } catch (error) {
          console.error('[Supabase Auth] Storage error:', error)
        }
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return
        try {
          window.localStorage.removeItem(key)
          window.sessionStorage.removeItem(key)
          
          // Also remove the cookie
          const cookieName = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`
          document.cookie = `${cookieName}=; Path=/; Max-Age=0`
        } catch {}
      }
    }
  }
})