'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AuthSuccessPage() {
  const [user, setUser] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    console.log('[AuthSuccess] Checking session...')
    setChecking(true)
    
    // Give the auth state a moment to settle
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('[AuthSuccess] Session check:', { hasSession: !!session, user: session?.user?.email, error })
    
    if (session) {
      setUser(session.user)
      
      // Check for redirect parameter
      const next = searchParams.get('next')
      if (next && next !== '/en/auth-success') {
        console.log('[AuthSuccess] Redirecting to:', next)
        setTimeout(() => {
          router.push(next)
        }, 1500)
      }
    }
    
    setChecking(false)
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
              <p className="text-gray-600 mt-4">Verifying your session...</p>
            </div>
          ) : user ? (
            <p className="text-gray-600 mb-6">
              You're signed in as {user.email}
            </p>
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