import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const origin = requestUrl.origin

  console.log('[Auth Callback] Processing OAuth callback:', { code: !!code, next, origin })

  if (code) {
    try {
      // Create a Supabase client with proper cookie handling
      const cookieStore = new Map<string, string>()
      
      // Parse existing cookies
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=')
          if (name && value) {
            cookieStore.set(name, value)
          }
        })
      }

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set(name, value)
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.delete(name)
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Code exchange error:', error)
        return NextResponse.redirect(`${origin}/en?error=auth_failed&message=${encodeURIComponent(error.message)}`)
      }

      console.log('[Auth Callback] Code exchange successful, user:', data?.user?.email)
      console.log('[Auth Callback] Session data:', {
        hasSession: !!data.session,
        hasUser: !!data.user,
        accessToken: data.session?.access_token ? 'present' : 'missing'
      })
      
      // Create response with redirect
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // Set all cookies from Supabase
      cookieStore.forEach((value, name) => {
        // Supabase cookies start with 'sb-'
        if (name.startsWith('sb-')) {
          response.cookies.set({
            name,
            value,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
          })
        }
      })

      // Also set a custom session cookie for debugging
      if (data.session) {
        response.cookies.set({
          name: 'auth-callback-success',
          value: 'true',
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60, // 1 minute for debugging
        })
      }
      
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