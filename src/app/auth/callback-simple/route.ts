import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getURL } from '@/utils/auth-helpers'

/**
 * Simple OAuth callback handler based on proven patterns
 * This handles the OAuth callback for all environments
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful authentication
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // Local environment: simple redirect
        return NextResponse.redirect(`${getURL()}${next.slice(1)}`)
      } else if (forwardedHost) {
        // Production/Preview: use forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Fallback: use getURL
        return NextResponse.redirect(`${getURL()}${next.slice(1)}`)
      }
    }
  }

  // Auth failed or no code
  return NextResponse.redirect(`${getURL()}auth/error`)
}