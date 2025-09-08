import { NextResponse } from 'next/server'

// Vercel-specific callback handler that works the same as the main callback
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('[Auth Callback Vercel] Processing OAuth callback:', {
    hasCode: !!code,
    hasError: !!error,
    error,
    errorDescription,
    next,
    origin,
    url: request.url,
  })

  // Handle OAuth error from provider
  if (error) {
    console.error('[Auth Callback Vercel] OAuth provider error:', { error, errorDescription })
    const redirectUrl = new URL(`${origin}${next}`)
    redirectUrl.searchParams.set('error', 'oauth_failed')
    redirectUrl.searchParams.set('message', errorDescription || error)
    return NextResponse.redirect(redirectUrl.toString())
  }

  if (code) {
    // PKCE flow: Redirect back to the original page with the code
    // The OAuthCodeHandler component will handle the code exchange
    const redirectUrl = new URL(`${origin}${next}`)
    redirectUrl.searchParams.set('code', code)
    
    console.log('[Auth Callback Vercel] Redirecting with code for client-side exchange:', redirectUrl.toString())
    
    return NextResponse.redirect(redirectUrl.toString())
  }

  // No code in URL
  console.error('[Auth Callback Vercel] No code in URL')
  return NextResponse.redirect(`${origin}/en?error=no_code`)
}