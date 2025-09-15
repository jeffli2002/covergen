import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Direct Supabase client for OAuth callback
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

export async function GET(request: NextRequest) {
  console.log('[OAuth Callback V2] Starting callback handler')
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Log all parameters for debugging
  console.log('[OAuth Callback V2] Parameters:', {
    code: code ? 'present' : 'missing',
    next,
    error,
    errorDescription,
    origin: requestUrl.origin,
    href: requestUrl.href
  })

  // Handle OAuth errors
  if (error) {
    console.error('[OAuth Callback V2] OAuth error:', { error, errorDescription })
    return NextResponse.redirect(
      new URL(`/en?auth_error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    )
  }

  if (!code) {
    console.error('[OAuth Callback V2] No code provided')
    return NextResponse.redirect(
      new URL('/en?auth_error=no_code', requestUrl.origin)
    )
  }

  try {
    // Exchange code for session
    console.log('[OAuth Callback V2] Exchanging code for session')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[OAuth Callback V2] Exchange error:', exchangeError)
      throw exchangeError
    }

    if (!data?.session) {
      console.error('[OAuth Callback V2] No session returned')
      throw new Error('No session returned from code exchange')
    }

    console.log('[OAuth Callback V2] Session created successfully:', {
      userId: data.session.user.id,
      email: data.session.user.email
    })

    // Create response with redirect
    const response = NextResponse.redirect(new URL(next, requestUrl.origin))

    // Manually set auth cookies for production
    const isProd = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      ...(isProd && { domain: `.${new URL(requestUrl.origin).hostname.replace('www.', '')}` })
    }

    // Set the session cookies
    if (data.session.access_token) {
      response.cookies.set('sb-access-token', data.session.access_token, cookieOptions)
    }
    
    if (data.session.refresh_token) {
      response.cookies.set('sb-refresh-token', data.session.refresh_token, cookieOptions)
    }

    // Set a custom session indicator
    response.cookies.set('sb-auth-token', JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user_id: data.session.user.id
    }), cookieOptions)

    console.log('[OAuth Callback V2] Cookies set, redirecting to:', next)
    return response

  } catch (error) {
    console.error('[OAuth Callback V2] Callback error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      new URL(`/en?auth_error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }
}