'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackAuto() {
  const router = useRouter()

  useEffect(() => {
    // Extract the 'next' parameter to know where to redirect
    const urlParams = new URLSearchParams(window.location.search)
    const next = urlParams.get('next') || '/'

    // Give Supabase a moment to process the auth callback
    // The supabase client with detectSessionInUrl: true will automatically handle the code exchange
    const timer = setTimeout(() => {
      console.log('[Auth Callback Auto] Redirecting to:', next)
      router.push(next)
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}