import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  console.log('[Callback Production] Request received:', {
    hasCode: !!code,
    hasError: !!error,
    error,
    errorDescription,
    origin: requestUrl.origin,
    hostname: requestUrl.hostname,
    protocol: requestUrl.protocol,
    isSecure: requestUrl.protocol === 'https:',
    headers: {
      host: request.headers.get('host'),
      cookie: request.headers.get('cookie')?.includes('sb-') ? 'has sb- cookies' : 'no sb- cookies'
    }
  })
  
  if (error) {
    console.error('[Callback Production] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/en/login?error=${encodeURIComponent(error)}`, requestUrl)
    )
  }
  
  if (!code) {
    console.error('[Callback Production] No code received')
    return NextResponse.redirect(new URL('/en/login?error=no_code', requestUrl))
  }
  
  const cookieStore = await cookies()
  
  // Create response early so we can set cookies on it
  let redirectUrl = new URL(next, requestUrl)
  
  try {
    // Create Supabase client with production-ready cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value
            console.log(`[Cookie Get] ${name}: ${value ? 'found' : 'not found'}`)
            return value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Log what we're setting
            console.log(`[Cookie Set] ${name}:`, {
              path: options.path,
              maxAge: options.maxAge,
              sameSite: options.sameSite,
              secure: options.secure,
              httpOnly: options.httpOnly,
              domain: options.domain
            })
            
            // Force production-appropriate settings
            const isProduction = requestUrl.protocol === 'https:'
            const cookieOptions = {
              ...options,
              secure: isProduction,
              sameSite: options.sameSite || 'lax' as const,
              path: options.path || '/',
              httpOnly: options.httpOnly ?? true,
              // Important: don't set domain unless necessary
              // Let the browser handle it for better compatibility
              ...(options.domain ? { domain: options.domain } : {})
            }
            
            cookieStore.set({ 
              name, 
              value, 
              ...cookieOptions 
            })
          },
          remove(name: string, options: CookieOptions) {
            console.log(`[Cookie Remove] ${name}`)
            cookieStore.delete({
              name,
              ...options
            })
          },
        },
      }
    )
    
    console.log('[Callback Production] Exchanging code for session...')
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('[Callback Production] Exchange error:', exchangeError)
      redirectUrl = new URL(
        `/en/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`,
        requestUrl
      )
    } else {
      // Verify session was created
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('[Callback Production] Session check:', {
        hasSession: !!session,
        sessionError: sessionError?.message,
        user: session?.user?.email
      })
      
      if (!session) {
        console.warn('[Callback Production] No session after exchange - may need cookie time to propagate')
      }
    }
    
  } catch (err) {
    console.error('[Callback Production] Unexpected error:', err)
    redirectUrl = new URL(
      `/en/login?error=unexpected&message=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown')}`,
      requestUrl
    )
  }
  
  // Create response with all accumulated cookie operations
  const response = NextResponse.redirect(redirectUrl)
  
  // Additional debug: Log response headers
  console.log('[Callback Production] Response headers:', {
    location: redirectUrl.toString(),
    setCookieHeaders: response.headers.getSetCookie().length
  })
  
  return response
}