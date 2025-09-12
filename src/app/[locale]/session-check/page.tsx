'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function SessionCheckPage() {
  const { user, loading } = useAuth()
  const [directSession, setDirectSession] = useState<any>(null)
  const [cookies, setCookies] = useState<string[]>([])
  const [localStorage, setLocalStorage] = useState<any>({})
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkEverything()
  }, [])

  const checkEverything = async () => {
    setIsChecking(true)
    
    // Check direct session from Supabase
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      setDirectSession({
        hasSession: !!session,
        user: session?.user?.email,
        error: error?.message,
        provider: session?.user?.app_metadata?.provider
      })
    } catch (err) {
      setDirectSession({ error: String(err) })
    }
    
    // Check cookies
    if (typeof window !== 'undefined') {
      const allCookies = document.cookie.split(';').map(c => c.trim())
      setCookies(allCookies.filter(c => c.startsWith('sb-')))
      
      // Check localStorage
      const storageData: any = {}
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key && (key.includes('supabase') || key.startsWith('sb-'))) {
          storageData[key] = window.localStorage.getItem(key)?.substring(0, 100) + '...'
        }
      }
      setLocalStorage(storageData)
    }
    
    setIsChecking(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Session Check</h1>
      
      {/* AuthContext Status */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">AuthContext Status</h2>
        <div className="space-y-2">
          <p>Loading: {loading ? '⏳ Yes' : '✅ No'}</p>
          <p>User: {user?.email || '❌ Not authenticated'}</p>
          <p>Has User: {user ? '✅ Yes' : '❌ No'}</p>
        </div>
      </Card>

      {/* Direct Supabase Session */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Direct Supabase Session</h2>
        <div className="space-y-2">
          <p>Has Session: {directSession?.hasSession ? '✅ Yes' : '❌ No'}</p>
          <p>User: {directSession?.user || 'None'}</p>
          <p>Provider: {directSession?.provider || 'None'}</p>
          {directSession?.error && (
            <p className="text-red-600">Error: {directSession.error}</p>
          )}
        </div>
      </Card>

      {/* Auth Cookies */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Auth Cookies</h2>
        <p className="mb-2">Found {cookies.length} auth cookies</p>
        {cookies.length > 0 ? (
          <div className="bg-gray-100 p-3 rounded font-mono text-xs space-y-1">
            {cookies.map((cookie, i) => (
              <p key={i}>{cookie.split('=')[0]}</p>
            ))}
          </div>
        ) : (
          <p className="text-red-600">❌ No auth cookies found</p>
        )}
      </Card>

      {/* LocalStorage */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">LocalStorage Auth Data</h2>
        {Object.keys(localStorage).length > 0 ? (
          <div className="bg-gray-100 p-3 rounded font-mono text-xs space-y-1">
            {Object.entries(localStorage).map(([key, value]) => (
              <div key={key}>
                <p className="font-bold">{key}:</p>
                <p className="text-gray-600 break-all">{String(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No auth data in localStorage</p>
        )}
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex gap-4">
          <Button onClick={checkEverything} disabled={isChecking}>
            {isChecking ? 'Checking...' : 'Refresh Check'}
          </Button>
          {(user || directSession?.hasSession) && (
            <Button onClick={signOut} variant="destructive">
              Sign Out
            </Button>
          )}
        </div>
      </Card>

      {/* Diagnosis */}
      <Card className="p-6 mt-6 bg-yellow-50">
        <h2 className="text-lg font-semibold mb-4">🔍 Quick Diagnosis</h2>
        <div className="space-y-2 text-sm">
          {!user && !directSession?.hasSession && cookies.length === 0 && (
            <>
              <p className="text-red-600 font-bold">❌ No authentication detected</p>
              <p>This means either:</p>
              <ul className="list-disc list-inside ml-4">
                <li>OAuth callback didn't run</li>
                <li>OAuth callback failed to set cookies</li>
                <li>Cookies were blocked by browser/security settings</li>
              </ul>
            </>
          )}
          
          {!user && directSession?.hasSession && (
            <>
              <p className="text-orange-600 font-bold">⚠️ Session exists but AuthContext doesn't see it</p>
              <p>This suggests an issue with the AuthContext initialization</p>
            </>
          )}
          
          {user && directSession?.hasSession && (
            <p className="text-green-600 font-bold">✅ Authentication is working correctly</p>
          )}
          
          {cookies.length > 0 && !directSession?.hasSession && (
            <>
              <p className="text-orange-600 font-bold">⚠️ Cookies exist but no session</p>
              <p>The cookies might be expired or invalid</p>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}