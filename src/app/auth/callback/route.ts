import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  console.log('[Auth Callback] Starting auth callback handler at', new Date().toISOString())
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/en'
  
  // Log all parameters
  console.log('[Auth Callback] Parameters:', {
    code: code ? `${code.substring(0, 8)}...` : 'missing',
    error,
    errorDescription,
    next,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  })
  
  // Check for OAuth errors first
  if (error) {
    console.error('[Auth Callback] OAuth error:', error)
    console.error('[Auth Callback] Error description:', errorDescription)
    const errorMessage = errorDescription || error
    return NextResponse.redirect(new URL(`/en?error=oauth_error&message=${encodeURIComponent(errorMessage)}`, requestUrl.origin))
  }
  
  // Ensure we have a properly formatted absolute URL
  let origin = process.env.NEXT_PUBLIC_SITE_URL || ''
  
  // Fix missing protocol if needed
  if (origin && !origin.startsWith('http')) {
    origin = `https://${origin}`
  }
  
  // If no NEXT_PUBLIC_SITE_URL or it's malformed, use request origin
  if (!origin) {
    origin = requestUrl.origin
  }
  
  // Ensure origin ends without trailing slash
  origin = origin.replace(/\/$/, '')
  
  console.log('[Auth Callback] Request URL:', request.url)
  console.log('[Auth Callback] Origin:', origin)
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')
  console.log('[Auth Callback] Next:', next)

  if (!code) {
    console.error('[Auth Callback] No code parameter found')
    return NextResponse.redirect(new URL(`/en?error=no_code`, origin))
  }

  const cookieStore = await cookies()
  
  // Create response object first - ensure we construct a valid URL
  const redirectUrl = new URL(next, origin)
  const response = NextResponse.redirect(redirectUrl)

  try {
    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Auth Callback] Missing required environment variables')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing')
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing')
      return NextResponse.redirect(new URL(`/en?error=config_error`, origin))
    }

    // Create Supabase client with explicit cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                console.log(`[Auth Callback] Setting cookie: ${name}`)
                response.cookies.set(name, value, options)
              })
            } catch (error) {
              console.error('[Auth Callback] Error setting cookies:', error)
            }
          },
        },
      }
    )

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Code exchange error:', error)
      return NextResponse.redirect(new URL(`/en?error=auth_failed&message=${encodeURIComponent(error.message)}`, origin))
    }

    if (!data?.session) {
      console.error('[Auth Callback] No session returned from code exchange')
      return NextResponse.redirect(new URL(`/en?error=no_session`, origin))
    }

    console.log('[Auth Callback] Auth successful for user:', data.session.user.email)
    console.log('[Auth Callback] Session expires at:', new Date(data.session.expires_at!).toISOString())
    
    return response
    
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    return NextResponse.redirect(new URL(`/en?error=auth_failed`, origin))
  }
}