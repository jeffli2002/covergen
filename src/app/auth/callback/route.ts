import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Log the full request details
  console.log('[OAuth Callback Route] Request received:', {
    url: request.url,
    hasCode: !!code,
    codePrefix: code?.substring(0, 8),
    next,
    error,
    errorDescription,
    headers: {
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent')?.includes('Chrome') ? 'Chrome' : 'Other'
    }
  })

  // Handle OAuth provider errors
  if (error) {
    console.error('[OAuth Callback Route] Provider error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/error?reason=provider&error=${error}`)
  }

  if (code) {
    // Create a new response to modify cookies
    let response = NextResponse.redirect(`${origin}${next}`)
    
    // Create Supabase client with cookie handling
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Set cookies on the response
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )
    
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      console.log('[OAuth Callback Route] Successfully authenticated, redirecting to:', next)
      
      // Verify the session was created
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[OAuth Callback Route] User session verified:', user?.email)
      
      // Return the response with cookies set
      return response
    }
    
    console.error('[OAuth Callback Route] Exchange error:', exchangeError)
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange&message=${encodeURIComponent(exchangeError.message)}`)
  }

  // No code provided
  console.error('[OAuth Callback Route] No code parameter received')
  return NextResponse.redirect(`${origin}/auth/error?reason=no_code`)
}