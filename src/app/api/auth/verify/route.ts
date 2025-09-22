// BestAuth Verify Magic Link Route
import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicLink } from '@/lib/bestauth'
import { setSessionCookie } from '@/lib/bestauth/cookies'
import { authConfig } from '@/lib/bestauth/config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    
    if (!token) {
      return NextResponse.redirect(`${baseUrl}${authConfig.urls.error}?error=missing_token`)
    }
    
    // Verify magic link
    const result = await verifyMagicLink(token)
    
    if (!result.success) {
      return NextResponse.redirect(
        `${baseUrl}${authConfig.urls.error}?error=${result.code || 'invalid_link'}`
      )
    }
    
    // Create response with redirect to dashboard
    const response = NextResponse.redirect(`${baseUrl}${authConfig.urls.afterSignIn}`)
    
    // Set session cookie
    setSessionCookie(response, result.data!.accessToken)
    
    return response
  } catch (error) {
    console.error('Magic link verification error:', error)
    return NextResponse.redirect(`${baseUrl}${authConfig.urls.error}?error=verification_error`)
  }
}