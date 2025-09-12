import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const origin = requestUrl.origin

  console.log('[Auth Callback V2] Processing OAuth callback:', { 
    code: !!code, 
    next, 
    origin,
    url: request.url 
  })

  if (!code) {
    console.log('[Auth Callback V2] No code present in callback')
    return NextResponse.redirect(`${origin}/en?error=no_code`)
  }

  try {
    const cookieStore = cookies()
    
    // Create Supabase client with Next.js cookies() helper
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            console.log(`[Auth Callback V2] Getting cookie ${name}:`, cookie?.value ? 'found' : 'not found')
            return cookie?.value
          },
          set(name: string, value: string, options: any) {
            console.log(`[Auth Callback V2] Setting cookie ${name}`)
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            console.log(`[Auth Callback V2] Removing cookie ${name}`)
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          },
        },
      }
    )

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback V2] Code exchange error:', error)
      return NextResponse.redirect(`${origin}/en?error=auth_failed&message=${encodeURIComponent(error.message)}`)
    }

    if (!data.session) {
      console.error('[Auth Callback V2] No session returned from code exchange')
      return NextResponse.redirect(`${origin}/en?error=no_session`)
    }

    console.log('[Auth Callback V2] Code exchange successful:', {
      user: data.user?.email,
      hasSession: !!data.session,
      hasAccessToken: !!data.session?.access_token,
      provider: data.user?.app_metadata?.provider
    })

    // Set a temporary success cookie for debugging
    cookieStore.set('auth-callback-success', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 // 1 minute
    })

    // Redirect to the intended destination
    return NextResponse.redirect(`${origin}${next}`)
    
  } catch (error) {
    console.error('[Auth Callback V2] Unexpected error:', error)
    return NextResponse.redirect(`${origin}/en?error=auth_failed&details=${encodeURIComponent(String(error))}`)
  }
}