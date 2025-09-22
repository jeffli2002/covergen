import { type NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/bestauth/edge-middleware'

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
  '/ads.txt',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if this is a public path that should bypass locale routing
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  
  // Apply auth middleware
  const authResponse = await authMiddleware(request)
  
  // If auth middleware returned a redirect, use it
  if (authResponse.status === 302 || authResponse.status === 307) {
    return authResponse
  }
  
  // Handle locale routing (but skip for public paths)
  if (!isPublicPath && !pathname.startsWith('/en')) {
    // Special handling for specific test pages
    if (pathname === '/oauth-test-complete' || pathname === '/auth-debug') {
      console.log('[Middleware] Allowing test page without locale:', pathname)
      return authResponse
    }
    
    // Only redirect to /en if we're on the root path
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/en', request.url))
    }
  }

  return authResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - ads.txt, robots.txt, sitemap.xml (SEO files)
     */
    '/((?!_next/static|_next/image|favicon.ico|ads.txt|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}