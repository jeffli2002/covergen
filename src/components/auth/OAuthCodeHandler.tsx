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
    setDebugInfo((prev: any) => ({ ...prev, effectRan: true }))
    
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
      
      setDebugInfo((prev: any) => ({ 
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
      setDebugInfo((prev: any) => ({ ...prev, status: 'exchanging' }))
      
      try {
        // Exchange the code for a session using PKCE flow
        console.log('[OAuthCodeHandler] Calling exchangeCodeForSession with code:', code.substring(0, 10) + '...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        console.log('[OAuthCodeHandler] Exchange result:', { 
          hasData: !!data, 
          hasSession: !!data?.session,
          error: error?.message 
        })
        
        setDebugInfo((prev: any) => ({ 
          ...prev, 
          status: 'exchange_complete',
          exchangeError: error?.message,
          hasSession: !!data?.session
        }))
        
        if (error) {
          console.error('[OAuthCodeHandler] Failed to exchange code:', error)
          setDebugInfo((prev: any) => ({ 
            ...prev, 
            status: 'exchange_failed',
            error: error.message
          }))
          
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
          
          setDebugInfo((prev: any) => ({ 
            ...prev, 
            status: 'success',
            userEmail: data.session.user.email
          }))
          
          // Clean up URL parameters and redirect to clean URL
          const url = new URL(window.location.href)
          url.searchParams.delete('code')
          url.searchParams.delete('state')
          url.searchParams.delete('scope')
          
          // Wait a moment for state to update
          setTimeout(() => {
            // Redirect to clean URL - the auth state change will be handled by AuthService
            window.location.href = url.toString()
          }, 500)
        } else {
          console.error('[OAuthCodeHandler] No session returned from code exchange')
          setDebugInfo((prev: any) => ({ 
            ...prev, 
            status: 'no_session'
          }))
          
          const url = new URL(window.location.href)
          url.searchParams.delete('code')
          url.searchParams.set('error', 'no_session')
          window.location.href = url.toString()
        }
      } catch (error: any) {
        console.error('[OAuthCodeHandler] Unexpected error:', error)
        setDebugInfo((prev: any) => ({ 
          ...prev, 
          status: 'error',
          error: error.message || 'Unknown error'
        }))
        
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