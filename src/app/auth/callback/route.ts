import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('[Auth Callback] Processing OAuth callback:', {
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
    console.error('[Auth Callback] OAuth provider error:', { error, errorDescription })
    const redirectUrl = new URL(`${origin}${next}`)
    redirectUrl.searchParams.set('error', 'oauth_failed')
    redirectUrl.searchParams.set('message', errorDescription || error)
    return NextResponse.redirect(redirectUrl.toString())
  }

  if (code) {
    // Create a Supabase client for server-side operations
    const supabase = createClient()
    
    console.log('[Auth Callback] Exchanging code for session server-side...')
    
    // Exchange the code for a session using PKCE flow
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('[Auth Callback] Failed to exchange code:', exchangeError)
      const redirectUrl = new URL(`${origin}${next}`)
      redirectUrl.searchParams.set('error', 'exchange_failed')
      redirectUrl.searchParams.set('message', exchangeError.message)
      return NextResponse.redirect(redirectUrl.toString())
    }
    
    if (data?.session) {
      console.log('[Auth Callback] Session established successfully:', {
        user: data.session.user.email,
        provider: data.session.user.app_metadata?.provider,
        userId: data.session.user.id
      })
      
      // Create response with redirect
      const redirectUrl = new URL(`${origin}${next}`)
      redirectUrl.searchParams.set('auth_callback', 'success')
      
      const response = NextResponse.redirect(redirectUrl.toString())
      
      // Set a marker cookie for debugging
      response.cookies.set('auth-callback-success', 'true', {
        path: '/',
        maxAge: 10, // expires in 10 seconds
        httpOnly: false,
        sameSite: 'lax'
      })
      
      return response
    }
  }

  // No code in URL
  console.error('[Auth Callback] No code in URL')
  return NextResponse.redirect(`${origin}/en?error=no_code`)
}