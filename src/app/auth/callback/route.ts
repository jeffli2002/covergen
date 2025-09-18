import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('[Auth Callback] Processing OAuth callback:', {
    hasCode: !!code,
    next,
    origin,
    error,
    errorDescription,
    allParams: Object.fromEntries(searchParams.entries())
  })

  if (code) {
    try {
      const cookieStore = cookies()
      
      // Create response first to properly handle cookies
      // Redirect directly to the next page instead of auth-success
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // Create Supabase client with cookie handling
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              // Set cookies on both the request store and the response
              cookieStore.set({ name, value, ...options })
              response.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.set({ name, value: '', ...options })
              response.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Code exchange error:', error)
        return NextResponse.redirect(`${origin}/en/auth-error?reason=code_exchange_failed&error=${encodeURIComponent(error.message)}`)
      }
      
      console.log('[Auth Callback] Code exchange successful:', {
        user: data?.session?.user?.email,
        hasSession: !!data?.session
      })
      
      // The session cookies have been set via the cookie handler above
      // Return the response with the cookies properly set
      return response
    } catch (error: any) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en/auth-error?reason=unexpected_error`)
    }
  }

  // Check for OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/en/auth-error?reason=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`)
  }

  // No code in URL
  console.error('[Auth Callback] No code in URL')
  return NextResponse.redirect(`${origin}/en/auth-error?reason=no_code`)
}