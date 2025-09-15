'use server'

import { createSupabaseClient } from '@/lib/supabase/server'
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

export async function signInWithGoogleAction() {
  const supabase = await createSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
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