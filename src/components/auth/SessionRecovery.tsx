'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { userSessionService } from '@/services/unified/UserSessionService'
import { VercelSessionBridge } from '@/lib/supabase/session-bridge'
import { Suspense } from 'react'

function SessionRecoveryInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recoveryAttempted = useRef(false)
  
  useEffect(() => {
    async function recoverSession() {
      // Check if we need to recover session after OAuth callback
      const authCallback = searchParams.get('auth_callback')
      const authError = searchParams.get('error')
      const vercelAuth = searchParams.get('vercel_auth')
      
      console.log('[SessionRecovery] Initial check:', {
        authCallback,
        authError,
        vercelAuth,
        recoveryAttempted: recoveryAttempted.current,
        url: window.location.href,
        cookies: document.cookie.substring(0, 200) + '...'
      })
      
      if (authError) {
        console.error('[SessionRecovery] Auth error detected:', authError)
        return
      }
      
      if (authCallback !== 'success' || recoveryAttempted.current) {
        console.log('[SessionRecovery] Skipping recovery:', { authCallback, recoveryAttempted: recoveryAttempted.current })
        return
      }
      
      recoveryAttempted.current = true
      console.log('[SessionRecovery] Attempting session recovery after OAuth callback...')
      
      try {
        const supabase = createClient()
        
        // Detect if running on Vercel preview
        const isVercelPreview = window.location.hostname.includes('vercel.app')
        const isVercelAuth = searchParams.get('vercel_auth') === 'true'
        console.log('[SessionRecovery] Environment check:', {
          hostname: window.location.hostname,
          isVercelPreview,
          isVercelAuth,
          cookies: document.cookie.split('; ').filter(c => c.includes('sb-') || c.includes('auth')).map(c => c.substring(0, 50) + '...')
        })
        
        // First, wait for cookies to be available (important for Vercel redirects)
        if (isVercelPreview && isVercelAuth) {
          console.log('[SessionRecovery] Waiting for Vercel cookies...')
          await VercelSessionBridge.waitForCookies(3000)
        }
        
        // Attempt to recover session using the bridge
        if (isVercelPreview && (isVercelAuth || VercelSessionBridge.hasAuthMarkers())) {
          console.log('[SessionRecovery] Using VercelSessionBridge for recovery...')
          const recovered = await VercelSessionBridge.recoverSession(supabase)
          
          if (recovered) {
            console.log('[SessionRecovery] Session recovered successfully via bridge')
            
            // Ensure UserSessionService is synchronized
            await userSessionService.initialize()
            
            // Clean up URL and reload
            const url = new URL(window.location.href)
            url.searchParams.delete('auth_callback')
            url.searchParams.delete('vercel_auth')
            router.replace(url.pathname + url.search)
            
            setTimeout(() => {
              window.location.reload()
            }, 500)
            return
          }
        }
        
        // Enhanced retry logic for Vercel preview deployments
        const maxRetries = isVercelPreview ? 10 : 5 // More retries for Vercel
        const retryDelays = [100, 300, 500, 800, 1000, 1500, 2000, 2500, 3000, 4000] // Progressive delays
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          // Wait with progressive delays
          await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]))
          
          console.log(`[SessionRecovery] Attempt ${attempt + 1}/${maxRetries} to recover session...`)
          
          // Check for auth callback success marker cookie
          const hasAuthMarker = document.cookie.includes('auth-callback-success')
          const hasVercelMarker = document.cookie.includes('vercel-auth-complete')
          console.log('[SessionRecovery] Auth markers:', { hasAuthMarker, hasVercelMarker })
          
          // Try to get the session
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error(`[SessionRecovery] Attempt ${attempt + 1} error:`, error)
            continue // Try next attempt
          }
          
          if (session) {
            console.log('[SessionRecovery] Session found on attempt', attempt + 1, {
              user: session.user.email,
              userId: session.user.id,
              expiresAt: session.expires_at,
              provider: session.user.app_metadata?.provider,
              isVercelPreview
            })
            
            // Ensure UserSessionService is synchronized
            const initialized = await userSessionService.initialize()
            if (initialized) {
              console.log('[SessionRecovery] UserSessionService synchronized')
            }
            
            // Clean up URL parameters
            const url = new URL(window.location.href)
            url.searchParams.delete('auth_callback')
            url.searchParams.delete('error')
            url.searchParams.delete('message')
            
            // For Vercel previews, add extra delay before reload
            if (isVercelPreview) {
              console.log('[SessionRecovery] Vercel preview detected, waiting for cookie propagation...')
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
            
            // Use replace to avoid adding to history
            router.replace(url.pathname + url.search)
            
            // Trigger window reload to ensure all components update
            setTimeout(() => {
              window.location.reload()
            }, 500)
            
            return // Success, exit the function
          }
          
          console.log(`[SessionRecovery] No session found on attempt ${attempt + 1}`)
          
          // On Vercel preview, try refreshing the auth state on attempt 3
          if (isVercelPreview && attempt === 2) {
            console.log('[SessionRecovery] Attempting auth refresh on Vercel preview')
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
              if (refreshData?.session) {
                console.log('[SessionRecovery] Session found after refresh!')
                continue // Let the next iteration handle it
              }
              if (refreshError) {
                console.log('[SessionRecovery] Refresh attempt failed:', refreshError)
              }
            } catch (refreshError) {
              console.log('[SessionRecovery] Refresh attempt error:', refreshError)
            }
          }
        }
        
        // All retries exhausted
        console.error('[SessionRecovery] Failed to recover session after', maxRetries, 'attempts')
        console.log('[SessionRecovery] Debug info:', {
          cookies: document.cookie,
          authCookies: document.cookie.split('; ').filter(c => c.includes('sb-') || c.includes('supabase')),
          origin: window.location.origin
        })
        
        // Show an error to the user
        const url = new URL(window.location.href)
        url.searchParams.delete('auth_callback')
        url.searchParams.set('error', 'session_recovery_failed')
        url.searchParams.set('message', 'Unable to establish session. Please try signing in again.')
        router.replace(url.pathname + url.search)
      } catch (error) {
        console.error('[SessionRecovery] Error during recovery:', error)
      }
    }
    
    recoverSession()
  }, [searchParams, router])
  
  return null
}

export function SessionRecovery() {
  return (
    <Suspense fallback={null}>
      <SessionRecoveryInner />
    </Suspense>
  )
}