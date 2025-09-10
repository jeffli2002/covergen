import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    console.log('[Exchange Code] Received code:', code ? 'present' : 'missing')
    
    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = await createClient()

    // Exchange the code for a session
    console.log('[Exchange Code] Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Exchange Code] Error exchanging code for session:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data?.session || !data?.user) {
      console.error('[Exchange Code] No session or user data received:', { hasSession: !!data?.session, hasUser: !!data?.user })
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    console.log('[Exchange Code] Session created successfully for user:', data.user.email)

    // The session is automatically handled by Supabase's cookie management
    return NextResponse.json({ 
      success: true, 
      user: data.user,
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      }
    })
  } catch (error) {
    console.error('Error in exchange-code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}