import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { debugLogStore } from '@/lib/oauth-debug-store'

function debugLog(message: string, data?: any) {
  debugLogStore.add(message, data)
}

export async function GET(request: NextRequest) {
  debugLog('============ START ============')
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en'
  const origin = requestUrl.origin
  
  debugLog('Params:', { code: !!code, next, origin })
  debugLog('Full URL:', request.url)
  
  if (!code) {
    debugLog('No code provided')
    return NextResponse.redirect(`${origin}/en?error=no_code`)
  }
  
  try {
    // Create response first
    // Redirect directly to the next page instead of auth-success
    const redirectUrl = `${origin}${next}`
    debugLog('Will redirect to:', redirectUrl)
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
            debugLog(`Cookie GET: ${name} = ${value ? 'exists' : 'not found'}`)
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
            debugLog('Cookie SET attempt:', logEntry)
            
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
              debugLog('Cookie SET success:', name)
            } catch (err) {
              debugLog('Cookie SET error:', { name, error: String(err) })
            }
          },
          remove(name: string, options: CookieOptions) {
            cookieLog.push({ action: 'REMOVE', name, options })
            debugLog('Cookie REMOVE:', name)
            
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
    
    debugLog('Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      debugLog('Exchange error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack
      })
      return NextResponse.redirect(`${origin}/en?error=exchange_failed&message=${encodeURIComponent(error.message)}`)
    }
    
    debugLog('Exchange successful!')
    debugLog('User:', data?.user?.email)
    debugLog('Session exists:', !!data?.session)
    debugLog('Access token length:', data?.session?.access_token?.length)
    debugLog('Refresh token length:', data?.session?.refresh_token?.length)
    
    // Log all cookie operations
    debugLog('Cookie operations log:', cookieLog)
    debugLog('Response cookies:', response.cookies.getAll().map(c => ({
      name: c.name,
      valueLength: c.value?.length || 0,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite
    })))
    
    debugLog('============ END ============')
    
    return response
  } catch (error) {
    debugLog('Unexpected error:', String(error))
    return NextResponse.redirect(`${origin}/en?error=unexpected&details=${encodeURIComponent(String(error))}`)
  }
}