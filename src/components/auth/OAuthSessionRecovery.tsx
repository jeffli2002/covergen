'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-simple'
import { userSessionService } from '@/services/unified/UserSessionService'

export function OAuthSessionRecovery() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processed = useRef(false)
  
  useEffect(() => {
    async function checkOAuthReturn() {
      // Only run once
      if (processed.current) return
      
      // Check if returning from OAuth
      const isOAuthReturn = searchParams.get('oauth_return') === 'true'
      const error = searchParams.get('error')
      
      if (!isOAuthReturn && !error) return
      
      processed.current = true
      
      console.log('[OAuthRecovery] Checking for OAuth session...', {
        isOAuthReturn,
        error,
        url: window.location.href
      })
      
      if (error) {
        console.error('[OAuthRecovery] OAuth error:', error, searchParams.get('message'))
        return
      }
      
      try {
        // Wait a moment for cookies to be fully set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[OAuthRecovery] Error getting session:', sessionError)
          return
        }
        
        if (session) {
          console.log('[OAuthRecovery] Session found, user:', session.user.email)
          
          // Initialize user session service
          await userSessionService.initialize()
          
          // Clean up URL
          const url = new URL(window.location.href)
          url.searchParams.delete('oauth_return')
          url.searchParams.delete('error')
          url.searchParams.delete('message')
          
          // Replace URL without reload
          window.history.replaceState({}, '', url.toString())
          
          // Force a small delay then reload to ensure everything is synced
          setTimeout(() => {
            window.location.reload()
          }, 500)
        } else {
          console.error('[OAuthRecovery] No session found after OAuth')
          
          // Try one more time after a delay
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              console.log('[OAuthRecovery] Session found on retry')
              window.location.reload()
            }
          }, 1000)
        }
      } catch (error) {
        console.error('[OAuthRecovery] Error:', error)
      }
    }
    
    checkOAuthReturn()
  }, [searchParams, router])
  
  return null
}