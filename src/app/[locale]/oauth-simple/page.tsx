'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function OAuthSimplePage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')
  
  useEffect(() => {
    // Check URL for OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('code')) {
      setMessage('OAuth callback detected, checking for session...')
    }
  }, [])
  
  const handleSignIn = async () => {
    try {
      setError(null)
      setMessage('Starting OAuth flow...')
      const result = await signInWithGoogle()
      if (result.success) {
        setMessage('Redirecting to Google...')
      } else {
        throw new Error(result.error || 'OAuth failed')
      }
    } catch (error: any) {
      setError(error.message)
      setMessage('')
    }
  }
  
  const handleSignOut = async () => {
    try {
      setError(null)
      setMessage('Signing out...')
      await signOut()
      setMessage('Signed out successfully')
    } catch (error: any) {
      setError(error.message)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple OAuth Test</h1>
        
        {/* Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : user ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ Signed in</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id?.substring(0, 8)}...</p>
            </div>
          ) : (
            <p className="text-gray-600">Not signed in</p>
          )}
          
          {message && (
            <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            {!user ? (
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Sign in with Google
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Sign Out
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="text-sm font-mono space-y-1">
            <p>Auth cookies: {typeof document !== 'undefined' ? document.cookie.split(';').filter(c => c.trim().startsWith('sb-')).length : 0}</p>
            <p>Loading state: {loading ? 'true' : 'false'}</p>
            <p>User present: {user ? 'true' : 'false'}</p>
          </div>
        </div>
        
        {/* Info */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Callback URL:</h3>
          <code className="bg-white px-3 py-1 rounded text-sm">
            {typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback
          </code>
          <p className="mt-2 text-sm text-blue-800">
            Make sure this URL is added to your Supabase project's redirect URLs.
          </p>
          
          <h3 className="font-semibold text-blue-900 mb-2 mt-4">If sign-in fails:</h3>
          <ol className="text-sm text-blue-800 list-decimal list-inside">
            <li>Complete Google sign-in</li>
            <li>Wait for redirect back to this page</li>
            <li>Click "Refresh Page" if not signed in</li>
            <li>Check browser console for errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}