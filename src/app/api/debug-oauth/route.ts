import { NextRequest, NextResponse } from 'next/server'
import { getOAuthAuthorizationUrl, generateOAuthState } from '@/lib/bestauth'
import { authConfig } from '@/lib/bestauth/config'

export async function GET(request: NextRequest) {
  const { origin, hostname, protocol, port } = new URL(request.url)
  const state = generateOAuthState()
  const provider = 'google'
  
  // Construct redirect URI the same way as the OAuth route
  const redirectUri = `${origin}/api/auth/callback/${provider}`
  
  // Get the auth URL that would be generated
  const authUrl = getOAuthAuthorizationUrl(provider, state, redirectUri)
  
  // Parse the auth URL to extract parameters
  const authUrlObj = new URL(authUrl)
  const params = Object.fromEntries(authUrlObj.searchParams.entries())
  
  return NextResponse.json({
    debug: {
      requestUrl: request.url,
      origin,
      hostname,
      protocol,
      port: port || (protocol === 'https:' ? '443' : '80'),
      redirectUri,
      googleClientId: authConfig.oauth.google.clientId,
    },
    oauthParams: params,
    authUrl,
    instructions: [
      '1. Check that redirectUri matches EXACTLY what is in Google Cloud Console',
      '2. Common issues: trailing slashes, http vs https, port numbers',
      '3. The redirect_uri parameter in oauthParams must be identical to authorized redirect URI in Google',
    ]
  })
}