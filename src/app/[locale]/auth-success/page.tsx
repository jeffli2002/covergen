'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { oauthCompletion } from '@/services/auth/oauth-completion'
import Link from 'next/link'

function AuthSuccessContent() {
  const [user, setUser] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    completeOAuth()
  }, [])
  
  const completeOAuth = async () => {
    console.log('[AuthSuccess] Starting OAuth completion flow')
    setChecking(true)
    setError(null)
    
    const next = searchParams.get('next') || '/en'
    
    try {
      const result = await oauthCompletion.completeOAuthFlow(next, {
        onRetry: (attemptNum) => {
          setAttempt(attemptNum + 1)
        }
      })
      
      if (result.success && result.session) {
        console.log('[AuthSuccess] OAuth flow completed successfully:', {
          user: result.user?.email,
          redirectPath: result.redirectPath
        })
        
        setUser(result.user)
        
        // Redirect to the intended page
        if (result.redirectPath && result.redirectPath !== '/en/auth-success') {
          setTimeout(() => {
            router.push(result.redirectPath!)
          }, 1500)
        }
      } else {
        console.error('[AuthSuccess] OAuth flow failed:', result.error)
        setError(result.error || 'Failed to complete authentication')
      }
    } catch (err: any) {
      console.error('[AuthSuccess] Unexpected error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setChecking(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {checking ? 'Completing Sign In...' : user ? 'Welcome back!' : 'Authentication Status'}
          </h1>
          
          {checking ? (
            <div className="my-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">
                Verifying your session...
                {attempt > 0 && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Attempt {attempt}/5)
                  </span>
                )}
              </p>
            </div>
          ) : user ? (
            <p className="text-gray-600 mb-6">
              You're signed in as {user.email}
            </p>
          ) : error ? (
            <div>
              <p className="text-red-600 mb-4">
                {error}
              </p>
              <button 
                onClick={completeOAuth}
                className="text-blue-600 hover:text-blue-700 underline mb-6"
              >
                Try again
              </button>
            </div>
          ) : (
            <p className="text-red-600 mb-6">
              No active session found. Please try signing in again.
            </p>
          )}
          
          <div className="space-y-3">
            <Link href="/en" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
              Go to Homepage
            </Link>
            
            <Link href="/en/platforms" className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition">
              Create Cover Image
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            The homepage might take a moment to load due to performance optimizations in progress.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
}