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
      
      // The cookies have been set on the response, return it
      return response
    } catch (error: any) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${requestUrl.origin}${next}?error=unexpected_error`)
    }
  }

  // No code present, redirect with error
  console.error('[Auth Callback] No OAuth code received')
  return NextResponse.redirect(`${requestUrl.origin}${next}?error=no_code`)
}