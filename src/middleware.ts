import { NextRequest, NextResponse } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { updateSession } from '@/lib/supabase/middleware'

const locales = ['en']
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  // Check if locale is already in the URL
  const pathname = request.nextUrl.pathname
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameLocale) return pathnameLocale

  // Check for locale cookie
  const cookieLocale = request.cookies.get('locale')?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  // Negotiate locale from Accept-Language header
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales)

  try {
    return matchLocale(languages, locales, defaultLocale)
  } catch {
    return defaultLocale
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams
  
  // Skip OAuth code handling - let the OAuth provider redirect directly to /auth/callback
  
  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Skip middleware for specific paths
  const shouldSkip = [
    '/api',
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/ads.txt',
    '/images',
    '/fonts',
    '/test',
    '/auth/callback', // Skip middleware for auth callback
    '/auth/callback-handler', // Skip middleware for client-side callback handler
    '/auth/callback-pkce', // Skip middleware for PKCE callback
    '/auth', // Skip all auth routes
    '/oauth-debug',
    '/oauth-safe-debug',
    '/oauth-test-simple',
    '/oauth-dashboard',
    '/simple-test',
    '/test-env',
    '/test-modular-oauth',
    '/test-oauth-fix',
    '/auth-session-debug',
    '/auth-state-test',
    '/debug-vercel-auth',
    '/vercel-auth-test',
    '.html',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.webp',
    '.ico',
    '.woff',
    '.woff2'
  ].some(path => pathname.includes(path))

  if (shouldSkip) {
    return NextResponse.next()
  }
  
  // Skip Supabase session update for auth routes to avoid interference
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Update Supabase session
  const supabaseResponse = await updateSession(request)

  // Redirect if pathname is missing locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    
    // Preserve query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      newUrl.searchParams.append(key, value)
    })

    const response = NextResponse.redirect(newUrl)
    response.cookies.set('locale', locale, { 
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax'
    })
    return response
  }

  // Extract locale from pathname
  const locale = pathname.split('/')[1]
  
  // Set locale cookie if different
  const currentLocaleCookie = request.cookies.get('locale')?.value
  
  if (currentLocaleCookie !== locale) {
    supabaseResponse.cookies.set('locale', locale, { 
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax'
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals, static files, and auth routes
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|auth/).*)',
  ],
}