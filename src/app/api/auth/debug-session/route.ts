import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // Get auth-related cookies
    const authCookies = allCookies.filter(cookie => 
      cookie.name.includes('sb-') || 
      cookie.name.includes('auth') ||
      cookie.name === 'coverimage_session'
    )
    
    // Try to get session from server client
    const supabase = createServerComponentClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // Get user if session exists
    let user = null
    if (session) {
      const { data: { user: userData } } = await supabase.auth.getUser()
      user = userData
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cookies: {
        total: allCookies.length,
        authRelated: authCookies.map(c => ({
          name: c.name,
          hasValue: !!c.value,
          valueLength: c.value?.length || 0,
          // Only show first 50 chars for security
          valuePreview: c.value ? c.value.substring(0, 50) + '...' : null
        }))
      },
      session: {
        exists: !!session,
        user: session?.user?.email || null,
        expiresAt: session?.expires_at || null,
        accessTokenLength: session?.access_token?.length || 0,
        refreshTokenLength: session?.refresh_token?.length || 0
      },
      user: {
        exists: !!user,
        id: user?.id || null,
        email: user?.email || null,
        provider: user?.app_metadata?.provider || null
      },
      error: error?.message || null
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to debug session',
      message: error.message
    }, { status: 500 })
  }
}