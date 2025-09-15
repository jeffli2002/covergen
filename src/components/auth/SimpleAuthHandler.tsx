'use client'

import { useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase-client'
import { useRouter, usePathname } from 'next/navigation'

export function SimpleAuthHandler() {
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    const supabase = createSupabaseClient()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[SimpleAuthHandler] Auth event:', event)
      
      if (event === 'SIGNED_IN' && session) {
        console.log('[SimpleAuthHandler] User signed in:', session.user.email)
        // Force a page refresh to ensure all components get the new session
        if (pathname.includes('?code=')) {
          // Remove OAuth params from URL
          const cleanPath = pathname.split('?')[0]
          router.push(cleanPath)
        } else {
          router.refresh()
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[SimpleAuthHandler] User signed out')
        router.refresh()
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[SimpleAuthHandler] Token refreshed')
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])
  
  return null
}