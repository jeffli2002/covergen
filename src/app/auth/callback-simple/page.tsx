'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function CallbackSimple() {
  useEffect(() => {
    // The supabase client with detectSessionInUrl: true will automatically
    // process the OAuth callback when this component mounts
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Get redirect URL from query params
        const params = new URLSearchParams(window.location.search)
        const next = params.get('next') || '/en'
        
        // Use window.location for clean redirect
        window.location.href = next
      }
    })
  }, [])
  
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