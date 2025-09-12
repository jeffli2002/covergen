import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

async function logDebug(data: any) {
  // Only log in production for debugging
  if (process.env.NODE_ENV === 'production') {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/api/auth-debug/callback-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(() => {}) // Ignore errors to not break auth flow
    } catch {}
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const next = requestUrl.searchParams.get('next') || '/en'
  const origin = requestUrl.origin

  // Log incoming Cookie header as requested by Supabase
  const incomingCookieHeader = request.headers.get('cookie') || 'NO COOKIES'
  console.log('[Auth Callback] Incoming Cookie header:', incomingCookieHeader)
  console.log('[Auth Callback] Query params:', { code: !!code, state: !!state, stateValue: state })

  const debugData = { 
    event: 'callback_start',
    code: !!code,
    state: !!state,
    stateValue: state,
    next, 
    origin,
    env: process.env.NODE_ENV,
    url: request.url,
    cookieHeader: incomingCookieHeader
  }

  console.log('[Auth Callback] Processing OAuth callback:', debugData)
  await logDebug(debugData)

  if (!code) {
    console.log('[Auth Callback] No code present in callback')
    await logDebug({ event: 'callback_error', error: 'no_code' })
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
    
    // Specifically log code-verifier cookie
    const codeVerifier = incomingCookies.get('sb-exungkcoaihcemcmhqdr-auth-token-code-verifier')
    console.log('[Auth Callback] Code verifier cookie present:', !!codeVerifier)
    console.log('[Auth Callback] Code verifier length:', codeVerifier?.length || 0)

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
    await logDebug({ event: 'code_exchange_start', code: code.substring(0, 8) + '...' })
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback] Code exchange error:', error)
      await logDebug({ 
        event: 'code_exchange_error', 
        error: error.message,
        errorName: error.name,
        errorStatus: error.status 
      })
      return NextResponse.redirect(`${origin}/en?error=auth_failed&message=${encodeURIComponent(error.message)}`)
    }

    if (!data?.session) {
      console.error('[Auth Callback] No session returned from code exchange')
      await logDebug({ event: 'code_exchange_no_session', hasData: !!data, hasUser: !!data?.user })
      return NextResponse.redirect(`${origin}/en?error=no_session`)
    }

    const successData = {
      user: data.user?.email,
      hasSession: !!data.session,
      hasAccessToken: !!data.session?.access_token,
      provider: data.user?.app_metadata?.provider,
      newCookiesCount: newCookies.size
    }
    
    console.log('[Auth Callback] Code exchange successful:', successData)
    await logDebug({ event: 'code_exchange_success', ...successData })

    // Create response with redirect
    const response = NextResponse.redirect(`${origin}${next}`)
    
    // Apply ALL new cookies to the response with proper settings
    let authCookiesSet = 0
    newCookies.forEach(({ value, options }, name) => {
      // Ensure proper cookie settings for production
      const isProduction = process.env.NODE_ENV === 'production'
      const isHttps = origin.startsWith('https')
      
      const cookieOptions = {
        name,
        value,
        httpOnly: options.httpOnly ?? true,
        secure: isProduction || isHttps,
        sameSite: 'none' as 'none', // Must be None for OAuth cross-site flows
        path: options.path || '/',
        ...(options.maxAge && { maxAge: options.maxAge }),
        // Set domain to parent domain for production as recommended by Supabase
        ...(origin.includes('covergen.pro') && { domain: '.covergen.pro' })
      }

      response.cookies.set(cookieOptions)
      
      if (name.startsWith('sb-')) {
        authCookiesSet++
        console.log(`[Auth Callback] Set auth cookie: ${name}`)
      }
    })

    console.log(`[Auth Callback] Total auth cookies set: ${authCookiesSet}`)
    await logDebug({ 
      event: 'cookies_set', 
      authCookiesSet,
      totalCookies: newCookies.size,
      cookieNames: Array.from(newCookies.keys())
    })

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

    // Log all cookies that were set
    console.log('[Auth Callback] Cookies to be set:', Array.from(newCookies.entries()).map(([name, _]) => name))
    
    // Also log the redirect URL
    console.log('[Auth Callback] Redirecting to:', `${origin}${next}`)
    await logDebug({ 
      event: 'callback_complete', 
      redirectTo: `${origin}${next}`,
      success: true 
    })
    
    return response
    
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    await logDebug({ 
      event: 'callback_exception', 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined 
    })
    return NextResponse.redirect(`${origin}/en?error=auth_failed&details=${encodeURIComponent(String(error))}`)
  }
}