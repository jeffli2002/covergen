import { createBrowserClient } from '@supabase/ssr'

// Singleton instance to ensure consistent session state
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!browserClient) {
    // Extract project reference from URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || ''
    
    browserClient = createBrowserClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            if (typeof window === 'undefined') return undefined
            
            // Try the standard cookie name first
            const cookies = document.cookie.split('; ')
            let value = cookies.find(row => row.startsWith(`${name}=`))?.split('=')[1]
            
            // If not found and we're looking for the new format, try the old format
            if (!value && name.startsWith(`sb-${projectRef}-auth-token`)) {
              const suffix = name.split('auth-token')[1] // Get .0, .1, etc.
              const oldName = `supabase.auth.token${suffix}`
              value = cookies.find(row => row.startsWith(`${oldName}=`))?.split('=')[1]
              
              if (!value && suffix === '') {
                // Also try without suffix for main token
                value = cookies.find(row => row.startsWith('sb-exungkcoaihcemcmhqdr-auth-token.0='))?.split('=')[1]
              }
            }
            
            return value
          },
          set(name: string, value: string, options: any) {
            if (typeof window === 'undefined') return
            document.cookie = `${name}=${value}; path=/; ${options?.httpOnly ? 'HttpOnly;' : ''} ${options?.secure ? 'Secure;' : ''} SameSite=${options?.sameSite || 'Lax'}${options?.maxAge ? `; Max-Age=${options.maxAge}` : ''}`
          },
          remove(name: string, options: any) {
            if (typeof window === 'undefined') return
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
        }
      }
    )
  }
  return browserClient
}