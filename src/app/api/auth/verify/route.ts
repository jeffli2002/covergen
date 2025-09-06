import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase server client
    const supabase = createClient()
    
    // Get the current user session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ 
        authenticated: false,
        error: error?.message || 'No authenticated user'
      })
    }
    
    // Return authenticated user data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_confirmed_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        created_at: user.created_at
      }
    })
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}