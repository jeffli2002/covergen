'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

function AuthSuccessContent() {
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  
  useEffect(() => {
    // Give the auth system time to initialize and detect the session
    const timer = setTimeout(() => {
      checkAuthAndRedirect()
    }, 1000) // Wait 1 second before checking
    
    return () => clearTimeout(timer)
  }, [user, loading])
  
  const checkAuthAndRedirect = () => {
    const next = searchParams.get('next') || '/en'
    
    if (user) {
      console.log('[AuthSuccess] User authenticated:', user.email)
      setRedirecting(true)
      
      // Redirect to the intended page
      setTimeout(() => {
        router.push(next)
      }, 1000)
    } else if (!loading) {
      console.log('[AuthSuccess] No user found after loading')
      setError('Authentication session not found. Please try signing in again.')
    }
  }
  
  // Still loading the auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Completing Sign In...</h1>
            <p className="text-gray-600">Setting up your session...</p>
          </div>
        </div>
      </div>
    )
  }
  
  // User is authenticated
  if (user || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-gray-600 mb-6">
              {user?.email ? `You're signed in as ${user.email}` : 'Redirecting to your page...'}
            </p>
            
            <div className="animate-pulse text-blue-600">
              Redirecting...
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // No user and not loading - show error
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          
          <p className="text-red-600 mb-6">
            {error || 'No active session found. Please sign in again.'}
          </p>
          
          <div className="space-y-3">
            <Link href="/en" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
              Go to Homepage
            </Link>
            
            <button 
              onClick={() => window.location.reload()}
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition"
            >
              Refresh Page
            </button>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            If you continue to have issues, please try clearing your browser cache and cookies.
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