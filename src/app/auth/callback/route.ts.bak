import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  console.log('[Auth Callback] OAuth callback received:', {
    hasCode: !!code,
    codeLength: code?.length,
    hasError: !!error,
    error,
    errorDescription,
    next,
    url: requestUrl.toString()
  })
  
  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth provider error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/en/login?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, requestUrl)
    )
  }
  
  // Check for authorization code (PKCE flow)
  if (!code) {
    console.error('[Auth Callback] No authorization code received')
    return NextResponse.redirect(
      new URL('/en/login?error=no_code', requestUrl)
    )
  }
  
  const cookieStore = await cookies()
  
  try {
    // Create Supabase server client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value
            console.log(`[Auth Callback] Cookie GET ${name}: ${value ? 'found' : 'not found'}`)
            return value
          },
          set(name: string, value: string, options: CookieOptions) {
            console.log(`[Auth Callback] Cookie SET ${name}`, {
              valueLength: value?.length,
              options
            })
            cookieStore.set({
              name,
              value,
              ...options
            })
          },
          remove(name: string, options: CookieOptions) {
            console.log(`[Auth Callback] Cookie REMOVE ${name}`)
            cookieStore.delete(name)
          },
        },
      }
    )
    
    // Exchange the authorization code for a session
    console.log('[Auth Callback] Exchanging authorization code for session...')
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('[Auth Callback] Code exchange failed:', exchangeError)
      
      // Check if it's a PKCE-specific error
      if (exchangeError.message?.includes('code_verifier')) {
        console.error('[Auth Callback] PKCE verification failed - code verifier issue')
        return NextResponse.redirect(
          new URL(`/en/login?error=pkce_failed&message=${encodeURIComponent('PKCE verification failed. Please try signing in again.')}`, requestUrl)
        )
      }
      
      return NextResponse.redirect(
        new URL(`/en/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`, requestUrl)
      )
    }
    
    // Verify the session was created
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('[Auth Callback] Post-exchange session check:', {
      hasSession: !!session,
      sessionUser: session?.user?.email,
      sessionError: sessionError?.message
    })
    
    if (!session) {
      console.warn('[Auth Callback] No session found after exchange - this might be a timing issue')
    }
    
    // Set a flag for the client to know OAuth succeeded
    cookieStore.set({
      name: 'oauth-callback-success',
      value: 'true',
      maxAge: 10, // Short-lived flag
      path: '/'
    })
    
    // Redirect to the original page or home
    console.log('[Auth Callback] Success! Redirecting to:', next)
    return NextResponse.redirect(new URL(next, requestUrl))
    
  } catch (err) {
    console.error('[Auth Callback] Unexpected error:', err)
    return NextResponse.redirect(
      new URL(`/en/login?error=unexpected&message=${encodeURIComponent(err instanceof Error ? err.message : 'An unexpected error occurred')}`, requestUrl)
    )
  }
}