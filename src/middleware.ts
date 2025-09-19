import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getEnhancedCookieOptions, logCookieOperation } from '@/utils/supabase/cookie-config'

// List of paths that should NOT have locale prefixes
const PUBLIC_PATHS = [
  '/auth',
  '/api',
  '/debug',
  '/oauth',
  '/test',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]

// List of paths that require authentication
const PROTECTED_PATHS = [
  '/account',
  '/dashboard',
  '/settings',
]

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // Log all requests for debugging
  console.log('[Middleware] Processing request:', {
    pathname,
    hasCode: searchParams.has('code'),
    hasError: searchParams.has('error'),
    host: request.headers.get('host'),
  })

  // Check if this is a public path that should bypass locale routing
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  
  // Skip middleware OAuth handling - let the callback route handle it
  if (pathname === '/auth/callback' || pathname === '/auth/callback-middleware') {
    console.log('[Middleware] Skipping OAuth callback - handled by route')
    return NextResponse.next()
  }
  
  // Legacy callback handling - redirect to middleware-based callback
  if (searchParams.get('code') && !pathname.includes('/auth/callback')) {
    console.log('[Middleware] Redirecting to middleware-based callback')
    const callbackUrl = new URL('/auth/callback-middleware', request.url)
    searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value)
    })
    
    if (!callbackUrl.searchParams.has('next')) {
      const next = pathname === '/' ? '/en' : pathname
      callbackUrl.searchParams.set('next', next)
    }
    
    return NextResponse.redirect(callbackUrl)
  }

  // Create response that will be modified
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Set up Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Use enhanced cookie options for Chrome compatibility
          const enhancedOptions = getEnhancedCookieOptions(name, options)
          
          // Log cookie operation for debugging
          logCookieOperation('set', name, value, enhancedOptions)
          
          // Set cookie on both request and response
          request.cookies.set({
            name,
            value,
            ...enhancedOptions,
          })
          response.cookies.set({
            name,
            value,
            ...enhancedOptions,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from both request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
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

  // Always refresh the user session
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.log('[Middleware] Auth error:', error.message)
  } else if (user) {
    console.log('[Middleware] User authenticated:', user.email)
  }

  // Handle locale routing (but skip for public paths)
  if (!isPublicPath && !pathname.startsWith('/en')) {
    // Special handling for specific test pages
    if (pathname === '/oauth-test-complete' || pathname === '/auth-debug') {
      console.log('[Middleware] Allowing test page without locale:', pathname)
      return response
    }
    
    // Only redirect to /en if we're on the root path
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/en', request.url))
    }
  }

  // Check protected routes
  if (PROTECTED_PATHS.some(path => pathname.includes(path))) {
    if (!user) {
      console.log('[Middleware] Redirecting to login - protected route')
      const redirectUrl = new URL('/en', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}