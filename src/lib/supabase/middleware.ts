import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // Ensure proper cookie options for auth cookies
          const cookieOptions = {
            name,
            value,
            ...options,
            httpOnly: options.httpOnly ?? true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: (options.sameSite || 'lax') as 'lax' | 'strict' | 'none',
            path: options.path || '/',
          }
          
          response.cookies.set(cookieOptions)
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // This will refresh the session if expired - required for Server Components
  try {
    await supabase.auth.getUser()
  } catch (error) {
    console.error('[Middleware] Error updating session:', error)
  }

  return response
}