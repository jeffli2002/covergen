import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase server client
    const supabase = createClient()
    
    // Get all cookies for debugging
    const cookies = request.cookies.getAll()
    const authCookies = cookies.filter(c => c.name.includes('sb-') && c.name.includes('auth-token'))
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Debug information
    return NextResponse.json({
      success: true,
      debug: {
        totalCookies: cookies.length,
        authCookies: authCookies.length,
        cookieNames: cookies.map(c => c.name),
        authCookieNames: authCookies.map(c => c.name)
      },
      session: {
        exists: !!session,
        error: sessionError?.message,
        hasAccessToken: !!session?.access_token,
        hasRefreshToken: !!session?.refresh_token,
        expiresAt: session?.expires_at,
        userEmail: session?.user?.email
      },
      user: {
        exists: !!user,
        error: userError?.message,
        id: user?.id,
        email: user?.email,
        emailVerified: user?.email_confirmed_at,
        lastSignIn: user?.last_sign_in_at
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}