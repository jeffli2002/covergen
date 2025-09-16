'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function OAuthHashHandler() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing OAuth response...')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    handleOAuthCallback()
  }, [])
  
  const handleOAuthCallback = async () => {
    try {
      // Check if we have tokens in the hash
      const hash = window.location.hash
      console.log('[Hash Handler] URL hash:', hash)
      
      if (hash && hash.includes('access_token')) {
        setStatus('Found auth tokens in URL, establishing session...')
        
        // Parse the hash parameters
        const hashParams = new URLSearchParams(hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const expiresIn = hashParams.get('expires_in')
        
        if (!accessToken) {
          throw new Error('No access token found in hash')
        }
        
        console.log('[Hash Handler] Tokens found:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          expiresIn
        })
        
        // Create Supabase client and set the session
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        // For implicit flow, we need to manually set the session
        // Since we can't use setSession with just tokens, we'll store them and redirect
        
        // Store tokens in localStorage temporarily
        localStorage.setItem('temp_access_token', accessToken)
        if (refreshToken) {
          localStorage.setItem('temp_refresh_token', refreshToken)
        }
        
        // Get the next parameter from search params
        const searchParams = new URLSearchParams(window.location.search)
        const next = searchParams.get('next') || '/en'
        
        setStatus('Session stored, redirecting...')
        
        // Redirect to a page that can properly establish the session
        router.push(`/auth/establish-session?next=${encodeURIComponent(next)}`)
        
      } else {
        // No hash tokens, check for error
        const searchParams = new URLSearchParams(window.location.search)
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          throw new Error(`OAuth error: ${error} - ${errorDescription}`)
        }
        
        throw new Error('No auth tokens found in URL')
      }
      
    } catch (err) {
      console.error('[Hash Handler] Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Redirect to login with error after delay
      setTimeout(() => {
        router.push('/en/login?error=oauth_failed')
      }, 3000)
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
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
        
        <p className="text-gray-600 mb-2">{status}</p>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded max-w-md">
            <p className="text-red-600 font-semibold">Error</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  )
}