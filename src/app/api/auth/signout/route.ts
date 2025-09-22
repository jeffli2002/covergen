// BestAuth Sign Out API Route
import { NextRequest, NextResponse } from 'next/server'
import { deleteSessionCookie } from '@/lib/bestauth/cookies'
import { signOut } from '@/lib/bestauth'
import { verifyJWT } from '@/lib/bestauth/core'

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('bestauth.session')?.value
    
    if (sessionToken) {
      try {
        // Get session ID from token
        const payload = verifyJWT(sessionToken)
        
        // Invalidate session in database
        await signOut(payload.sessionId)
      } catch (error) {
        // Session might be invalid, but we still want to clear the cookie
        console.error('Error invalidating session:', error)
      }
    }
    
    // Create response
    const response = NextResponse.json({ success: true })
    
    // Delete session cookie
    deleteSessionCookie(response)
    
    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}