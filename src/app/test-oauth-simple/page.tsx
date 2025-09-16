'use client'

import { useState } from 'react'
import authService from '@/services/authService'

export default function TestOAuthSimple() {
  const [status, setStatus] = useState('')
  
  const testLogin = async () => {
    setStatus('Starting OAuth...')
    
    try {
      // This should redirect to Google
      const result = await authService.signInWithGoogle()
      
      // This will only execute if redirect fails
      if (!result.success) {
        setStatus(`Error: ${result.error}`)
      } else {
        setStatus('Redirecting to Google...')
      }
    } catch (err) {
      setStatus(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple OAuth Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <p className="text-sm">
          This uses the production authService with all fixes applied.
          Click the button to test Google OAuth login.
        </p>
      </div>
      
      <button
        onClick={testLogin}
        className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 text-lg font-semibold w-full"
      >
        Sign in with Google
      </button>
      
      {status && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="font-mono text-sm">{status}</p>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Expected Flow:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Click button → Redirect to Google</li>
          <li>Sign in with Google</li>
          <li>Google redirects to /auth/callback-production with code</li>
          <li>Callback exchanges code for session</li>
          <li>Redirect to home page, signed in</li>
        </ol>
      </div>
      
      <div className="mt-4 p-4 bg-red-50 rounded">
        <p className="text-sm font-semibold">If "without sign in state" error occurs:</p>
        <p className="text-sm">Check browser console and network tab for details</p>
      </div>
    </div>
  )
}