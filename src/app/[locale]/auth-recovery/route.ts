import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Recovery route for OAuth callbacks that land on the locale root
 * This handles cases where Supabase redirects to Site URL instead of callback
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  console.log('[Auth Recovery] Checking for session after OAuth redirect:', {
    url: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
    hasHashFragment: request.url.includes('#')
  })

  try {
    const cookieStore = cookies()
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Server-side cookie setting
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          }
        }
      }
    )
    
    // Check if we have a session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (session) {
      console.log('[Auth Recovery] Found session:', {
        user: session.user.email,
        userId: session.user.id
      })
      
      // Redirect with success markers
      const locale = request.url.split('/')[3] // Extract locale from URL
      const redirectUrl = new URL(`/${locale}`, request.url)
      redirectUrl.searchParams.set('auth_callback', 'success')
      redirectUrl.searchParams.set('auth_recovered', 'true')
      
      if (request.headers.get('host')?.includes('vercel.app')) {
        redirectUrl.searchParams.set('vercel_auth', 'true')
      }
      
      return NextResponse.redirect(redirectUrl.toString())
    } else {
      console.log('[Auth Recovery] No session found:', { error })
      return NextResponse.json({ 
        message: 'No session found',
        error: error?.message 
      })
    }
  } catch (error: any) {
    console.error('[Auth Recovery] Error:', error)
    return NextResponse.json({ 
      error: 'Recovery failed',
      details: error.message 
    })
  }
}