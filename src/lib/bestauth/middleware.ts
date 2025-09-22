// BestAuth Middleware
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from './core'
import { getSessionCookie } from './cookies'
import { authConfig } from './config'

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/account',
  '/settings',
  '/api/protected',
]

// Auth routes that should redirect if already authenticated
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup',
]

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  )

  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname.startsWith(route)
  )

  // Get session token
  const sessionToken = getSessionCookie(request)

  if (isProtectedRoute && !sessionToken) {
    // Redirect to sign in
    const signInUrl = new URL(authConfig.urls.signIn, request.url)
    signInUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (sessionToken) {
    // Validate session
    const result = await validateSession(sessionToken)
    
    if (!result.success && isProtectedRoute) {
      // Invalid session, redirect to sign in
      const signInUrl = new URL(authConfig.urls.signIn, request.url)
      signInUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(signInUrl)
    }

    if (result.success && isAuthRoute) {
      // Already authenticated, redirect to dashboard
      return NextResponse.redirect(new URL(authConfig.urls.afterSignIn, request.url))
    }
  }

  return NextResponse.next()
}

// Helper to get user from request in API routes
export async function getUserFromRequest(request: NextRequest) {
  const sessionToken = getSessionCookie(request)
  
  if (!sessionToken) {
    return null
  }

  const result = await validateSession(sessionToken)
  
  return result.success ? result.data : null
}

// API route authentication wrapper
export function withAuth(
  handler: (
    request: NextRequest,
    context: { params: any; user: any }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: any }) => {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler(request, { ...context, user })
  }
}