'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/en'
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // Also log to localStorage for debugging
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('oauth-callback-debug', JSON.stringify({
          timestamp: new Date().toISOString(),
          url: window.location.href,
          code: !!code,
          error: error,
          errorDescription: errorDescription
        }))
      }

      console.log('[Client Callback] Processing OAuth callback:', {
        hasCode: !!code,
        hasError: !!error,
        error,
        errorDescription,
        next,
        url: window.location.href
      })

      // Check sessionStorage for PKCE verifier
      const verifierKey = Object.keys(sessionStorage).find(key => 
        key.includes('auth-code-verifier')
      )
      console.log('[Client Callback] PKCE verifier check:', {
        hasVerifier: !!verifierKey,
        verifierKey
      })

      if (error) {
        console.error('[Client Callback] OAuth error:', error, errorDescription)
        router.push(`/en/login?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`)
        return
      }

      if (!code) {
        console.error('[Client Callback] No authorization code')
        router.push('/en/login?error=no_code')
        return
      }

      try {
        // Exchange code for session - this will use the PKCE verifier from sessionStorage
        console.log('[Client Callback] Exchanging code for session...')
        if (!supabase) {
          console.error('[Client Callback] Supabase client is null!')
          router.push('/en/login?error=no_client')
          return
        }
        
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('[Client Callback] Exchange failed:', exchangeError)
          router.push(`/en/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`)
          return
        }

        console.log('[Client Callback] Exchange successful:', {
          hasSession: !!data.session,
          user: data.session?.user?.email
        })

        // Clear the PKCE verifier after successful exchange
        if (verifierKey) {
          sessionStorage.removeItem(verifierKey)
        }

        // Redirect to the original page
        router.push(next)
      } catch (err) {
        console.error('[Client Callback] Unexpected error:', err)
        router.push(`/en/login?error=unexpected&message=${encodeURIComponent(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        )}`)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Completing sign in...</h2>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading...</h2>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}