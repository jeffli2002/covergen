import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'
  const error = searchParams.get('error')

  console.log('[Google OAuth Callback] Processing callback:', {
    hasCode: !!code,
    hasError: !!error,
    next,
    origin
  })

  // Handle OAuth errors (e.g., user cancelled)
  if (error) {
    console.error('[Google OAuth Callback] OAuth error:', error)
    return NextResponse.redirect(
      `${origin}/en/auth-error?reason=oauth_error&error=${encodeURIComponent(error)}&provider=google`
    )
  }

  if (!code) {
    console.error('[Google OAuth Callback] No code in URL')
    return NextResponse.redirect(`${origin}/en/auth-error?reason=no_code&provider=google`)
  }

  try {
    // This runs on the server, but we need to handle it on the client
    // Redirect to a client page that can handle the code exchange
    const clientCallbackUrl = `${origin}/auth/complete/google?code=${code}&next=${encodeURIComponent(next)}`
    return NextResponse.redirect(clientCallbackUrl)
  } catch (error: any) {
    console.error('[Google OAuth Callback] Unexpected error:', error)
    return NextResponse.redirect(
      `${origin}/en/auth-error?reason=callback_error&error=${encodeURIComponent(error.message || 'Unknown error')}&provider=google`
    )
  }
}