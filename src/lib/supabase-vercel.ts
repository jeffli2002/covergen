import { createBrowserClient } from '@supabase/ssr'

// Check if running on Vercel preview
export function isVercelPreview() {
  return typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
}

// Create a Vercel-optimized Supabase client
export function createVercelClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Custom cookie handling for Vercel preview deployments
        get(name: string) {
          if (typeof document === 'undefined') return null
          
          const cookies = document.cookie.split('; ')
          const cookie = cookies.find(c => c.startsWith(`${name}=`))
          
          if (cookie) {
            const value = cookie.split('=')[1]
            console.log(`[Vercel Client] Cookie get: ${name} = ${value ? 'exists' : 'missing'}`)
            return decodeURIComponent(value)
          }
          
          return null
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') return
          
          const isVercel = isVercelPreview()
          const cookieParts = [`${name}=${encodeURIComponent(value)}`]
          
          if (options?.maxAge) {
            cookieParts.push(`max-age=${options.maxAge}`)
          }
          
          cookieParts.push('path=/')
          cookieParts.push('samesite=lax')
          
          // Always use secure cookies on Vercel
          if (isVercel || window.location.protocol === 'https:') {
            cookieParts.push('secure')
          }
          
          const cookieString = cookieParts.join('; ')
          document.cookie = cookieString
          
          console.log(`[Vercel Client] Cookie set: ${name}`, { 
            isVercel, 
            secure: cookieString.includes('secure')
          })
        },
        remove(name: string) {
          if (typeof document === 'undefined') return
          
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          console.log(`[Vercel Client] Cookie removed: ${name}`)
        }
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Use custom storage for Vercel preview deployments
        storage: isVercelPreview() ? {
          getItem: (key: string) => {
            const value = localStorage.getItem(key)
            if (value && key.includes('auth-token')) {
              console.log(`[Vercel Storage] Retrieved ${key}`)
            }
            return value
          },
          setItem: (key: string, value: string) => {
            localStorage.setItem(key, value)
            if (key.includes('auth-token')) {
              console.log(`[Vercel Storage] Stored ${key}`)
            }
          },
          removeItem: (key: string) => {
            localStorage.removeItem(key)
            if (key.includes('auth-token')) {
              console.log(`[Vercel Storage] Removed ${key}`)
            }
          }
        } : undefined
      }
    }
  )
}