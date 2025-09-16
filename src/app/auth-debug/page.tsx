'use client'

import { useEffect, useState } from 'react'

export default function AuthDebug() {
  const [cookies, setCookies] = useState<string>('')
  const [localStorage, setLocalStorage] = useState<Record<string, any>>({})
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    // Get cookies
    setCookies(document.cookie)

    // Get localStorage items related to Supabase
    const storageData: Record<string, any> = {}
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key && key.includes('supabase')) {
        try {
          const value = window.localStorage.getItem(key)
          storageData[key] = value ? JSON.parse(value) : null
        } catch {
          storageData[key] = window.localStorage.getItem(key)
        }
      }
    }
    setLocalStorage(storageData)

    // Try to get session from localStorage
    const authKey = Object.keys(storageData).find(key => key.includes('auth-token'))
    if (authKey && storageData[authKey]) {
      setSessionInfo(storageData[authKey])
    }
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Information</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Current URL</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Cookies</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {cookies || 'No cookies found'}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Supabase LocalStorage</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(localStorage, null, 2)}
          </pre>
        </section>

        {sessionInfo && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Session Info</h2>
            <div className="bg-green-50 p-4 rounded">
              <p><strong>User:</strong> {sessionInfo.user?.email}</p>
              <p><strong>Provider:</strong> {sessionInfo.user?.app_metadata?.provider}</p>
              <p><strong>Expires:</strong> {sessionInfo.expires_at ? new Date(sessionInfo.expires_at * 1000).toLocaleString() : 'Unknown'}</p>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-3">Environment</h2>
          <div className="bg-gray-100 p-4 rounded text-sm">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Node Env:</strong> {process.env.NODE_ENV}</p>
          </div>
        </section>

        <section className="bg-yellow-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Quick Links:</h3>
          <div className="space-x-4">
            <a href="/oauth-test-complete" className="text-blue-500 hover:underline">
              OAuth Test Page
            </a>
            <a href="/auth/callback?code=test" className="text-blue-500 hover:underline">
              Test Callback Route
            </a>
            <a href="/" className="text-blue-500 hover:underline">
              Home (should redirect to /en)
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}