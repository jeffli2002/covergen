'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { authConfig } from '@/config/auth.config'

export async function checkAuthSession() {
  // Route to appropriate implementation based on config
  if (authConfig.USE_BESTAUTH) {
    const { validateSession } = await import('@/lib/bestauth')
    const { cookies } = await import('next/headers')
    
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('bestauth.session')
    
    if (!sessionCookie?.value) {
      return { session: null }
    }
    
    const validation = await validateSession(sessionCookie.value)
    
    if (validation.success && validation.data) {
      console.log('[Server Action] BestAuth session found:', validation.data.email)
      return { 
        session: {
          user: validation.data.email,
          id: validation.data.id
        }
      }
    }
    
    return { session: null }
  } else {
    // Fallback to Supabase implementation
    const supabaseAuth = await import('./auth')
    return supabaseAuth.checkAuthSession()
  }
}

export async function signInWithGoogleAction(currentPath?: string) {
  // Route to appropriate implementation based on config
  if (authConfig.USE_BESTAUTH) {
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    // Use the current path or default to the homepage
    const nextPath = currentPath || '/'
    
    // BestAuth OAuth URL
    const oauthUrl = `${origin}/api/auth/oauth/google?redirect=${encodeURIComponent(nextPath)}`
    
    console.log('[Server Action] BestAuth OAuth redirect URL:', oauthUrl)
    
    // Redirect to BestAuth OAuth endpoint
    redirect(oauthUrl)
  } else {
    // Fallback to Supabase implementation
    const supabaseAuth = await import('./auth')
    return supabaseAuth.signInWithGoogleAction(currentPath)
  }
}