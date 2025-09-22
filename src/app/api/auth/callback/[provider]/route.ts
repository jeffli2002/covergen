// BestAuth OAuth Callback Route
import { NextRequest, NextResponse } from 'next/server'
import { handleOAuthCallback } from '@/lib/bestauth'
import { 
  getOAuthStateCookie, 
  deleteOAuthStateCookie,
  setSessionCookie 
} from '@/lib/bestauth/cookies'
import { authConfig } from '@/lib/bestauth/config'

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  console.log('=== OAuth Callback Started ===');
  console.log('Provider:', params.provider);
  console.log('URL:', request.url);
  
  try {
    const provider = params.provider as 'google' | 'github'
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    console.log('Code:', code ? 'Present' : 'Missing');
    console.log('State:', state ? 'Present' : 'Missing');
    console.log('Error:', error || 'None')
    
    // Get base URL for absolute redirects
    const { origin } = new URL(request.url)
    
    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(`${origin}${authConfig.urls.error}?error=${error}`)
    }
    
    if (!code || !state) {
      return NextResponse.redirect(`${origin}${authConfig.urls.error}?error=missing_params`)
    }
    
    // Verify state
    const storedState = getOAuthStateCookie(request)
    console.log('Stored State:', storedState ? 'Present' : 'Missing');
    console.log('State Match:', state === storedState ? 'Yes' : 'No');
    
    if (state !== storedState) {
      console.error('State mismatch - stored:', storedState, 'received:', state);
      return NextResponse.redirect(`${origin}${authConfig.urls.error}?error=invalid_state`)
    }
    
    // Get redirect URI
    const redirectUri = `${origin}/api/auth/callback/${provider}`
    
    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined
    const userAgent = request.headers.get('user-agent') || undefined
    
    console.log('Calling handleOAuthCallback with:');
    console.log('- Provider:', provider);
    console.log('- Redirect URI:', redirectUri);
    console.log('- IP Address:', ipAddress);
    console.log('- User Agent:', userAgent ? userAgent.substring(0, 50) + '...' : 'None');
    
    // Handle OAuth callback
    const result = await handleOAuthCallback(
      provider,
      code,
      redirectUri,
      { ipAddress, userAgent }
    )
    
    console.log('OAuth callback result:', {
      success: result.success,
      error: result.error,
      code: result.code,
      hasData: !!result.data,
      hasAccessToken: !!(result.data?.accessToken)
    })
    
    if (!result.success) {
      console.error('OAuth callback failed:', result.error)
      return NextResponse.redirect(
        `${origin}${authConfig.urls.error}?error=${result.code || 'oauth_failed'}`
      )
    }
    
    if (!result.data?.accessToken) {
      console.error('OAuth callback succeeded but no access token received')
      return NextResponse.redirect(
        `${origin}${authConfig.urls.error}?error=no_access_token`
      )
    }
    
    // Create response with redirect to dashboard
    const response = NextResponse.redirect(`${origin}${authConfig.urls.afterSignIn}`)
    
    console.log('Setting session cookie:', {
      cookieName: authConfig.session.name,
      tokenLength: result.data.accessToken.length,
      redirectTo: `${origin}${authConfig.urls.afterSignIn}`
    })
    
    // Set session cookie
    setSessionCookie(response, result.data.accessToken)
    
    // Log response headers to verify cookie is set
    console.log('Response headers after setting cookie:')
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        console.log(`  ${key}: ${value}`)
      }
    })
    
    // Delete OAuth state cookie
    deleteOAuthStateCookie(response)
    
    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.redirect(`${origin}${authConfig.urls.error}?error=callback_error&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`)
  }
}