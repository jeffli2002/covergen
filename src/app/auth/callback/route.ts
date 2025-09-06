import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'

  console.log('[Auth Callback] Processing OAuth callback:', {
    hasCode: !!code,
    next,
    origin,
    url: request.url,
    headers: {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer')
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    }
  })

  if (code) {
    try {
      const cookieStore = cookies()
      
      // Log existing cookies before processing
      console.log('[Auth Callback] Existing cookies:', cookieStore.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })))
      
      // Create a response that we'll use for the redirect
      // Add auth_callback=success to trigger SessionRecovery
      const redirectUrl = new URL(`${origin}${next}`)
      redirectUrl.searchParams.set('auth_callback', 'success')
      
      // Detect Vercel preview environment and add marker
      const isVercelPreview = request.headers.get('host')?.includes('vercel.app') || 
                             process.env.VERCEL_ENV === 'preview'
      if (isVercelPreview) {
        redirectUrl.searchParams.set('vercel_auth', 'true')
      }
      
      console.log('[Auth Callback] Will redirect to:', redirectUrl.toString())
      
      const response = NextResponse.redirect(redirectUrl.toString())
      
      // Create Supabase client with proper cookie handling
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              const value = cookieStore.get(name)?.value
              console.log(`[Auth Callback] Cookie get: ${name} = ${value ? 'exists' : 'missing'}`)
              return value
            },
            set(name: string, value: string, options: any) {
              // Detect Vercel preview environment
              const isVercelPreview = request.headers.get('host')?.includes('vercel.app') || 
                                     process.env.VERCEL_ENV === 'preview'
              
              // CRITICAL: Do NOT set httpOnly for auth cookies on Vercel preview
              // The client needs to read these cookies for session recovery
              const isAuthCookie = name.includes('auth-token') || name.includes('sb-')
              
              // Set cookie on the response
              const cookieOptions = {
                name,
                value,
                ...options,
                httpOnly: isVercelPreview && isAuthCookie ? false : true, // Auth cookies must be readable on Vercel
                secure: process.env.NODE_ENV === 'production' || isVercelPreview,
                sameSite: 'lax' as const,
                path: '/',
                // Important: Don't set domain for preview deployments
                // This allows the cookie to work on dynamic Vercel URLs
                maxAge: options.maxAge || 60 * 60 * 24 * 7 // Default 7 days
              }
              
              console.log(`[Auth Callback] Cookie set: ${name}`, {
                httpOnly: cookieOptions.httpOnly,
                secure: cookieOptions.secure,
                sameSite: cookieOptions.sameSite,
                path: cookieOptions.path,
                maxAge: cookieOptions.maxAge,
                isVercelPreview,
                host: request.headers.get('host')
              })
              
              response.cookies.set(cookieOptions)
            },
            remove(name: string, options: any) {
              const isVercelPreview = request.headers.get('host')?.includes('vercel.app') || 
                                     process.env.VERCEL_ENV === 'preview'
              console.log(`[Auth Callback] Cookie remove: ${name}`)
              response.cookies.set({
                name,
                value: '',
                ...options,
                maxAge: 0,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' || isVercelPreview,
                sameSite: 'lax',
                path: '/'
              })
            }
          }
        }
      )
      
      // Exchange code for session
      console.log('[Auth Callback] Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Code exchange error:', {
          error: error,
          message: error.message,
          status: error.status,
          code: error.code
        })
        return NextResponse.redirect(`${origin}/en?error=auth_failed&message=${encodeURIComponent(error.message)}`)
      }
      
      console.log('[Auth Callback] Code exchange successful:', {
        user: data?.session?.user?.email,
        userId: data?.session?.user?.id,
        hasSession: !!data?.session,
        hasAccessToken: !!data?.session?.access_token,
        hasRefreshToken: !!data?.session?.refresh_token,
        expiresAt: data?.session?.expires_at,
        cookiesSetOnResponse: response.cookies.getAll().map(c => ({ name: c.name, httpOnly: c.httpOnly, secure: c.secure }))
      })
      
      // Add session data cookie for Vercel preview deployments
      if (isVercelPreview && data?.session) {
        // Create a session storage cookie that the client can read
        response.cookies.set({
          name: 'sb-session-data',
          value: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            expires_in: data.session.expires_in,
            token_type: data.session.token_type,
            user: data.session.user
          }),
          httpOnly: false, // Client must be able to read this
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 // Short-lived, just for the redirect
        })
      }
      
      // Add a marker cookie to signal successful OAuth callback
      response.cookies.set({
        name: 'auth-callback-success',
        value: 'true',
        maxAge: 60, // Expires in 1 minute
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production' || isVercelPreview,
        sameSite: 'lax',
        path: '/'
      })
      
      // Add Vercel marker if on Vercel preview
      if (isVercelPreview) {
        response.cookies.set({
          name: 'vercel-auth-complete',
          value: Date.now().toString(),
          maxAge: 60, // 1 minute
          httpOnly: false,
          secure: true,
          sameSite: 'lax',
          path: '/'
        })
      }
      
      // Return the response with cookies properly set
      return response
    } catch (error: any) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en?error=auth_failed&details=${encodeURIComponent(String(error))}`)
    }
  }

  // No code in URL
  console.error('[Auth Callback] No code in URL')
  return NextResponse.redirect(`${origin}/en?error=no_code`)
}