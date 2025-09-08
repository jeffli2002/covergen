'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CallbackPKCE() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    // Prevent multiple executions
    if (isProcessing) return
    
    const handleCallback = async () => {
      setIsProcessing(true)
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const next = params.get('next') || '/en'
        
        console.log('[Callback PKCE] Processing OAuth callback:', {
          hasCode: !!code,
          next,
          url: window.location.href
        })

        if (!code) {
          setError('No authorization code found')
          setTimeout(() => router.push(`${next}?error=no_code`), 2000)
          return
        }

        // For PKCE flow, we need to manually exchange the code for a session
        console.log('[Callback PKCE] Exchanging code for session...')
        
        // Exchange the code for a session using PKCE
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('[Callback PKCE] Exchange error:', exchangeError)
          setError(`Authentication failed: ${exchangeError.message}`)
          setTimeout(() => router.push(`${next}?error=auth_failed`), 2000)
          return
        }

        if (data?.session) {
          console.log('[Callback PKCE] Session established successfully:', {
            email: data.session.user.email,
            provider: data.session.user.app_metadata?.provider
          })
          
          // Small delay to ensure session is properly stored
          setTimeout(() => {
            console.log('[Callback PKCE] Redirecting to:', next)
            router.push(next)
          }, 100)
        } else {
          console.error('[Callback PKCE] No session in exchange response')
          setError('Authentication incomplete - no session returned')
          setTimeout(() => router.push(`${next}?error=no_session`), 2000)
        }
      } catch (err: any) {
        console.error('[Callback PKCE] Unexpected error:', {
          error: err,
          message: err?.message,
          stack: err?.stack
        })
        setError(`Error: ${err?.message || 'An unexpected error occurred'}`)
        const next = new URLSearchParams(window.location.search).get('next') || '/en'
        setTimeout(() => router.push(`${next}?error=unexpected`), 2000)
      }
    }
    
    handleCallback()
  }, [router, isProcessing])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {error ? 'Authentication Error' : 'Completing sign in...'}
        </h2>
        <p className="mt-2 text-gray-600">
          {error || 'Please wait while we authenticate you.'}
        </p>
        {!error && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  )
}