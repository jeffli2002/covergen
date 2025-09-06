'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { userSessionService } from '@/services/unified/UserSessionService'

export function SessionRecovery() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recoveryAttempted = useRef(false)
  
  useEffect(() => {
    async function recoverSession() {
      // Check if we need to recover session after OAuth callback
      const authCallback = searchParams.get('auth_callback')
      const authError = searchParams.get('error')
      
      if (authError) {
        console.error('[SessionRecovery] Auth error detected:', authError)
        return
      }
      
      if (authCallback !== 'success' || recoveryAttempted.current) {
        return
      }
      
      recoveryAttempted.current = true
      console.log('[SessionRecovery] Attempting session recovery after OAuth callback...')
      
      try {
        // Wait a bit for cookies to settle
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check Supabase session directly
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[SessionRecovery] Error getting session:', error)
          return
        }
        
        if (session) {
          console.log('[SessionRecovery] Session found:', {
            user: session.user.email,
            userId: session.user.id,
            expiresAt: session.expires_at
          })
          
          // Ensure UserSessionService is synchronized
          const initialized = await userSessionService.initialize()
          if (initialized) {
            console.log('[SessionRecovery] UserSessionService synchronized')
          }
          
          // Force a refresh of the current page to update UI
          const url = new URL(window.location.href)
          url.searchParams.delete('auth_callback')
          url.searchParams.delete('error')
          url.searchParams.delete('message')
          
          // Use replace to avoid adding to history
          router.replace(url.pathname + url.search)
          
          // Also trigger a window reload after a short delay to ensure all components update
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          console.warn('[SessionRecovery] No session found after OAuth callback')
          
          // Try one more time after a longer delay
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              console.log('[SessionRecovery] Session found on retry')
              window.location.reload()
            }
          }, 2000)
        }
      } catch (error) {
        console.error('[SessionRecovery] Error during recovery:', error)
      }
    }
    
    recoverSession()
  }, [searchParams, router])
  
  return null
}