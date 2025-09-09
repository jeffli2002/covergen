'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CallbackAuto() {
  const router = useRouter()
  
  useEffect(() => {
    // Get the 'next' parameter for redirect after auth
    const params = new URLSearchParams(window.location.search)
    const next = params.get('next') || '/en'
    
    // The Supabase client with detectSessionInUrl: true should automatically
    // handle the OAuth callback when this page loads
    // We just need to wait a moment and redirect
    const timer = setTimeout(() => {
      console.log('[Callback Auto] Redirecting to:', next)
      router.push(next)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Completing sign in...</h2>
        <p className="mt-2 text-gray-600">Please wait while we authenticate you.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}