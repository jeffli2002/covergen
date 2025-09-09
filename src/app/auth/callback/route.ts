import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'

  console.log('[Auth Callback] OAuth redirect handler:', {
    hasCode: !!code,
    next,
    origin: requestUrl.origin
  })

  if (code) {
    try {
      // Create server-side Supabase client
      const supabase = createClient()
      
      // Exchange the code for session on the server
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Code exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}${next}?error=exchange_failed&message=${encodeURIComponent(error.message)}`)
      }
      
      console.log('[Auth Callback] Code exchange successful:', {
        user: data?.session?.user?.email,
        hasSession: !!data?.session
      })
      
      // Redirect to the originally requested page
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } catch (error: any) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${requestUrl.origin}${next}?error=unexpected_error`)
    }
  }

  // No code present, redirect with error
  console.error('[Auth Callback] No OAuth code received')
  return NextResponse.redirect(`${requestUrl.origin}${next}?error=no_code`)
}