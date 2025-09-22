// BestAuth Session Check API Route
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/bestauth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Session API] Starting session check')
    
    // Check for session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('bestauth.session')
    
    console.log('[Session API] Session cookie:', {
      exists: !!sessionCookie,
      hasValue: !!sessionCookie?.value,
      valueType: typeof sessionCookie?.value,
      cookieCount: cookieStore.getAll().length,
      allCookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    })
    
    if (!sessionCookie?.value) {
      console.log('[Session API] No session cookie found')
      return NextResponse.json({
        authenticated: false,
        user: null,
        session: null
      })
    }
    
    // Session cookie contains JWT token directly, not JSON
    const token = sessionCookie.value
    console.log('[Session API] Found token:', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...'
    })
    
    // Validate the JWT token with BestAuth
    const validation = await validateSession(token)
    
    console.log('[Session API] Token validation:', {
      success: validation.success,
      hasUser: !!validation.data,
      error: validation.error
    })
    
    if (validation.success && validation.data) {
      // JWT tokens contain expiry information internally
      // We don't store expires_at separately in cookies
      return NextResponse.json({
        authenticated: true,
        user: validation.data,
        session: {
          token: token,
          expires_at: null // JWT handles expiry internally
        }
      })
    }
    
    console.log('[Session API] Session validation failed:', validation.error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      session: null
    })
  } catch (error) {
    console.error('[Session API] Session check error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      session: null,
      error: 'Session check failed'
    }, { status: 500 })
  }
}