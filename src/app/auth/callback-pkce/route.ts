import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'

  console.log('[Auth Callback PKCE Route] Processing OAuth callback:', {
    hasCode: !!code,
    next,
    origin
  })

  if (code) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback PKCE Route] Code exchange error:', error)
        return NextResponse.redirect(`${origin}${next}?error=exchange_failed&message=${encodeURIComponent(error.message)}`)
      }
      
      console.log('[Auth Callback PKCE Route] Code exchange successful:', {
        user: data?.session?.user?.email,
        hasSession: !!data?.session
      })
      
      // Redirect to the originally requested page
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error: any) {
      console.error('[Auth Callback PKCE Route] Unexpected error:', error)
      return NextResponse.redirect(`${origin}${next}?error=unexpected_error`)
    }
  }

  // No code in URL
  console.error('[Auth Callback PKCE Route] No code in URL')
  return NextResponse.redirect(`${origin}${next}?error=no_code`)
}