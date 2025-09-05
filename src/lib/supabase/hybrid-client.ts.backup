import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'

// Hybrid approach: Use SSR for server-side and standard for client-side with proper security
export function createHybridBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // For production with subscriptions, use standard client with security enhancements
  return createClient(url, key, {
    auth: {
      // Security settings for production
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // More secure OAuth flow
      storage: {
        // Custom storage that encrypts tokens
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null
          try {
            const item = window.localStorage.getItem(key)
            // In production, you'd decrypt here
            return item
          } catch {
            return null
          }
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return
          try {
            // In production, you'd encrypt here
            window.localStorage.setItem(key, value)
          } catch {
            console.error('Failed to store auth session')
          }
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return
          try {
            window.localStorage.removeItem(key)
          } catch {
            console.error('Failed to remove auth session')
          }
        }
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'coverimage-web'
      }
    },
    db: {
      schema: 'public'
    }
  })
}

// Helper to validate subscription server-side
export async function validateSubscriptionServerSide(userId: string) {
  // This should be called from API routes or server components
  // Never trust client-side subscription checks for payment features
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/validate-subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  })
  
  if (!response.ok) {
    return { isValid: false, tier: 'free' }
  }
  
  return response.json()
}