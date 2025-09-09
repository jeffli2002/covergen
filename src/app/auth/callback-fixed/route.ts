import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'

  console.log('[Auth Callback Fixed] OAuth redirect handler:', {
    hasCode: !!code,
    next,
    origin: requestUrl.origin,
    url: request.url
  })

  if (!code) {
    console.error('[Auth Callback Fixed] No OAuth code received')
    return NextResponse.redirect(`${requestUrl.origin}${next}?error=no_code`)
  }

  const cookieStore = cookies()
  
  // Create the response first
  const response = NextResponse.redirect(`${requestUrl.origin}${next}?auth=success`)
  
  try {
    // Create Supabase client with response-aware cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            console.log('[Auth Callback Fixed] Setting cookies:', cookiesToSet.map(c => ({ 
              name: c.name, 
              hasValue: !!c.value,
              valueLength: c.value?.length || 0 
            })))
            
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set cookie with proper options
              const cookieOptions = {
                name,
                value,
                httpOnly: options?.httpOnly ?? true,
                secure: options?.secure ?? (process.env.NODE_ENV === 'production'),
                sameSite: (options?.sameSite || 'lax') as 'lax' | 'strict' | 'none',
                path: options?.path || '/',
                maxAge: options?.maxAge,
                expires: options?.expires,
              }
              
              // Set on response - this is what actually sends cookies to the browser
              response.cookies.set(cookieOptions)
              
              console.log('[Auth Callback Fixed] Cookie set:', {
                name: cookieOptions.name,
                path: cookieOptions.path,
                httpOnly: cookieOptions.httpOnly,
                secure: cookieOptions.secure,
                sameSite: cookieOptions.sameSite
              })
            })
          },
        },
      }
    )
    
    // Exchange code for session
    console.log('[Auth Callback Fixed] Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback Fixed] Code exchange error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}${next}?error=exchange_failed&message=${encodeURIComponent(error.message)}`
      )
    }
    
    if (!data.session) {
      console.error('[Auth Callback Fixed] No session returned from exchange')
      return NextResponse.redirect(`${requestUrl.origin}${next}?error=no_session`)
    }
    
    console.log('[Auth Callback Fixed] Session established successfully:', {
      user: data.session.user?.email,
      expiresAt: data.session.expires_at,
      provider: data.session.user?.app_metadata?.provider
    })
    
    // Verify cookies were set
    const responseCookies = response.cookies.getAll()
    console.log('[Auth Callback Fixed] Response cookies count:', responseCookies.length)
    
    // Add a small delay to ensure cookies are properly set
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return response
    
  } catch (error: any) {
    console.error('[Auth Callback Fixed] Unexpected error:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}${next}?error=callback_error&message=${encodeURIComponent(error.message || 'Unknown error')}`
    )
  }
}