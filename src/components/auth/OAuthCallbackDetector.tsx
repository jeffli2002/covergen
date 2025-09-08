'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-simple'
import { Suspense } from 'react'

function OAuthCallbackDetectorInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const processed = useRef(false)
  
  useEffect(() => {
    async function checkForOAuthCallback() {
      // Prevent double processing
      if (processed.current) return
      
      // Check if this looks like an OAuth callback
      // Supabase sometimes adds tokens in URL fragments or just redirects to Site URL
      const hasAuthTokens = window.location.hash.includes('access_token') || 
                          window.location.hash.includes('refresh_token')
      const hasErrorInHash = window.location.hash.includes('error=')
      const isVercelPreview = window.location.hostname.includes('vercel.app')
      
      console.log('[OAuthCallbackDetector] Checking for OAuth callback:', {
        url: window.location.href,
        hash: window.location.hash,
        hasAuthTokens,
        hasErrorInHash,
        isVercelPreview,
        searchParams: Object.fromEntries(searchParams.entries())
      })
      
      if (!hasAuthTokens && !hasErrorInHash) {
        // Not an OAuth callback
        return
      }
      
      processed.current = true
      
      try {
        // Check if we have a session (Supabase might have already processed it)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session) {
          console.log('[OAuthCallbackDetector] Session found after OAuth:', {
            user: session.user.email,
            userId: session.user.id
          })
          
          // Clear the hash to clean up the URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          
          // Add success markers and reload
          const url = new URL(window.location.href)
          url.searchParams.set('auth_callback', 'success')
          url.searchParams.set('oauth_detected', 'true')
          
          if (isVercelPreview) {
            url.searchParams.set('vercel_auth', 'true')
          }
          
          // Use replace to avoid adding to history
          router.replace(url.pathname + url.search)
          
          // Force a reload to ensure all components update
          setTimeout(() => {
            window.location.reload()
          }, 100)
        } else if (hasErrorInHash) {
          console.error('[OAuthCallbackDetector] OAuth error in hash:', window.location.hash)
          
          // Extract error from hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const error = hashParams.get('error')
          const errorDescription = hashParams.get('error_description')
          
          // Clear the hash and show error
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          
          const url = new URL(window.location.href)
          url.searchParams.set('error', 'oauth_failed')
          url.searchParams.set('message', errorDescription || error || 'Authentication failed')
          
          router.replace(url.pathname + url.search)
        } else {
          console.log('[OAuthCallbackDetector] No session found, error:', sessionError)
        }
      } catch (error) {
        console.error('[OAuthCallbackDetector] Error processing callback:', error)
      }
    }
    
    checkForOAuthCallback()
  }, [searchParams, router])
  
  return null
}

export function OAuthCallbackDetector() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackDetectorInner />
    </Suspense>
  )
}