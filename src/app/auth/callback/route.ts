import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'

  console.log('[Auth Callback] Processing OAuth callback:', {
    hasCode: !!code,
    next,
    origin
  })

  if (code) {
    try {
      const cookieStore = cookies()
      
      // Create response for the final destination
      const finalDestination = next && next !== '/en/auth-success' ? `${origin}${next}` : `${origin}/en`
      const response = NextResponse.redirect(`${origin}/en/auth-success?next=${encodeURIComponent(finalDestination)}`)
      
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
              // Set cookies on the response
              response.cookies.set({ 
                name, 
                value, 
                ...options,
                // Ensure cookies are available to client
                httpOnly: options.httpOnly ?? true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: options.sameSite ?? 'lax'
              })
            },
            remove(name: string, options: CookieOptions) {
              response.cookies.set({ 
                name, 
                value: '', 
                ...options,
                maxAge: 0
              })
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
      return response
    } catch (error: any) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en/auth-error?reason=unexpected_error`)
    }
  }

  // No code in URL
  console.error('[Auth Callback] No code in URL')
  return NextResponse.redirect(`${origin}/en/auth-error?reason=no_code`)
}