import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin, hostname } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'
  const error = searchParams.get('error')
  
  console.log('[Universal Auth Callback] Request details:', {
    hasCode: !!code,
    hasError: !!error,
    error,
    next,
    origin,
    hostname,
    nodeEnv: process.env.NODE_ENV
  })

  // Handle OAuth errors from provider
  if (error) {
    console.error('[Universal Auth Callback] OAuth provider error:', error)
    return NextResponse.redirect(`${origin}/en?error=oauth_error&message=${encodeURIComponent(error)}`)
  }

  if (!code) {
    console.error('[Universal Auth Callback] No authorization code received')
    return NextResponse.redirect(`${origin}/en?error=no_code`)
  }

  try {
    const cookieStore = cookies()
    
    // Create the redirect response with auth callback marker
    const redirectUrl = new URL(`${origin}${next}`)
    redirectUrl.searchParams.set('auth_callback', 'success')
    const response = NextResponse.redirect(redirectUrl.toString())
    
    // Enhanced cookie options for Vercel preview deployments
    const isProduction = process.env.NODE_ENV === 'production'
    const isVercelPreview = hostname.includes('.vercel.app')
    
    console.log('[Universal Auth Callback] Cookie configuration:', {
      isProduction,
      isVercelPreview,
      hostname,
      cookieStore: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    })
    
    // Create Supabase client with enhanced cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value
            console.log(`[Cookie Get] ${name}:`, value ? 'found' : 'not found')
            return value
          },
          set(name: string, value: string, options: any) {
            console.log(`[Cookie Set] ${name}:`, {
              hasValue: !!value,
              options
            })
            
            // Enhanced cookie configuration for all environments
            const cookieOptions: any = {
              name,
              value,
              path: '/',
              httpOnly: true,
              secure: true, // Always true for OAuth
              sameSite: 'lax' as const,
              maxAge: options.maxAge || 60 * 60 * 24 * 7, // Default 7 days
            }
            
            // IMPORTANT: Never set domain for any deployment
            // This allows cookies to work on dynamic Vercel URLs
            // The browser will automatically set the cookie for the current domain
            
            response.cookies.set(cookieOptions)
          },
          remove(name: string, options: any) {
            console.log(`[Cookie Remove] ${name}`)
            response.cookies.set({
              name,
              value: '',
              path: '/',
              maxAge: 0,
              ...options
            })
          }
        }
      }
    )
    
    // Exchange the code for a session
    console.log('[Universal Auth Callback] Exchanging code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('[Universal Auth Callback] Code exchange error:', exchangeError)
      return NextResponse.redirect(
        `${origin}/en?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
      )
    }
    
    if (!data?.session) {
      console.error('[Universal Auth Callback] No session returned from code exchange')
      return NextResponse.redirect(`${origin}/en?error=no_session`)
    }
    
    console.log('[Universal Auth Callback] Session established:', {
      user: data.session.user.email,
      userId: data.session.user.id,
      expiresAt: data.session.expires_at,
      cookiesSet: response.cookies.getAll().map(c => ({
        name: c.name,
        hasValue: !!c.value,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite
      }))
    })
    
    // Add a session verification cookie for debugging
    response.cookies.set({
      name: 'auth-callback-success',
      value: 'true',
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 // 1 minute
    })
    
    return response
    
  } catch (error: any) {
    console.error('[Universal Auth Callback] Unexpected error:', error)
    return NextResponse.redirect(
      `${origin}/en?error=callback_error&details=${encodeURIComponent(error.message || String(error))}`
    )
  }
}