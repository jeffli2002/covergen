'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase-simple'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createSupabaseClient()
        
        // Log the current URL for debugging
        console.log('[Auth Callback] Current URL:', window.location.href)
        console.log('[Auth Callback] Hash:', window.location.hash)
        console.log('[Auth Callback] Search params:', window.location.search)
        
        // Check for error in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const urlError = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')
        
        if (urlError) {
          console.error('[Auth Callback] OAuth error:', urlError, errorDescription)
          setError(`Authentication failed: ${errorDescription || urlError}`)
          setLoading(false)
          
          // Redirect to login with error after 3 seconds
          setTimeout(() => {
            router.push(`/en/login?error=${encodeURIComponent(urlError)}`)
          }, 3000)
          return
        }
        
        // Parse the URL to get session
        // This is crucial - it reads the hash fragment and establishes the session
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[Auth Callback] Session error:', sessionError)
          setError(sessionError.message)
          setLoading(false)
          
          setTimeout(() => {
            router.push('/en/login?error=session_error')
          }, 3000)
          return
        }
        
        // Check if we have a session
        if (data?.session) {
          console.log('[Auth Callback] Session established:', {
            user: data.session.user.email,
            provider: data.session.user.app_metadata?.provider
          })
          
          // Get the redirect destination from URL params
          const params = new URLSearchParams(window.location.search)
          const next = params.get('next') || '/en'
          
          // Redirect to the intended page
          router.push(next)
        } else {
          // If no session but no error, it might be a code exchange
          // Check for authorization code in URL params
          const params = new URLSearchParams(window.location.search)
          const code = params.get('code')
          
          if (code) {
            console.log('[Auth Callback] Found authorization code, exchanging for session...')
            
            // For PKCE flow, we need to exchange the code
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
              console.error('[Auth Callback] Code exchange error:', exchangeError)
              setError(exchangeError.message)
              setLoading(false)
              
              setTimeout(() => {
                router.push('/en/login?error=code_exchange_failed')
              }, 3000)
              return
            }
            
            // After exchange, check session again
            const { data: sessionData } = await supabase.auth.getSession()
            
            if (sessionData?.session) {
              console.log('[Auth Callback] Session established after code exchange')
              const next = params.get('next') || '/en'
              router.push(next)
            } else {
              setError('Failed to establish session after code exchange')
              setLoading(false)
              
              setTimeout(() => {
                router.push('/en/login?error=no_session')
              }, 3000)
            }
          } else {
            // No code, no session, no error in hash - something went wrong
            console.error('[Auth Callback] No session, no code, no error')
            setError('Authentication failed - no session established')
            setLoading(false)
            
            setTimeout(() => {
              router.push('/en/login?error=no_session')
            }, 3000)
          }
        }
      } catch (err) {
        console.error('[Auth Callback] Unexpected error:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        setLoading(false)
        
        setTimeout(() => {
          router.push('/en/login?error=unexpected')
        }, 3000)
      }
    }
    
    handleCallback()
  }, [router])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {loading && (
          <>
            <div className="mb-4">
              <svg
                className="animate-spin h-8 w-8 mx-auto text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-gray-600">Completing sign in...</p>
          </>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-600 font-semibold">Authentication Error</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  )
}