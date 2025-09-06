'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleOAuthProvider } from '@/services/auth/providers/googleOAuth'

function GoogleOAuthCompleteContent() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/en'

      if (!code) {
        setStatus('error')
        setError('No authorization code received')
        return
      }

      try {
        const googleOAuth = GoogleOAuthProvider.getInstance()
        const result = await googleOAuth.handleCallback(code)

        if (result.success) {
          setStatus('success')
          
          // Wait a moment for state to propagate
          setTimeout(() => {
            router.push(next)
          }, 1000)
        } else {
          setStatus('error')
          setError(result.error || 'Failed to complete sign in')
        }
      } catch (error: any) {
        console.error('[GoogleOAuthComplete] Error:', error)
        setStatus('error')
        setError(error.message || 'An unexpected error occurred')
      }
    }

    handleOAuthCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Completing Sign In...
              </h1>
              <p className="text-gray-600">
                Please wait while we complete your Google sign in.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Sign In Successful!
              </h1>
              <p className="text-gray-600">
                Redirecting you now...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Sign In Failed
              </h1>
              <p className="text-red-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => router.push('/en?auth=signin')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GoogleOAuthCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <GoogleOAuthCompleteContent />
    </Suspense>
  )
}