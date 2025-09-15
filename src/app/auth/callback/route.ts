import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const origin = requestUrl.origin

  console.log('[Auth Callback] Processing OAuth callback:', { 
    code: !!code, 
    next, 
    origin,
    env: process.env.NODE_ENV,
    url: request.url 
  })

  if (!code) {
    console.log('[Auth Callback] No code present in callback')
    return NextResponse.redirect(`${origin}/en?error=no_code`)
  }

  try {
    // Create collections to track ALL cookies (incoming + new)
    const incomingCookies = new Map<string, string>()
    const newCookies = new Map<string, { value: string; options: CookieOptions }>()
    
    // Parse existing cookies from the request
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, ...valueParts] = cookie.trim().split('=')
        if (name && valueParts.length > 0) {
          const value = valueParts.join('=') // Handle values with = in them
          incomingCookies.set(name, value)
        }
      })
    }

    console.log('[Auth Callback] Incoming cookies:', Array.from(incomingCookies.keys()))

    // Create Supabase client with custom cookie handling that captures ALL operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // First check new cookies, then incoming cookies
            const newCookie = newCookies.get(name)
            if (newCookie) {
              return newCookie.value
            }
            return incomingCookies.get(name)
          },
          set(name: string, value: string, options: CookieOptions) {
            console.log(`[Auth Callback] Cookie SET: ${name} (length: ${value?.length || 0})`)
            newCookies.set(name, { value, options })
          },
          remove(name: string, options: CookieOptions) {
            console.log(`[Auth Callback] Cookie REMOVE: ${name}`)
            newCookies.set(name, { 
              value: '', 
              options: { ...options, maxAge: 0 } 
            })
          },
        },
      }
    )

    // Exchange the code for a session
    console.log('[Auth Callback] Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback] Code exchange error:', error)
      return NextResponse.redirect(`${origin}/en?error=auth_failed&message=${encodeURIComponent(error.message)}`)
    }

    if (!data?.session) {
      console.error('[Auth Callback] No session returned from code exchange')
      return NextResponse.redirect(`${origin}/en?error=no_session`)
    }

    console.log('[Auth Callback] Code exchange successful:', {
      user: data.user?.email,
      hasSession: !!data.session,
      hasAccessToken: !!data.session?.access_token,
      provider: data.user?.app_metadata?.provider,
      newCookiesCount: newCookies.size
    })

    // Create response with redirect
    const response = NextResponse.redirect(`${origin}${next}`)
    
    // Apply ALL new cookies to the response with proper settings
    let authCookiesSet = 0
    newCookies.forEach(({ value, options }, name) => {
      // Ensure proper cookie settings for production
      const cookieOptions = {
        name,
        value,
        httpOnly: options.httpOnly ?? true,
        secure: process.env.NODE_ENV === 'production' || origin.startsWith('https'),
        sameSite: (options.sameSite || 'lax') as 'lax' | 'strict' | 'none',
        path: options.path || '/',
        ...(options.maxAge && { maxAge: options.maxAge }),
        ...(options.domain && { domain: options.domain })
      }

      response.cookies.set(cookieOptions)
      
      if (name.startsWith('sb-')) {
        authCookiesSet++
        console.log(`[Auth Callback] Set auth cookie: ${name}`)
      }
    })

    console.log(`[Auth Callback] Total auth cookies set: ${authCookiesSet}`)

    // Set a debug cookie to verify cookie setting works
    response.cookies.set({
      name: 'auth-callback-processed',
      value: new Date().toISOString(),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 5 // 5 minutes
    })

    // Also ensure we have the critical session cookies
    if (data.session) {
      // Manually ensure the access token is available for client-side auth
      response.cookies.set({
        name: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`,
        value: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in,
          token_type: data.session.token_type
        }),
        httpOnly: false, // Must be false for client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365 // 1 year
      })
      console.log('[Auth Callback] Manually set session cookie')
    }
    
    return response
    
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    return NextResponse.redirect(`${origin}/en?error=auth_failed&details=${encodeURIComponent(String(error))}`)
  }
}