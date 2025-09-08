'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-simple'

function OAuthCodeHandlerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processingRef = useRef(false)
  const [debugInfo, setDebugInfo] = useState<any>({ mounted: true })
  
  console.log('[OAuthCodeHandler] Component mounted, URL:', typeof window !== 'undefined' ? window.location.href : 'SSR')
  
  useEffect(() => {
    console.log('[OAuthCodeHandler] useEffect running')
    setDebugInfo(prev => ({ ...prev, effectRan: true }))
    
    async function handleOAuthCode() {
      const code = searchParams.get('code')
      const authCallback = searchParams.get('auth_callback')
      
      console.log('[OAuthCodeHandler] Effect running:', { 
        hasCode: !!code, 
        codePrefix: code?.substring(0, 10),
        authCallback,
        isProcessing: processingRef.current,
        url: window.location.href
      })
      
      setDebugInfo(prev => ({ 
        ...prev, 
        hasCode: !!code,
        codePrefix: code?.substring(0, 10),
        isProcessing: processingRef.current
      }))
      
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
  
  // Show debug info if code is present
  if (searchParams.get('code') || process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-20 right-4 bg-purple-100 border border-purple-400 text-purple-700 px-4 py-2 rounded text-xs z-50 max-w-sm">
        <div className="font-semibold">OAuth Handler Debug:</div>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    )
  }
  
  return null
}

export function OAuthCodeHandler() {
  return (
    <Suspense fallback={null}>
      <OAuthCodeHandlerInner />
    </Suspense>
  )
}