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
      const finalDestination = next && next !== '/en/auth-success' ? next : '/en'
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
                // Supabase auth cookies must NOT be httpOnly to be accessible by client-side SDK
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: options.sameSite ?? 'lax',
                path: '/'
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
      
      // Manually set auth cookies to ensure they're accessible by client
      if (data?.session) {
        const cookieOptions = {
          httpOnly: false, // MUST be false for client-side access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 60 * 60 * 24 * 365 // 1 year
        }
        
        // Set the auth token cookies manually
        response.cookies.set({
          name: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`,
          value: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            provider_token: data.session.provider_token,
            provider_refresh_token: data.session.provider_refresh_token,
            token_type: 'bearer',
            expires_at: Math.floor(Date.now() / 1000) + data.session.expires_in,
            expires_in: data.session.expires_in,
            user: data.session.user
          }),
          ...cookieOptions
        })
        
        console.log('[Auth Callback] Manually set auth cookies')
      }
      
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