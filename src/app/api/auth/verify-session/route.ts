import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    // Create server-side Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // We're not setting cookies in this verification endpoint
          },
        },
      }
    )
    
    // Check if we have a valid session server-side
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('[Verify Session] Server-side check:', {
      hasSession: !!session,
      hasError: !!error,
      user: session?.user?.email,
      error: error?.message
    })
    
    if (error) {
      return NextResponse.json({
        hasSession: false,
        error: error.message
      }, { status: 200 })
    }
    
    if (!session) {
      return NextResponse.json({
        hasSession: false
      }, { status: 200 })
    }
    
    // Return session data for client to use
    return NextResponse.json({
      hasSession: true,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: {
          id: session.user.id,
          email: session.user.email,
          app_metadata: session.user.app_metadata
        }
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('[Verify Session] Error:', error)
    return NextResponse.json({
      hasSession: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}