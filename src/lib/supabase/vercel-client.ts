import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client optimized for Vercel preview deployments
 * Handles dynamic URLs and cookie persistence issues
 */
export function createVercelOptimizedClient() {
  const isVercelPreview = typeof window !== 'undefined' && 
                         window.location.hostname.includes('vercel.app')
  
  console.log('[Vercel Client] Creating client:', {
    isVercelPreview,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    cookies: typeof document !== 'undefined' ? document.cookie : 'server-side'
  })
  
  // Session recovery is now handled by SessionRecovery component and VercelSessionBridge
  // This prevents duplicate processing and race conditions
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined
          
          // More robust cookie parsing
          const cookies = document.cookie.split('; ')
          for (const cookie of cookies) {
            const [cookieName, ...valueParts] = cookie.split('=')
            if (cookieName === name) {
              const value = valueParts.join('=') // Handle values with = signs
              console.log(`[Vercel Client] Cookie get ${name}:`, value ? 'found' : 'not found')
              return decodeURIComponent(value)
            }
          }
          
          if (isVercelPreview) {
            console.log(`[Vercel Client] Cookie ${name} not found. All cookies:`, document.cookie)
          }
          
          return undefined
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') return
          
          // Build cookie string with Vercel-optimized settings
          let cookieString = `${name}=${encodeURIComponent(value)}`
          
          // Path is always root
          cookieString += '; Path=/'
          
          // Secure for all HTTPS (including Vercel preview)
          if (window.location.protocol === 'https:') {
            cookieString += '; Secure'
          }
          
          // SameSite
          cookieString += `; SameSite=${options?.sameSite || 'lax'}`
          
          // Max age
          if (options?.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`
          } else if (options?.expires) {
            cookieString += `; Expires=${options.expires.toUTCString()}`
          }
          
          // CRITICAL: Never set domain for Vercel preview URLs
          // This allows cookies to work on dynamic preview URLs
          
          console.log(`[Vercel Client] Setting cookie ${name}:`, {
            value: value ? 'has value' : 'empty',
            secure: window.location.protocol === 'https:',
            cookieString
          })
          
          document.cookie = cookieString
          
          // Verify cookie was set
          setTimeout(() => {
            const verifyValue = document.cookie.includes(`${name}=`)
            console.log(`[Vercel Client] Cookie ${name} verification:`, verifyValue ? 'set' : 'failed')
          }, 100)
        },
        remove(name: string, options?: any) {
          if (typeof document === 'undefined') return
          
          // Remove by setting expired date
          let cookieString = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT`
          
          if (window.location.protocol === 'https:') {
            cookieString += '; Secure'
          }
          
          cookieString += `; SameSite=${options?.sameSite || 'lax'}`
          
          console.log(`[Vercel Client] Removing cookie ${name}`)
          document.cookie = cookieString
        }
      },
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        // Use the correct storage key format that matches Supabase's internal format
        storageKey: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`,
        // Aggressive session recovery for Vercel
        flowType: 'pkce',
        debug: isVercelPreview, // Enable debug mode on Vercel preview
        // Custom storage implementation for better control
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null
            try {
              const value = localStorage.getItem(key)
              if (value && isVercelPreview) {
                console.log(`[Vercel Client Storage] Retrieved ${key}:`, value ? 'has value' : 'empty')
              }
              return value
            } catch (error) {
              console.error('[Vercel Client Storage] Error getting item:', error)
              return null
            }
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.setItem(key, value)
              if (isVercelPreview) {
                console.log(`[Vercel Client Storage] Stored ${key}`)
              }
            } catch (error) {
              console.error('[Vercel Client Storage] Error setting item:', error)
            }
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.removeItem(key)
              if (isVercelPreview) {
                console.log(`[Vercel Client Storage] Removed ${key}`)
              }
            } catch (error) {
              console.error('[Vercel Client Storage] Error removing item:', error)
            }
          }
        }
      }
    }
  )
}