import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'

  console.log('[Auth Callback] OAuth redirect handler:', {
    hasCode: !!code,
    next,
    origin: requestUrl.origin
  })

  // For PKCE flow, we must redirect to a client-side page that can access
  // the code_verifier from localStorage to complete the exchange
  if (code) {
    // Redirect to the PKCE callback page with all parameters
    const params = new URLSearchParams({
      code,
      next
    })
    
    // Copy any other OAuth parameters
    const state = requestUrl.searchParams.get('state')
    if (state) params.append('state', state)
    
    console.log('[Auth Callback] Redirecting to PKCE handler')
    return NextResponse.redirect(`${requestUrl.origin}/auth/callback-pkce?${params.toString()}`)
  }

  // No code present, redirect with error
  console.error('[Auth Callback] No OAuth code received')
  return NextResponse.redirect(`${requestUrl.origin}${next}?error=no_code`)
}