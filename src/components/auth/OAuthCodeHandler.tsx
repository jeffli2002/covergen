'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Suspense } from 'react'

function OAuthCodeHandlerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processingRef = useRef(false)
  
  console.log('[OAuthCodeHandler] Component mounted')
  
  useEffect(() => {
    async function handleOAuthCode() {
      const code = searchParams.get('code')
      
      console.log('[OAuthCodeHandler] Effect running, code:', code ? code.substring(0, 10) + '...' : 'none')
      
      if (!code || processingRef.current) {
        console.log('[OAuthCodeHandler] Skipping:', { hasCode: !!code, isProcessing: processingRef.current })
        return
      }
      
      processingRef.current = true
      
      console.log('[OAuthCodeHandler] Found OAuth code in URL, processing...', {
        code: code.substring(0, 10) + '...',
        url: window.location.href
      })
      
      try {
        const supabase = createClient()
        
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('[OAuthCodeHandler] Failed to exchange code:', error)
          // Redirect to error page
          router.push('/auth/error?error=' + encodeURIComponent(error.message))
          return
        }
        
        if (data?.session) {
          console.log('[OAuthCodeHandler] Session established successfully:', {
            user: data.session.user.email,
            provider: data.session.user.app_metadata?.provider
          })
          
          // Clean up URL and reload to trigger auth state update
          const url = new URL(window.location.href)
          url.searchParams.delete('code')
          
          // Add success marker
          url.searchParams.set('auth_callback', 'success')
          
          // Redirect to clean URL
          window.location.href = url.toString()
        }
      } catch (error) {
        console.error('[OAuthCodeHandler] Unexpected error:', error)
        router.push('/auth/error?error=unexpected_error')
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