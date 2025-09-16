import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if this is an OAuth callback that went to the wrong URL
  const { searchParams, pathname } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Log OAuth callbacks for debugging
  if (code || error) {
    console.log('[Middleware] OAuth callback detected:', {
      pathname,
      hasCode: !!code,
      hasError: !!error,
      errorDescription,
      userAgent: request.headers.get('user-agent')?.includes('Chrome') ? 'Chrome' : 'Other'
    })
  }
  
  // If we detect an OAuth code but we're not on the callback route, redirect
  if (code && !pathname.includes('/auth/callback')) {
    console.log('[Middleware] OAuth code detected on wrong route, redirecting to callback')
    
    // Preserve the intended next path from the original OAuth request
    const nextPath = pathname === '/' ? '/en' : pathname
    
    const callbackUrl = new URL('/auth/callback', request.url)
    // Copy all search params
    searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value)
    })
    
    // Add or update the next parameter to preserve the intended destination
    if (!callbackUrl.searchParams.has('next')) {
      callbackUrl.searchParams.set('next', nextPath)
    }
    
    return NextResponse.redirect(callbackUrl)
  }

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
          response.cookies.set({
            name,
            value,
            ...options,
          })
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

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (image files)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}