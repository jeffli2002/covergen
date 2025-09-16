import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Log the full request details
  console.log('[OAuth Callback Route] Request received:', {
    url: request.url,
    hasCode: !!code,
    codePrefix: code?.substring(0, 8),
    next,
    error,
    errorDescription,
    headers: {
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent')?.includes('Chrome') ? 'Chrome' : 'Other'
    }
  })

  // Handle OAuth provider errors
  if (error) {
    console.error('[OAuth Callback Route] Provider error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/error?reason=provider&error=${error}`)
  }

  if (code) {
    const supabase = await createSupabaseClient()
    
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      console.log('[OAuth Callback Route] Successfully authenticated, redirecting to:', next)
      
      // URL to redirect to after sign in process completes
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // In development, use the origin directly
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // In production with a proxy (e.g., Vercel), use the forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Fallback to origin
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
    
    console.error('[OAuth Callback Route] Exchange error:', exchangeError)
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange&message=${encodeURIComponent(exchangeError.message)}`)
  }

  // No code provided
  console.error('[OAuth Callback Route] No code parameter received')
  return NextResponse.redirect(`${origin}/auth/error?reason=no_code`)
}