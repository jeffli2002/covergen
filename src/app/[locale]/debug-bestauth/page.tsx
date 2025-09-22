'use client'

import { useState, useEffect } from 'react'
import { useBestAuth } from '@/hooks/useBestAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function DebugBestAuth() {
  const { user, session, loading, error, signOut } = useBestAuth()
  const [apiTest, setApiTest] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    console.log('[DebugBestAuth] Current state:', {
      user,
      session,
      loading,
      error,
      timestamp: new Date().toISOString()
    })
  }, [user, session, loading, error])

  const testAccountAPI = async () => {
    try {
      const response = await fetch('/api/bestauth/account', {
        headers: session?.token ? {
          'Authorization': `Bearer ${session.token}`
        } : {}
      })
      
      const data = await response.json()
      setApiTest({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setApiTest({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleSignOut = async () => {
    const result = await signOut()
    console.log('[DebugBestAuth] Sign out result:', result)
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>BestAuth Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Loading State:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {loading ? 'Loading...' : 'Loaded'}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Error State:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {error || 'No errors'}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">User:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Session:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">localStorage (bestauth_token):</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {typeof window !== 'undefined' ? localStorage.getItem('bestauth_token') : 'SSR'}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button onClick={testAccountAPI}>Test Account API</Button>
            <Button onClick={() => router.push('/en/account')}>Go to Account</Button>
            <Button onClick={handleSignOut} variant="destructive">Sign Out</Button>
          </div>

          {apiTest && (
            <div>
              <h3 className="font-semibold">API Test Result:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}