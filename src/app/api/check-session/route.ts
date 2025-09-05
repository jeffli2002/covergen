import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  console.log('[Check Session API] Starting session check')
  
  const response = {
    timestamp: new Date().toISOString(),
    cookies: {} as any,
    session: null as any,
    error: null as any
  }
  
  // Log all cookies
  const cookies = request.cookies.getAll()
  console.log('[Check Session API] All cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })))
  
  response.cookies = {
    count: cookies.length,
    supabaseCookies: cookies.filter(c => c.name.includes('sb-')).map(c => c.name),
    hasCookies: cookies.length > 0
  }
  
  try {
    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = request.cookies.get(name)
            console.log(`[Check Session API] Getting cookie ${name}:`, !!cookie?.value)
            return cookie?.value
          }
        }
      }
    )
    
    // Get session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('[Check Session API] Session result:', {
      hasSession: !!session,
      user: session?.user?.email,
      error: error?.message
    })
    
    if (error) {
      response.error = error.message
    } else if (session) {
      response.session = {
        user: {
          id: session.user.id,
          email: session.user.email,
          provider: session.user.app_metadata?.provider
        },
        expires_at: session.expires_at,
        access_token: session.access_token ? 'present' : 'missing',
        refresh_token: session.refresh_token ? 'present' : 'missing'
      }
    }
  } catch (err) {
    response.error = String(err)
    console.error('[Check Session API] Error:', err)
  }
  
  return NextResponse.json(response)
}