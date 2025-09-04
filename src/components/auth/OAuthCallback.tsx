'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OAuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        if (error) {
          setError(errorDescription || error)
          setStatus('error')
          return
        }

        if (!code) {
          setError('No authorization code found')
          setStatus('error')
          return
        }

        console.log('[OAuthCallback] Processing OAuth code...')

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('[OAuthCallback] Code exchange error:', exchangeError)
          setError(exchangeError.message)
          setStatus('error')
          return
        }

        if (!data.session) {
          setError('No session returned from code exchange')
          setStatus('error')
          return
        }

        console.log('[OAuthCallback] Session established:', data.session.user?.email)
        setStatus('success')

        // Get the stored locale or default to 'en'
        const currentPath = window.location.pathname
        const locale = currentPath.split('/')[1] || 'en'

        // Redirect to the locale-specific home page
        setTimeout(() => {
          router.push(`/${locale}`)
        }, 100)
      } catch (err: any) {
        console.error('[OAuthCallback] Unexpected error:', err)
        setError(err.message || 'An unexpected error occurred')
        setStatus('error')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Completing sign in...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-lg">Sign in successful! Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-lg text-red-500">{error}</p>
            <button
              onClick={() => router.push('/en')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}