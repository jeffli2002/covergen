import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Not needed for GET request
          },
          remove(name: string, options: any) {
            // Not needed for GET request
          }
        }
      }
    )
    
    // Try to get the session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // Also try to get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user: session?.user?.email,
        userId: session?.user?.id,
        expiresAt: session?.expires_at,
        provider: session?.user?.app_metadata?.provider
      },
      user: {
        exists: !!user,
        email: user?.email,
        id: user?.id
      },
      errors: {
        sessionError: error?.message || null,
        userError: userError?.message || null
      },
      cookies: cookieStore.getAll()
        .filter(c => c.name.includes('sb-') || c.name.includes('auth'))
        .map(c => ({ name: c.name, length: c.value?.length || 0 }))
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check session',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}