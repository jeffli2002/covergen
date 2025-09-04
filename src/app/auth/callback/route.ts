import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const origin = requestUrl.origin

  console.log('[Auth Callback] Processing OAuth callback:', { code: !!code, next })

  if (code) {
    try {
      const cookieStore = cookies()
      
      // Create a Supabase client with proper cookie handling for the response
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.delete({ name, ...options })
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Code exchange error:', error)
        return NextResponse.redirect(`${origin}/en?error=auth_failed&message=${encodeURIComponent(error.message)}`)
      }

      // Check what session we got
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[Auth Callback] Code exchange successful, session:', session?.user?.email)
      console.log('[Auth Callback] Session cookies should be set, redirecting to:', next)
      
      // Create redirect response that will include the set cookies
      const redirectUrl = new URL(next, origin)
      return NextResponse.redirect(redirectUrl)
      
    } catch (error) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en?error=auth_failed`)
    }
  }

  // No code present - redirect to home with error
  console.log('[Auth Callback] No code present in callback')
  return NextResponse.redirect(`${origin}/en?error=no_code`)
}