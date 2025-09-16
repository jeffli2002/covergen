'use client'

import { useState, useEffect } from 'react'

export default function OAuthMinimalTest() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  const testOAuth = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      alert('Missing Supabase URL')
      return
    }
    
    const redirectUrl = `${window.location.origin}/auth/callback-production`
    const encodedRedirect = encodeURIComponent(redirectUrl)
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodedRedirect}`
    
    console.log('OAuth URL:', oauthUrl)
    console.log('Redirect URL:', redirectUrl)
    
    window.location.href = oauthUrl
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Minimal OAuth Test</h1>
      
      <div className="mb-4">
        <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
        {mounted && (
          <>
            <p><strong>Current Origin:</strong> {window.location.origin}</p>
            <p><strong>Redirect URL:</strong> {`${window.location.origin}/auth/callback-production`}</p>
          </>
        )}
      </div>
      
      <button
        onClick={testOAuth}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Test Google OAuth (Direct)
      </button>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This bypasses all Supabase client creation and goes directly to the OAuth URL.</p>
        <p>Check browser console for the URLs being used.</p>
      </div>
    </div>
  )
}