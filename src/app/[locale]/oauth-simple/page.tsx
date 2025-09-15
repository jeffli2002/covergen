'use client'

import { useState } from 'react'

export default function OAuthSimplePage() {
  const [message, setMessage] = useState('')
  
  const testOAuth = () => {
    setMessage('Starting OAuth...')
    // Redirect to Google OAuth
    const redirectUrl = `${window.location.origin}/auth/callback?next=${window.location.pathname}`
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`
    window.location.href = oauthUrl
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple OAuth Test</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>Status: Check if you're signed in by looking for auth cookies</p>
        <p>Auth cookies: {typeof document !== 'undefined' ? document.cookie.split(';').filter(c => c.trim().startsWith('sb-')).length : 0}</p>
      </div>
      
      <button
        onClick={testOAuth}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign in with Google
      </button>
      
      {message && (
        <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded">
          {message}
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-600">
        <p>After signing in, refresh the page to see if cookies are set.</p>
        <p>Callback URL: {typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback</p>
      </div>
    </div>
  )
}