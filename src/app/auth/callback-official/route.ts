import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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
      const supabase = createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback Official] Code exchange error:', error)
        return NextResponse.redirect(`${origin}/en/auth-error?reason=code_exchange_failed&error=${encodeURIComponent(error.message)}`)
      }
      
      console.log('[Auth Callback Official] Code exchange successful:', {
        user: data?.session?.user?.email,
        hasSession: !!data?.session
      })
      
      // Redirect directly to the final destination
      const finalUrl = next.startsWith('/') ? `${origin}${next}` : `${origin}/${next}`
      return NextResponse.redirect(finalUrl)
    } catch (error: any) {
      console.error('[Auth Callback Official] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/en/auth-error?reason=unexpected_error`)
    }
  }

  // No code in URL
  console.error('[Auth Callback Official] No code in URL')
  return NextResponse.redirect(`${origin}/en/auth-error?reason=no_code`)
}