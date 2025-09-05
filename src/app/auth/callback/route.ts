import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const finalRedirect = '/en/auth-success' + (next ? `?next=${encodeURIComponent(next)}` : '')
  const origin = requestUrl.origin

  console.log('[Auth Callback] Processing OAuth callback:', { code: !!code, next, origin })

  if (code) {
    try {
      // Create a Supabase server client that can set cookies
      const response = NextResponse.redirect(`${origin}${finalRedirect}`)
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              response.cookies.set({
                name,
                value,
                ...options,
                sameSite: 'lax',
                httpOnly: true
              })
            },
            remove(name: string, options: CookieOptions) {
              response.cookies.set({
                name,
                value: '',
                ...options,
                maxAge: 0,
                sameSite: 'lax',
                httpOnly: true
              })
            }
          },
          auth: {
            flowType: 'pkce',
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          }
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Code exchange error:', error)
        // Include more detailed error information for debugging
        const errorParams = new URLSearchParams({
          error: 'auth_failed',
          message: error.message,
          error_code: error.status?.toString() || '',
          error_description: (error as any).error_description || ''
        })
        return NextResponse.redirect(`${origin}/en?${errorParams.toString()}`)
      }

      console.log('[Auth Callback] Code exchange successful, user:', data?.user?.email)
      console.log('[Auth Callback] Session data:', {
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        accessToken: data?.session?.access_token ? 'present' : 'missing',
        refreshToken: data?.session?.refresh_token ? 'present' : 'missing',
        expiresAt: data?.session?.expires_at,
      })
      
      // Log the cookies being set
      console.log('[Auth Callback] Response cookies:', response.cookies.getAll().map(c => ({
        name: c.name,
        hasValue: !!c.value,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite
      })))
      
      // Return the response with cookies set
      return response
      
    } catch (error) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en?error=auth_failed&details=${encodeURIComponent(String(error))}`)
    }
  }

  // No code present - redirect to home with error
  console.log('[Auth Callback] No code present in callback')
  return NextResponse.redirect(`${origin}/en?error=no_code`)
}