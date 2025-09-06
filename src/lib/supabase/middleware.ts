import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = request.cookies.get(name)
            return cookie?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Ensure cookie options are safe for all environments
            const safeOptions = {
              ...options,
              path: options.path || '/',
              httpOnly: options.httpOnly ?? true,
              // Always use secure cookies for auth on Vercel (even preview)
              secure: options.secure ?? true,
              sameSite: (options.sameSite || 'lax') as 'lax' | 'strict' | 'none',
              // CRITICAL: Never set domain to ensure cookies work on dynamic Vercel URLs
            }
            
            // Log auth cookie operations in development
            if (process.env.NODE_ENV !== 'production' && name.startsWith('sb-')) {
              console.log(`[Middleware Cookie Set] ${name}`, { hasValue: !!value, options: safeOptions })
            }
            
            request.cookies.set({
              name,
              value,
              ...safeOptions,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...safeOptions,
            })
          },
          remove(name: string, options: CookieOptions) {
            const safeOptions = {
              ...options,
              path: options.path || '/',
              maxAge: 0,
            }
            
            request.cookies.set({
              name,
              value: '',
              ...safeOptions,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...safeOptions,
            })
          },
        },
      }
    )

    // This will refresh the session if expired - required for Server Components
    // Wrap in try-catch to prevent middleware failures
    try {
      await supabase.auth.getUser()
    } catch (error) {
      // Log but don't throw - let the request continue
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Middleware] Error refreshing session:', error)
      }
    }
  } catch (error) {
    // Log critical errors but don't block the request
    console.error('[Middleware] Critical error in updateSession:', error)
  }

  return response
}