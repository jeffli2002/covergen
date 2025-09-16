'use client'

import { useState } from 'react'
import { signInWithGoogleAction } from '@/app/actions/auth'

export default function TestOAuthChrome() {
  const [status, setStatus] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>({})

  const testOAuth = async () => {
    setStatus('Initiating OAuth...')
    
    // Clear existing cookies first
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    })
    
    // Log browser info
    const browserInfo = {
      userAgent: navigator.userAgent,
      isChrome: /Chrome/.test(navigator.userAgent),
      cookieEnabled: navigator.cookieEnabled,
      currentUrl: window.location.href,
      expectedCallback: `${window.location.origin}/auth/callback`
    }
    
    setDebugInfo(browserInfo)
    
    try {
      const currentPath = window.location.pathname
      await signInWithGoogleAction(currentPath)
      setStatus('Redirecting to Google...')
    } catch (err) {
      setStatus('Error: ' + (err as Error).message)
      console.error('OAuth error:', err)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Chrome Debug Test</h1>
      
      <div className="mb-6 p-4 bg-yellow-100 rounded">
        <h3 className="font-semibold mb-2">Testing OAuth with Chrome-specific debugging</h3>
        <p className="text-sm">This test will clear cookies and initiate OAuth</p>
      </div>
      
      <button
        onClick={testOAuth}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
      >
        Test OAuth Sign In
      </button>
      
      {status && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="font-semibold">{status}</p>
        </div>
      )}
      
      {Object.keys(debugInfo).length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Browser Info:</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Expected Flow:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Clear existing cookies</li>
          <li>Initiate OAuth via server action</li>
          <li>Redirect to Google</li>
          <li>Return to /auth/callback with code</li>
          <li>Exchange code for session</li>
          <li>Redirect to original page</li>
        </ol>
      </div>
      
      <div className="mt-4 p-4 bg-red-50 rounded">
        <h3 className="font-semibold mb-2">If OAuth fails in Chrome:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Check if cookies are blocked in Chrome settings</li>
          <li>Try incognito mode</li>
          <li>Check console for any errors</li>
          <li>Verify the callback URL in network tab</li>
        </ul>
      </div>
    </div>
  )
}