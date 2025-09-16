import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  // Log callback parameters for debugging
  const debugInfo = {
    timestamp: new Date().toISOString(),
    hasCode: !!code,
    hasError: !!error,
    error: error,
    errorDescription: errorDescription,
    origin: request.headers.get('origin') || requestUrl.origin,
    referer: request.headers.get('referer'),
    protocol: requestUrl.protocol,
    hostname: requestUrl.hostname,
    pathname: requestUrl.pathname,
    cookieHeader: request.headers.get('cookie')?.includes('sb-') ? 'has sb- cookies' : 'no sb- cookies'
  }
  
  console.log('[OAuth Callback V3]', JSON.stringify(debugInfo, null, 2))
  
  // If there's an OAuth error, handle it
  if (error) {
    console.error('[OAuth Callback V3] OAuth Error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/en/login?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, requestUrl)
    )
  }
  
  if (!code) {
    console.error('[OAuth Callback V3] No code parameter received')
    return NextResponse.redirect(new URL('/en/login?error=no_code', requestUrl))
  }
  
  try {
    const cookieStore = await cookies()
    
    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value
            console.log(`[Cookie Get] ${name}:`, value ? 'exists' : 'not found')
            return value
          },
          set(name: string, value: string, options: CookieOptions) {
            console.log(`[Cookie Set] ${name}:`, {
              sameSite: options.sameSite,
              secure: options.secure,
              httpOnly: options.httpOnly,
              path: options.path
            })
            
            // Ensure production-ready cookie settings
            const prodOptions: CookieOptions = {
              ...options,
              sameSite: 'lax',
              secure: requestUrl.protocol === 'https:',
              httpOnly: true,
              path: '/'
            }
            
            cookieStore.set({ name, value, ...prodOptions })
          },
          remove(name: string, options: CookieOptions) {
            console.log(`[Cookie Remove] ${name}`)
            cookieStore.set({ name, value: '', ...options })
          },
        },
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    )
    
    // Exchange code for session
    console.log('[OAuth Callback V3] Exchanging code for session...')
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('[OAuth Callback V3] Session exchange error:', sessionError)
      return NextResponse.redirect(
        new URL(`/en/login?error=session_exchange&message=${encodeURIComponent(sessionError.message)}`, requestUrl)
      )
    }
    
    console.log('[OAuth Callback V3] Session exchange successful:', {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      userEmail: data?.user?.email
    })
    
    // Verify the session was actually created
    const { data: { session: verifySession } } = await supabase.auth.getSession()
    console.log('[OAuth Callback V3] Session verification:', {
      sessionExists: !!verifySession,
      userEmail: verifySession?.user?.email
    })
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL(next, requestUrl))
    
    // Log final state
    console.log('[OAuth Callback V3] Redirecting to:', next)
    
    return response
    
  } catch (error) {
    console.error('[OAuth Callback V3] Unexpected error:', error)
    return NextResponse.redirect(
      new URL(`/en/login?error=unexpected&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, requestUrl)
    )
  }
}