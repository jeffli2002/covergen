import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  console.log('[Auth Callback] Starting auth callback handler')
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  // Use the request origin as fallback to ensure we always have a valid URL
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${requestUrl.protocol}//${requestUrl.host}`
  
  console.log('[Auth Callback] Request URL:', request.url)
  console.log('[Auth Callback] Origin:', origin)
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')
  console.log('[Auth Callback] Next:', next)

  if (!code) {
    console.error('[Auth Callback] No code parameter found')
    return NextResponse.redirect(`${origin}/en?error=no_code`)
  }

  const cookieStore = await cookies()
  
  // Create response object first
  const response = NextResponse.redirect(`${origin}${next}`)

  try {
    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Auth Callback] Missing required environment variables')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing')
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing')
      return NextResponse.redirect(`${origin}/en?error=config_error`)
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
      return NextResponse.redirect(`${origin}/en?error=auth_failed&message=${encodeURIComponent(error.message)}`)
    }

    if (!data?.session) {
      console.error('[Auth Callback] No session returned from code exchange')
      return NextResponse.redirect(`${origin}/en?error=no_session`)
    }

    console.log('[Auth Callback] Auth successful for user:', data.session.user.email)
    console.log('[Auth Callback] Session expires at:', new Date(data.session.expires_at!).toISOString())
    
    return response
    
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    return NextResponse.redirect(`${origin}/en?error=auth_failed`)
  }
}