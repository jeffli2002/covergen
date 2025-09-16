'use client'

import { useState } from 'react'
import authService from '@/services/authService'

export default function TestServerOAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('[Test] Initiating Google sign in...')
      const result = await authService.signInWithGoogle()
      
      if (!result.success) {
        setError(result.error || 'Failed to sign in')
        console.error('[Test] Sign in failed:', result.error)
      } else {
        console.log('[Test] Sign in initiated successfully')
      }
    } catch (err: any) {
      console.error('[Test] Unexpected error:', err)
      setError(err.message || 'Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    console.log('[Test] Current user:', currentUser)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Test Server OAuth</h2>
          <p className="mt-2 text-center text-gray-600">
            Testing server-side OAuth implementation
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <button
            onClick={checkAuth}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Check Auth Status
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {user && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold">Authenticated as:</p>
              <p>{user.email}</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Implementation details:</p>
          <ul className="list-disc list-inside mt-1">
            <li>OAuth initiation via server action</li>
            <li>Server-side callback handling</li>
            <li>No PKCE configuration</li>
            <li>Uses @supabase/ssr throughout</li>
          </ul>
        </div>
      </div>
    </div>
  )
}