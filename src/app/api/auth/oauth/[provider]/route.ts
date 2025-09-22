// BestAuth OAuth Provider Route
import { NextRequest, NextResponse } from 'next/server'
import { getOAuthAuthorizationUrl, generateOAuthState } from '@/lib/bestauth'
import { setOAuthStateCookie } from '@/lib/bestauth/cookies'

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider as 'google' | 'github'
    
    if (!['google', 'github'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }
    
    // Generate state for CSRF protection
    const state = generateOAuthState()
    
    // Get redirect URI - use the BestAuth callback route
    const { origin } = new URL(request.url)
    const redirectUri = `${origin}/api/auth/callback/${provider}`
    
    // Get authorization URL
    const authUrl = getOAuthAuthorizationUrl(provider, state, redirectUri)
    
    // Create response with redirect
    const response = NextResponse.redirect(authUrl)
    
    // Set state cookie
    setOAuthStateCookie(response, state)
    
    return response
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect('/auth/error?error=oauth_error')
  }
}