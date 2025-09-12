import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const origin = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/en?error=no_code`)
  }

  const cookieStore = await cookies()
  
  // Create response object first
  const response = NextResponse.redirect(`${origin}${next}`)

  try {
    // Create Supabase client with explicit cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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