// BestAuth Edge-Compatible Middleware
import { NextRequest, NextResponse } from 'next/server'

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/api/generation',
  '/api/payment',
  '/api/user',
  '/dashboard',
  '/account',
  '/payment',
]

// Auth routes that should skip for authenticated users
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup',
]

export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  
  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))
  
  // Get session token from cookie
  const sessionToken = request.cookies.get('bestauth-session')?.value
  
  if (isProtectedRoute && !sessionToken) {
    // Redirect to signin if accessing protected route without session
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  if (isAuthRoute && sessionToken) {
    // Redirect to dashboard if accessing auth routes while authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}