import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  console.log('[Auth Callback Debug] ============ START ============')
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const origin = requestUrl.origin
  
  console.log('[Auth Callback Debug] Params:', { code: !!code, next, origin })
  console.log('[Auth Callback Debug] Full URL:', request.url)
  
  if (!code) {
    console.log('[Auth Callback Debug] No code provided')
    return NextResponse.redirect(`${origin}/en?error=no_code`)
  }
  
  try {
    // Create response first
    const redirectUrl = `${origin}/en/auth-success?next=${encodeURIComponent(next)}`
    console.log('[Auth Callback Debug] Will redirect to:', redirectUrl)
    const response = NextResponse.redirect(redirectUrl)
    
    // Log cookie setting attempts
    const cookieLog: any[] = []
    
    // Create Supabase client with detailed logging
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = request.cookies.get(name)?.value
            console.log(`[Auth Callback Debug] Cookie GET: ${name} = ${value ? 'exists' : 'not found'}`)
            return value
          },
          set(name: string, value: string, options: CookieOptions) {
            const logEntry = {
              action: 'SET',
              name,
              valueLength: value.length,
              options
            }
            cookieLog.push(logEntry)
            console.log('[Auth Callback Debug] Cookie SET attempt:', logEntry)
            
            try {
              response.cookies.set({
                name,
                value,
                ...options,
                sameSite: 'lax' as const,
                httpOnly: true,
                secure: true, // Always secure on Vercel
                path: '/',
              })
              console.log('[Auth Callback Debug] Cookie SET success:', name)
            } catch (err) {
              console.error('[Auth Callback Debug] Cookie SET error:', name, err)
            }
          },
          remove(name: string, options: CookieOptions) {
            cookieLog.push({ action: 'REMOVE', name, options })
            console.log('[Auth Callback Debug] Cookie REMOVE:', name)
            
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              sameSite: 'lax' as const,
              httpOnly: true,
              secure: true,
              path: '/',
            })
          }
        },
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      }
    )
    
    console.log('[Auth Callback Debug] Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback Debug] Exchange error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack
      })
      return NextResponse.redirect(`${origin}/en?error=exchange_failed&message=${encodeURIComponent(error.message)}`)
    }
    
    console.log('[Auth Callback Debug] Exchange successful!')
    console.log('[Auth Callback Debug] User:', data?.user?.email)
    console.log('[Auth Callback Debug] Session exists:', !!data?.session)
    console.log('[Auth Callback Debug] Access token length:', data?.session?.access_token?.length)
    console.log('[Auth Callback Debug] Refresh token length:', data?.session?.refresh_token?.length)
    
    // Log all cookie operations
    console.log('[Auth Callback Debug] Cookie operations log:', cookieLog)
    console.log('[Auth Callback Debug] Response cookies:', response.cookies.getAll().map(c => ({
      name: c.name,
      valueLength: c.value?.length || 0,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite
    })))
    
    console.log('[Auth Callback Debug] ============ END ============')
    
    return response
  } catch (error) {
    console.error('[Auth Callback Debug] Unexpected error:', error)
    return NextResponse.redirect(`${origin}/en?error=unexpected&details=${encodeURIComponent(String(error))}`)
  }
}