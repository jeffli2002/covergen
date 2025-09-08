'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CallbackPKCE() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const handleCallback = async () => {
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

        // The Supabase client with detectSessionInUrl: true will automatically
        // exchange the code for a session when initialized on a page with OAuth params
        // We need to wait for this process to complete
        
        // Check if session was established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[Callback PKCE] Session error:', sessionError)
          setError('Authentication failed')
          setTimeout(() => router.push(`${next}?error=auth_failed`), 2000)
          return
        }

        if (session) {
          console.log('[Callback PKCE] Session established:', session.user.email)
          // Session is established, redirect to the intended page
          router.push(next)
        } else {
          console.log('[Callback PKCE] No session found after callback')
          setError('Authentication incomplete')
          setTimeout(() => router.push(`${next}?error=no_session`), 2000)
        }
      } catch (err) {
        console.error('[Callback PKCE] Unexpected error:', err)
        setError('An unexpected error occurred')
        const next = new URLSearchParams(window.location.search).get('next') || '/en'
        setTimeout(() => router.push(`${next}?error=unexpected`), 2000)
      }
    }
    
    handleCallback()
  }, [router])
  
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