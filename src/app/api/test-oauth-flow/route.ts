import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const action = url.searchParams.get('action')
  
  // Check incoming cookies
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = cookieHeader.split(';').map(c => c.trim())
  const supabaseCookies = cookies.filter(c => c.startsWith('sb-'))
  
  if (action === 'start') {
    // Simulate starting OAuth - this would normally set the code verifier cookie
    return NextResponse.json({
      message: 'OAuth flow would start here',
      currentCookies: supabaseCookies.map(c => c.split('=')[0]),
      expectedCookie: 'sb-exungkcoaihcemcmhqdr-auth-token-code-verifier should be set by Supabase'
    })
  }
  
  if (action === 'callback') {
    // Simulate OAuth callback
    const code = url.searchParams.get('code')
    const hasCodeVerifier = supabaseCookies.some(c => c.includes('code-verifier'))
    
    return NextResponse.json({
      message: 'OAuth callback check',
      hasCode: !!code,
      hasCodeVerifier,
      supabaseCookies: supabaseCookies.map(c => c.split('=')[0]),
      diagnosis: {
        willFail: !hasCodeVerifier,
        reason: !hasCodeVerifier ? 'Missing code verifier cookie - PKCE flow will fail' : 'Should work'
      }
    })
  }
  
  // Test reading cookies through Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookies.find(c => c.startsWith(`${name}=`))
          if (cookie) {
            return cookie.split('=')[1]
          }
          return undefined
        },
        set() {},
        remove() {}
      }
    }
  )
  
  // Try to get session
  let sessionCheck = {}
  try {
    const { data, error } = await supabase.auth.getSession()
    sessionCheck = {
      hasSession: !!data.session,
      error: error?.message,
      user: data.session?.user?.email
    }
  } catch (e) {
    sessionCheck = { exception: String(e) }
  }
  
  return NextResponse.json({
    message: 'OAuth Flow Test',
    cookies: {
      all: cookies.length,
      supabase: supabaseCookies.length,
      names: supabaseCookies.map(c => c.split('=')[0])
    },
    session: sessionCheck,
    tests: {
      startOAuth: `${url.origin}/api/test-oauth-flow?action=start`,
      testCallback: `${url.origin}/api/test-oauth-flow?action=callback&code=TEST`
    }
  })
}