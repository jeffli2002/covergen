import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (browserClient) {
    console.log('[Supabase Singleton] Returning existing client')
    return browserClient
  }

  console.log('[Supabase Singleton] Creating new browser client with cookie storage')
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disable to prevent COOP issues
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
    }
  )

  return browserClient
}