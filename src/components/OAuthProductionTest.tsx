'use client'

import { useState } from 'react'
import { authServiceV2 } from '@/services/authServiceV2'

export function OAuthProductionTest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // First get debug info
      const debug = await authServiceV2.debugAuthState()
      setDebugInfo(debug)

      // Attempt sign in
      const result = await authServiceV2.signInWithGoogle()
      
      if (!result.success) {
        setError(result.error || 'Sign in failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const clearAuth = async () => {
    await authServiceV2.clearSession()
    setDebugInfo(await authServiceV2.debugAuthState())
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">OAuth Production Test</h2>
      
      {/* Sign In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Loading...' : 'Sign in with Google (V2)'}
      </button>

      {/* Clear Session Button */}
      <button
        onClick={clearAuth}
        className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 mb-4"
      >
        Clear Auth Session
      </button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-gray-50 p-4 rounded text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <pre className="overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Production Checklist */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-semibold mb-1">Production Requirements:</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li>HTTPS protocol required</li>
          <li>Supabase environment variables set</li>
          <li>Redirect URLs configured in Supabase</li>
          <li>Cookies enabled in browser</li>
        </ul>
      </div>
    </div>
  )
}