import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const origin = requestUrl.origin

  console.log('[Auth Callback] Processing OAuth callback:', { code: !!code, next, origin })

  if (code) {
    try {
      // Create a Supabase client consistent with client-side
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
            flowType: 'pkce'
          }
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Code exchange error:', error)
        return NextResponse.redirect(`${origin}/en?error=auth_failed&message=${encodeURIComponent(error.message)}`)
      }

      console.log('[Auth Callback] Code exchange successful, user:', data?.user?.email)
      console.log('[Auth Callback] Session data:', {
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        accessToken: data?.session?.access_token ? 'present' : 'missing',
        refreshToken: data?.session?.refresh_token ? 'present' : 'missing',
      })
      
      // Redirect to the target page
      // The client-side will detect and handle the session
      return NextResponse.redirect(`${origin}${next}`)
      
    } catch (error) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en?error=auth_failed&details=${encodeURIComponent(String(error))}`)
    }
  }

  // No code present - redirect to home with error
  console.log('[Auth Callback] No code present in callback')
  return NextResponse.redirect(`${origin}/en?error=no_code`)
}