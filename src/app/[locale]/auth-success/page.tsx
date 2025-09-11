'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

function AuthSuccessContent() {
  const [user, setUser] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Check auth immediately on mount
    checkAuth()
    
    // Also listen for auth state changes as backup
    const supabase = createClient()
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthSuccess] Auth state changed:', event, session?.user?.email)
      
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session) {
        setUser(session.user)
        setChecking(false)
        
        // Handle redirect
        const next = searchParams.get('next')
        if (next && next !== '/en/auth-success') {
          console.log('[AuthSuccess] Redirecting to:', next)
          // Handle both relative and absolute URLs
          if (next.startsWith('http')) {
            // Extract pathname from full URL
            try {
              const url = new URL(next)
              router.push(url.pathname + url.search + url.hash)
            } catch {
              // Fallback to the next value if URL parsing fails
              router.push(next)
            }
          } else {
            router.push(next)
          }
        } else {
          console.log('[AuthSuccess] Redirecting to home')
          router.push('/en')
        }
      }
    })
    
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [searchParams, router])
  
  const checkAuth = async () => {
    console.log('[AuthSuccess] Checking session...')
    setChecking(true)
    
    const supabase = createClient()
    let retryCount = 0
    const maxRetries = 5
    
    // Retry logic to wait for session to be established
    while (retryCount < maxRetries) {
      console.log(`[AuthSuccess] Session check attempt ${retryCount + 1}/${maxRetries}`)
      
      // Give the auth state time to settle
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Check session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('[AuthSuccess] Session check result:', { 
        attempt: retryCount + 1,
        hasSession: !!session, 
        user: session?.user?.email, 
        error: error?.message
      })
      
      if (session) {
        setUser(session.user)
        
        // Check for redirect parameter and redirect immediately
        const next = searchParams.get('next')
        if (next && next !== '/en/auth-success') {
          console.log('[AuthSuccess] Redirecting to:', next)
          // Handle both relative and absolute URLs
          if (next.startsWith('http')) {
            // Extract pathname from full URL
            try {
              const url = new URL(next)
              router.push(url.pathname + url.search + url.hash)
            } catch {
              // Fallback to the next value if URL parsing fails
              router.push(next)
            }
          } else {
            router.push(next)
          }
        } else {
          // Default redirect to home after successful auth
          console.log('[AuthSuccess] Redirecting to home')
          router.push('/en')
        }
        
        setChecking(false)
        return
      }
      
      retryCount++
    }
    
    // If we get here, session was not established after retries
    console.error('[AuthSuccess] Failed to establish session after', maxRetries, 'attempts')
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