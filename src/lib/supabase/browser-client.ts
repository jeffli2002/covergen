import { createClient } from '@supabase/supabase-js'

// Production-ready browser client with security considerations
let browserClient: ReturnType<typeof createClient> | null = null

export function createBrowserClient() {
  if (!browserClient) {
    // For production with subscriptions, we need a balance of security and reliability
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          // Essential security settings
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce', // PKCE is more secure for OAuth
          
          // Use default storage (localStorage) but with security considerations
          // In production, consider implementing encrypted storage
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          
          // Cookie options for better security (when cookies are used)
          cookieOptions: {
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax', // CSRF protection
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: false // Must be false for browser client
          }
        },
        
        // Additional security headers
        global: {
          headers: {
            'X-Client-Info': 'coverimage-web',
          }
        }
      }
    )
  }
  return browserClient
}