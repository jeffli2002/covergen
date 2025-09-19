'use server'

import { createSupabaseClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function checkAuthSession() {
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
  const supabase = await createSupabaseClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Use the current path or default to the homepage
  const nextPath = currentPath || '/'
  const redirectTo = `${origin}/auth/callback-middleware?next=${encodeURIComponent(nextPath)}`
  
  console.log('[Server Action] OAuth redirect URL:', redirectTo)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo
      // Don't specify queryParams - use default implicit flow
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