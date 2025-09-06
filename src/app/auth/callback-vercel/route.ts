import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'

  console.log('[Vercel Auth Callback] Processing OAuth callback:', {
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

  if (!code) {
    console.error('[Vercel Auth Callback] No code in URL')
    return NextResponse.redirect(`${origin}/en?error=no_code`)
  }

  try {
    const cookieStore = cookies()
    
    console.log('[Vercel Auth Callback] Creating response with redirect')
    const redirectUrl = new URL(`${origin}${next}`)
    redirectUrl.searchParams.set('auth_callback', 'success')
    
    const response = NextResponse.redirect(redirectUrl.toString())
    
    console.log('[Vercel Auth Callback] Creating Supabase client for code exchange')
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value
            console.log(`[Vercel Auth Callback] Cookie get: ${name} = ${value ? 'exists' : 'missing'}`)
            return value
          },
          set(name: string, value: string, options: any) {
            console.log(`[Vercel Auth Callback] Setting cookie: ${name}`)
            
            // CRITICAL: Set cookies with proper options for Vercel
            const cookieOptions = {
              name,
              value,
              ...options,
              httpOnly: true,
              secure: true, // Always secure on Vercel
              sameSite: 'lax' as const,
              path: '/',
              // Do NOT set domain - let Vercel handle it
              maxAge: options.maxAge || 60 * 60 * 24 * 7 // Default 7 days
            }
            
            console.log(`[Vercel Auth Callback] Cookie options:`, {
              name: cookieOptions.name,
              httpOnly: cookieOptions.httpOnly,
              secure: cookieOptions.secure,
              sameSite: cookieOptions.sameSite,
              path: cookieOptions.path,
              maxAge: cookieOptions.maxAge
            })
            
            // Set cookie on response
            response.cookies.set(cookieOptions)
            
            // Also try to set on cookie store for immediate availability
            try {
              cookieStore.set(cookieOptions)
            } catch (e) {
              console.log('[Vercel Auth Callback] Could not set on cookie store:', e)
            }
          },
          remove(name: string, options: any) {
            console.log(`[Vercel Auth Callback] Cookie remove: ${name}`)
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
              path: '/'
            })
          }
        }
      }
    )
    
    console.log('[Vercel Auth Callback] Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Vercel Auth Callback] Exchange error:', error)
      return NextResponse.redirect(`${origin}/en?error=exchange_failed&message=${encodeURIComponent(error.message)}`)
    }
    
    if (!data?.session) {
      console.error('[Vercel Auth Callback] No session in exchange response')
      return NextResponse.redirect(`${origin}/en?error=no_session`)
    }
    
    console.log('[Vercel Auth Callback] Exchange successful:', {
      user: data.session.user.email,
      userId: data.session.user.id,
      expiresAt: data.session.expires_at
    })
    
    // Add auth success markers
    response.cookies.set({
      name: 'auth-callback-success',
      value: 'true',
      maxAge: 60, // 1 minute
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/'
    })
    
    response.cookies.set({
      name: 'auth-session-ready',
      value: data.session.user.id,
      maxAge: 300, // 5 minutes
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/'
    })
    
    console.log('[Vercel Auth Callback] Redirecting with session cookies set')
    return response
    
  } catch (error: any) {
    console.error('[Vercel Auth Callback] Unexpected error:', error)
    return NextResponse.redirect(`${origin}/en?error=callback_error&details=${encodeURIComponent(String(error))}`)
  }
}