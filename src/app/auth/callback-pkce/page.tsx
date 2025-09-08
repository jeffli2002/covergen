'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CallbackPKCE() {
  const router = useRouter()
  
  useEffect(() => {
    // For PKCE, the Supabase client with detectSessionInUrl will automatically
    // handle the code exchange when it detects the code in the URL
    const handleRedirect = async () => {
      // Get the 'next' parameter from URL
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') || '/en'
      
      console.log('[Callback PKCE] Auto-handling OAuth callback, will redirect to:', next)
      
      // Give Supabase client time to process the URL
      setTimeout(() => {
        router.push(next)
      }, 1000)
    }
    
    handleRedirect()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Completing sign in...</h2>
        <p className="mt-2 text-gray-600">Please wait while we authenticate you.</p>
      </div>
    </div>
  )
}