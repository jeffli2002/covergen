'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-simple'
import { Suspense } from 'react'

function OAuthCodeHandlerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processingRef = useRef(false)
  
  console.log('[OAuthCodeHandler] Component mounted')
  
  useEffect(() => {
    async function handleOAuthCode() {
      const code = searchParams.get('code')
      const authCallback = searchParams.get('auth_callback')
      
      console.log('[OAuthCodeHandler] Effect running:', { 
        hasCode: !!code, 
        authCallback,
        isProcessing: processingRef.current 
      })
      
      // Skip if already processing or no code
      if (!code || processingRef.current) {
        return
      }
      
      // Skip if this is already a callback success redirect
      if (authCallback === 'success') {
        console.log('[OAuthCodeHandler] Already processed callback, skipping')
        return
      }
      
      processingRef.current = true
      
      console.log('[OAuthCodeHandler] Processing OAuth code...')
      
      try {
        // Exchange the code for a session using PKCE flow
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('[OAuthCodeHandler] Failed to exchange code:', error)
          // Clean URL and redirect to home with error
          const url = new URL(window.location.href)
          url.searchParams.delete('code')
          url.searchParams.set('error', 'oauth_failed')
          window.location.href = url.toString()
          return
        }
        
        if (data?.session) {
          console.log('[OAuthCodeHandler] Session established successfully:', {
            user: data.session.user.email,
            provider: data.session.user.app_metadata?.provider
          })
          
          // Clean up URL parameters and redirect to clean URL
          const url = new URL(window.location.href)
          url.searchParams.delete('code')
          url.searchParams.delete('state')
          url.searchParams.delete('scope')
          
          // Redirect to clean URL - the auth state change will be handled by AuthService
          window.location.href = url.toString()
        } else {
          console.error('[OAuthCodeHandler] No session returned from code exchange')
          const url = new URL(window.location.href)
          url.searchParams.delete('code')
          url.searchParams.set('error', 'no_session')
          window.location.href = url.toString()
        }
      } catch (error) {
        console.error('[OAuthCodeHandler] Unexpected error:', error)
        const url = new URL(window.location.href)
        url.searchParams.delete('code')
        url.searchParams.set('error', 'unexpected_error')
        window.location.href = url.toString()
      }
    }
    
    handleOAuthCode()
  }, [searchParams, router])
  
  return null
}

export function OAuthCodeHandler() {
  return (
    <Suspense fallback={null}>
      <OAuthCodeHandlerInner />
    </Suspense>
  )
}