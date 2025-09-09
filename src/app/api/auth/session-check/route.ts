import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  const cookieStore = cookies()
  
  // Get all cookies
  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter(c => c.name.startsWith('sb-'))
  
  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // No-op for read-only check
        },
      },
    }
  )
  
  // Get session
  const { data: { session }, error } = await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()
  
  return NextResponse.json({
    hasSession: !!session,
    hasUser: !!user,
    sessionError: error?.message || null,
    authCookiesCount: authCookies.length,
    authCookies: authCookies.map(c => ({
      name: c.name,
      hasValue: !!c.value,
      valueLength: c.value?.length || 0
    })),
    user: user ? {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider
    } : null,
    session: session ? {
      expiresAt: session.expires_at,
      hasAccessToken: !!session.access_token,
      hasRefreshToken: !!session.refresh_token
    } : null
  })
}