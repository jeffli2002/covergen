'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/'
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      console.log('[OAuth Callback Client] Processing:', {
        hasCode: !!code,
        next,
        error,
        errorDescription
      })

      // Handle OAuth provider errors
      if (error) {
        console.error('[OAuth Callback Client] Provider error:', error, errorDescription)
        router.push(`/auth/error?reason=provider&error=${error}`)
        return
      }

      if (!code) {
        console.error('[OAuth Callback Client] No code parameter received')
        router.push('/auth/error?reason=no_code')
        return
      }

      try {
        setStatus('Creating authentication client...')
        
        // Create the same simple client as used in authService
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
          }
        })
        
        setStatus('Exchanging code for session...')
        
        // This will use the PKCE verifier from sessionStorage
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('[OAuth Callback Client] Exchange error:', exchangeError)
          router.push(`/auth/error?reason=exchange&message=${encodeURIComponent(exchangeError.message)}`)
          return
        }

        console.log('[OAuth Callback Client] Successfully authenticated')
        setStatus('Authentication successful! Redirecting...')

        // Small delay to show success message
        setTimeout(() => {
          router.push(next)
        }, 500)
      } catch (err) {
        console.error('[OAuth Callback Client] Unexpected error:', err)
        router.push('/auth/error?reason=exchange&message=Unexpected error during authentication')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}