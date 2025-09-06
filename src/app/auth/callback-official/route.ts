import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'

  console.log('[Auth Callback Official] Processing OAuth callback:', {
    hasCode: !!code,
    next,
    origin
  })

  if (code) {
    try {
      const cookieStore = cookies()
      
      // Create a response that we'll use for the redirect
      const redirectUrl = `${origin}${next}`
      const response = NextResponse.redirect(redirectUrl)
      
      // Create Supabase client with proper cookie handling
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              // Set cookie on the response
              response.cookies.set({
                name,
                value,
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
              })
            },
            remove(name: string, options: any) {
              response.cookies.set({
                name,
                value: '',
                ...options,
                maxAge: 0,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
              })
            }
          }
        }
      )
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback Official] Code exchange error:', error)
        return NextResponse.redirect(`${origin}/en/auth-error?reason=code_exchange_failed&error=${encodeURIComponent(error.message)}`)
      }
      
      console.log('[Auth Callback Official] Code exchange successful:', {
        user: data?.session?.user?.email,
        hasSession: !!data?.session,
        cookies: response.cookies.getAll().map(c => c.name)
      })
      
      // Return the response with cookies properly set
      return response
    } catch (error: any) {
      console.error('[Auth Callback Official] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en/auth-error?reason=unexpected_error`)
    }
  }

  // No code in URL
  console.error('[Auth Callback Official] No code in URL')
  return NextResponse.redirect(`${origin}/en/auth-error?reason=no_code`)
}