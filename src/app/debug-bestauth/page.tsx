'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/BestAuthContext'

export default function DebugBestAuth() {
  const [cookies, setCookies] = useState<string>('')
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie)

    // Check session endpoint
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setSessionData(data)
    } catch (error) {
      console.error('Session check failed:', error)
      setSessionData({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const clearAllCookies = () => {
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
    })
    window.location.reload()
  }

  const testSetCookie = async () => {
    try {
      const response = await fetch('/api/debug/set-test-cookie')
      const data = await response.json()
      console.log('Test cookie response:', data)
      alert('Check console and refresh to see if cookies were set')
    } catch (error) {
      console.error('Test cookie error:', error)
    }
  }

  const testSimpleCookie = async () => {
    try {
      const response = await fetch('/api/debug/simple-cookie-test')
      const data = await response.json()
      console.log('Simple cookie test response:', data)
      
      // Check response headers
      const cookieHeader = response.headers.get('set-cookie')
      console.log('Set-Cookie header:', cookieHeader)
      
      // Refresh cookies display
      setTimeout(() => {
        setCookies(document.cookie)
      }, 100)
    } catch (error) {
      console.error('Simple cookie test error:', error)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">BestAuth Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Auth Context State</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>Loading: {authLoading.toString()}</p>
          <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Session API Response</h2>
        <div className="bg-gray-100 p-4 rounded">
          {loading ? 'Loading...' : JSON.stringify(sessionData, null, 2)}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">All Cookies</h2>
        <div className="bg-gray-100 p-4 rounded overflow-auto">
          <pre>{cookies || 'No cookies found'}</pre>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">BestAuth Session Cookie</h2>
        <div className="bg-gray-100 p-4 rounded">
          {cookies.includes('bestauth.session') ? (
            <p className="text-green-600">✓ bestauth.session cookie found</p>
          ) : (
            <p className="text-red-600">✗ bestauth.session cookie NOT found</p>
          )}
        </div>
      </div>

      <div className="space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
        <button
          onClick={checkSession}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Check Session
        </button>
        <button
          onClick={clearAllCookies}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear All Cookies
        </button>
        <button
          onClick={testSetCookie}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Test Set Cookie
        </button>
        <button
          onClick={testSimpleCookie}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Simple Cookie Test
        </button>
      </div>
    </div>
  )
}