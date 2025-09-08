'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-simple'

export default function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing...')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/en'
      
      console.log('[Auth Callback Handler] Starting client-side processing', {
        hasCode: !!code,
        codePrefix: code?.substring(0, 10),
        next
      })
      
      if (!code) {
        setError('No authorization code received')
        return
      }
      
      try {
        // This will work because the Supabase client has access to the stored code_verifier
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        console.log('[Auth Callback Handler] Exchange result:', {
          success: !error,
          error: error?.message,
          hasSession: !!data?.session
        })
        
        if (error) {
          setError(error.message)
          console.error('[Auth Callback Handler] Exchange failed:', error)
          // Redirect with error
          router.push(`${next}?error=oauth_failed&message=${encodeURIComponent(error.message)}`)
        } else if (data?.session) {
          setStatus('Success! Redirecting...')
          console.log('[Auth Callback Handler] Session established:', {
            user: data.session.user.email,
            provider: data.session.user.app_metadata?.provider
          })
          // Give React time to update before redirect
          setTimeout(() => {
            router.push(next)
          }, 500)
        }
      } catch (err: any) {
        console.error('[Auth Callback Handler] Unexpected error:', err)
        setError(err.message || 'Unexpected error during authentication')
      }
    }
    
    handleCallback()
  }, [searchParams, router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {error ? 'Authentication Failed' : 'Completing Sign In...'}
          </h2>
          {error ? (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-600">{status}</p>
          )}
        </div>
      </div>
    </div>
  )
}