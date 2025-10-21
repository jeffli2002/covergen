'use server'

import { createSupabaseClient } from '@/lib/supabase/server'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authConfig, OAUTH_NEXT_COOKIE_NAME } from '@/config/auth.config'

export async function checkAuthSession() {
  // Use BestAuth implementation if enabled
  if (authConfig.USE_BESTAUTH) {
    const bestAuth = await import('./auth-bestauth')
    return bestAuth.checkAuthSession()
  }
  
  // Otherwise use Supabase implementation
  const supabase = await createSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('[Server Action] Session error:', error)
    return { error: error.message }
  }
  
  if (session) {
    console.log('[Server Action] Session found:', session.user.email)
    return { 
      session: {
        user: session.user.email,
        id: session.user.id
      }
    }
  }
  
  return { session: null }
}

export async function signInWithGoogleAction(currentPath?: string) {
  // Use BestAuth implementation if enabled
  if (authConfig.USE_BESTAUTH) {
    const bestAuth = await import('./auth-bestauth')
    return bestAuth.signInWithGoogleAction(currentPath)
  }
  
  // Otherwise use Supabase implementation
  const supabase = await createSupabaseClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const cookieStore = cookies()
  
  // Use the current path or default to the homepage
  const nextPath = currentPath && currentPath.startsWith('/') ? currentPath : '/'
  const redirectTo = `${origin}/auth/callback`

  // Persist desired redirect for callback resolution
  cookieStore.set({
    name: OAUTH_NEXT_COOKIE_NAME,
    value: encodeURIComponent(nextPath),
    path: '/',
    maxAge: 600,
    sameSite: 'lax',
    secure: origin.startsWith('https'),
  })
  
  console.log('[Server Action] OAuth redirect URL:', redirectTo, 'nextPath:', nextPath)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      // Skip PKCE for broader browser compatibility
      skipBrowserRedirect: false
    }
  })
  
  if (error) {
    console.error('[Server Action] OAuth error:', error)
    return { error: error.message }
  }
  
  if (data?.url) {
    redirect(data.url)
  }
  
  return { error: 'Failed to get OAuth URL' }
}
