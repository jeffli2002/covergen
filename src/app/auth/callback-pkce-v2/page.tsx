'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CallbackPKCEv2() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Initializing...')
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Checking parameters...')
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const next = params.get('next') || '/en'
        
        if (!code) {
          setError('No authorization code found')
          setTimeout(() => router.push(`${next}?error=no_code`), 2000)
          return
        }
        
        setStatus('Loading Supabase client...')
        // Dynamic import to ensure we're in the browser context
        const { supabase } = await import('@/lib/supabase-simple')
        
        // Check if we have the required auth storage
        setStatus('Checking auth storage...')
        const storageKey = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`
        const authStorage = localStorage.getItem(storageKey)
        console.log('[Callback PKCE v2] Auth storage key:', storageKey)
        console.log('[Callback PKCE v2] Has auth storage:', !!authStorage)
        
        // Look for code verifier in the auth storage
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage)
            console.log('[Callback PKCE v2] Auth storage has code_verifier:', !!parsed.code_verifier)
          } catch (e) {
            console.error('[Callback PKCE v2] Error parsing auth storage:', e)
          }
        }
        
        setStatus('Exchanging code for session...')
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('[Callback PKCE v2] Exchange error:', exchangeError)
          
          // If the code verifier is missing, it might be a storage issue
          if (exchangeError.message?.includes('verifier') || exchangeError.message?.includes('PKCE')) {
            setError('Authentication failed: PKCE verification error. Please try signing in again.')
          } else {
            setError(`Authentication failed: ${exchangeError.message}`)
          }
          setTimeout(() => router.push(`${next}?error=auth_failed`), 3000)
          return
        }

        if (data?.session) {
          setStatus('Authentication successful! Redirecting...')
          // Give a moment for the session to be fully established
          setTimeout(() => router.push(next), 500)
        } else {
          setError('No session returned from authentication')
          setTimeout(() => router.push(`${next}?error=no_session`), 2000)
        }
      } catch (err: any) {
        console.error('[Callback PKCE v2] Unexpected error:', err)
        setError(`Error: ${err?.message || 'An unexpected error occurred'}`)
        const next = new URLSearchParams(window.location.search).get('next') || '/en'
        setTimeout(() => router.push(`${next}?error=unexpected`), 2000)
      }
    }
    
    handleCallback()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {error ? 'Authentication Error' : 'Completing Sign In'}
        </h2>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">{status}</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </>
        )}
        
        <p className="mt-6 text-sm text-gray-500">
          If you're not redirected automatically, <a href="/en" className="text-blue-600 hover:text-blue-500">click here</a>.
        </p>
      </div>
    </div>
  )
}