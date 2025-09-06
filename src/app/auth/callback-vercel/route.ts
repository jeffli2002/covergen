import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Specialized callback handler for Vercel preview deployments
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'

  console.log('[Auth Callback Vercel] Processing OAuth callback:', {
    hasCode: !!code,
    next,
    origin,
    url: request.url,
    headers: {
      host: request.headers.get('host'),
      cookie: request.headers.get('cookie')
    }
  })

  if (code) {
    try {
      const cookieStore = cookies()
      
      // Create a response that we'll use for the redirect
      const redirectUrl = new URL(`${origin}${next}`)
      redirectUrl.searchParams.set('auth_callback', 'success')
      redirectUrl.searchParams.set('vercel_auth', 'true')
      
      const response = NextResponse.redirect(redirectUrl.toString())
      
      // Create Supabase client with Vercel-optimized cookie handling
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              // Vercel preview specific cookie settings
              // CRITICAL: Do NOT set httpOnly for auth cookies on Vercel preview
              // The client needs to read these cookies
              const isAuthCookie = name.includes('auth-token') || name.includes('sb-')
              const cookieOptions = {
                name,
                value,
                ...options,
                httpOnly: !isAuthCookie, // Auth cookies must be readable by client
                secure: true, // Always secure on Vercel
                sameSite: 'lax' as const,
                path: '/',
                // Critical: No domain for Vercel preview URLs
                maxAge: options.maxAge || 60 * 60 * 24 * 7
              }
              
              console.log(`[Auth Callback Vercel] Setting cookie: ${name}`, {
                httpOnly: cookieOptions.httpOnly,
                isAuthCookie
              })
              response.cookies.set(cookieOptions)
            },
            remove(name: string, options: any) {
              const isAuthCookie = name.includes('auth-token') || name.includes('sb-')
              response.cookies.set({
                name,
                value: '',
                maxAge: 0,
                httpOnly: !isAuthCookie,
                secure: true,
                sameSite: 'lax',
                path: '/'
              })
            }
          }
        }
      )
      
      // Exchange code for session with retries
      console.log('[Auth Callback Vercel] Exchanging code for session...')
      let exchangeError = null
      let sessionData = null
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error(`[Auth Callback Vercel] Exchange attempt ${attempt} failed:`, error)
          exchangeError = error
          
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }
        } else {
          sessionData = data
          break
        }
      }
      
      if (exchangeError || !sessionData) {
        console.error('[Auth Callback Vercel] All exchange attempts failed:', exchangeError)
        return NextResponse.redirect(`${origin}/en?error=auth_failed&message=${encodeURIComponent(exchangeError?.message || 'Failed to exchange code')}`)
      }
      
      console.log('[Auth Callback Vercel] Code exchange successful:', {
        user: sessionData.session?.user?.email,
        userId: sessionData.session?.user?.id,
        hasSession: !!sessionData.session
      })
      
      // CRITICAL: Store session data in client-accessible storage
      // This ensures the client can recover the session after redirect
      if (sessionData.session) {
        // Create a session storage cookie that the client can read
        response.cookies.set({
          name: 'sb-session-data',
          value: JSON.stringify({
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            expires_at: sessionData.session.expires_at,
            expires_in: sessionData.session.expires_in,
            token_type: sessionData.session.token_type,
            user: sessionData.session.user
          }),
          httpOnly: false, // Client must be able to read this
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 // Short-lived, just for the redirect
        })
      }
      
      // Add Vercel-specific success markers
      response.cookies.set({
        name: 'auth-callback-success',
        value: 'true',
        maxAge: 120, // 2 minutes
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/'
      })
      
      response.cookies.set({
        name: 'vercel-auth-complete',
        value: Date.now().toString(),
        maxAge: 60, // 1 minute
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/'
      })
      
      return response
    } catch (error: any) {
      console.error('[Auth Callback Vercel] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en?error=auth_failed&details=${encodeURIComponent(String(error))}`)
    }
  }

  // No code in URL
  console.error('[Auth Callback Vercel] No code in URL')
  return NextResponse.redirect(`${origin}/en?error=no_code`)
}