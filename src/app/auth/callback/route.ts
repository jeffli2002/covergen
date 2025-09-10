import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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
      const cookieStore = cookies()
      
      // Create a response object first
      const response = NextResponse.redirect(`${requestUrl.origin}${next}`)
      
      // Create server-side Supabase client with proper cookie handling
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              // Set cookies on both the request and response
              cookiesToSet.forEach(({ name, value, options }) => {
                // Ensure proper cookie options for auth cookies
                const cookieOptions = {
                  ...options,
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax' as const,
                  path: '/',
                  // Don't set domain to work with dynamic Vercel URLs
                }
                
                cookieStore.set({ name, value, ...cookieOptions })
                response.cookies.set(name, value, cookieOptions)
              })
            },
          },
        }
      )
      
      // Exchange the code for session on the server
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Auth Callback] Code exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}${next}?error=exchange_failed&message=${encodeURIComponent(error.message)}`)
      }
      
      console.log('[Auth Callback] Code exchange successful:', {
        user: data?.session?.user?.email,
        hasSession: !!data?.session,
        accessTokenLength: data?.session?.access_token?.length,
        expiresAt: data?.session?.expires_at
      })
      
      // For Vercel preview deployments, add a marker cookie to help with recovery
      if (requestUrl.hostname.includes('vercel.app')) {
        response.cookies.set({
          name: 'auth-callback-success',
          value: 'true',
          httpOnly: false, // Allow client-side access for recovery
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 // Short-lived marker
        })
        
        // Add session data cookie for Vercel session bridge
        const sessionData = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in,
          token_type: data.session.token_type,
          user: data.session.user
        }
        
        response.cookies.set({
          name: 'sb-session-data',
          value: encodeURIComponent(JSON.stringify(sessionData)),
          httpOnly: false,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60
        })
      }
      
      // Update redirect to include auth_callback parameter
      const redirectUrl = new URL(`${requestUrl.origin}${next}`)
      redirectUrl.searchParams.set('auth_callback', 'success')
      if (requestUrl.hostname.includes('vercel.app')) {
        redirectUrl.searchParams.set('vercel_auth', 'true')
      }
      
      // Create new response with updated URL
      const finalResponse = NextResponse.redirect(redirectUrl.toString())
      
      // Copy all cookies from original response to final response
      response.cookies.getAll().forEach(cookie => {
        finalResponse.cookies.set(cookie)
      })
      
      return finalResponse
    } catch (error: any) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${requestUrl.origin}${next}?error=unexpected_error`)
    }
  }

  // No code present, redirect with error
  console.error('[Auth Callback] No OAuth code received')
  return NextResponse.redirect(`${requestUrl.origin}${next}?error=no_code`)
}