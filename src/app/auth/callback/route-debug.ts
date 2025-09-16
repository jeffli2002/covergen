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

  console.log('[OAuth Debug] ===== CALLBACK STARTED =====')
  console.log('[OAuth Debug] URL:', request.url)
  console.log('[OAuth Debug] Code:', code ? 'present' : 'missing')
  console.log('[OAuth Debug] Error:', error)
  
  if (error) {
    console.error('[OAuth Debug] Provider error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/error?reason=provider&error=${error}`)
  }

  if (code) {
    let response = NextResponse.redirect(`${origin}${next}`)
    
    const cookieStore = await cookies()
    
    // 检查现有的cookies
    console.log('[OAuth Debug] Existing cookies:', 
      cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    )
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value
            console.log(`[OAuth Debug] Cookie GET ${name}:`, value ? 'found' : 'not found')
            return value
          },
          set(name: string, value: string, options: CookieOptions) {
            console.log(`[OAuth Debug] Cookie SET ${name}:`, {
              valueLength: value?.length,
              options
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            console.log(`[OAuth Debug] Cookie REMOVE ${name}`)
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )
    
    console.log('[OAuth Debug] Exchanging code for session...')
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      console.log('[OAuth Debug] Exchange successful!')
      
      // 验证session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[OAuth Debug] Session after exchange:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        hasRefreshToken: !!session?.refresh_token,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        expiresAt: session?.expires_at
      })
      
      // 验证用户
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[OAuth Debug] User after exchange:', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
        provider: user?.app_metadata?.provider,
        createdAt: user?.created_at,
        lastSignInAt: user?.last_sign_in_at
      })
      
      // 检查auth.users表是否创建了记录
      if (user) {
        console.log('[OAuth Debug] ✅ auth.users record exists')
      } else {
        console.error('[OAuth Debug] ❌ NO auth.users record found!')
      }
      
      // 添加调试参数到重定向URL
      response = NextResponse.redirect(`${origin}${next}?oauth_success=true&user=${user?.email || 'none'}`)
      
      // 列出所有将要设置的cookies
      const cookiesToSet = response.cookies.getAll()
      console.log('[OAuth Debug] Cookies to be set:', 
        cookiesToSet.map(c => ({ name: c.name, hasValue: !!c.value }))
      )
      
      console.log('[OAuth Debug] ===== CALLBACK COMPLETED =====')
      return response
    }
    
    console.error('[OAuth Debug] Exchange failed:', exchangeError)
    console.error('[OAuth Debug] Error details:', {
      message: exchangeError.message,
      status: exchangeError.status,
      code: exchangeError.code
    })
    
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange&message=${encodeURIComponent(exchangeError.message)}`)
  }

  console.error('[OAuth Debug] No code parameter received')
  return NextResponse.redirect(`${origin}/auth/error?reason=no_code`)
}