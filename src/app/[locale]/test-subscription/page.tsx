'use client'

import { useState, useEffect } from 'react'
import { SubscriptionManagement } from '@/components/subscription-management'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function TestSubscriptionPage() {
  const { user, loading: authLoading } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  // Fetch session when user is available
  useEffect(() => {
    if (user) {
      fetch('/api/auth/session')
        .then(res => res.json())
        .then(data => {
          if (data.authenticated && data.session) {
            setSession(data.session)
          }
        })
        .catch(err => console.error('Failed to fetch session:', err))
    }
  }, [user])

  const fetchSubscriptionStatus = async (debug?: string) => {
    if (!session) {
      setError('No session available')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const url = debug 
        ? `/api/bestauth/subscription/status?debug=${debug}`
        : '/api/bestauth/subscription/status'
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        setError(JSON.stringify(data, null, 2))
      } else {
        setSubscriptionData(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Test Subscription Management</h1>
      
      <div className="mb-8">
        <SubscriptionManagement />
      </div>

      <div className="border-t pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Debug Subscription Status</h2>
          <Button onClick={() => setShowDebug(!showDebug)} variant="outline">
            {showDebug ? 'Hide' : 'Show'} Debug Tools
          </Button>
        </div>

        {showDebug && user && session && (
          <>
            <Card className="p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">User Info</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Token:</strong> {session.token.substring(0, 20)}...</p>
            </Card>

            <div className="space-x-2 mb-4">
              <Button 
                onClick={() => fetchSubscriptionStatus()}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Normal Status
              </Button>
              
              <Button 
                onClick={() => fetchSubscriptionStatus('raw')}
                disabled={loading}
                variant="secondary"
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Debug Raw
              </Button>
              
              <Button 
                onClick={() => fetchSubscriptionStatus('auth')}
                disabled={loading}
                variant="secondary"
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Debug Auth
              </Button>
              
              <Button 
                onClick={() => fetchSubscriptionStatus('usage')}
                disabled={loading}
                variant="secondary"
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Debug Usage
              </Button>
            </div>

            {error && (
              <Card className="p-4 mb-4 bg-red-50">
                <h3 className="text-lg font-semibold mb-2 text-red-700">Error</h3>
                <pre className="whitespace-pre-wrap text-sm text-red-600">{error}</pre>
              </Card>
            )}

            {subscriptionData && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Subscription Data</h3>
                <pre className="whitespace-pre-wrap text-sm overflow-auto">
                  {JSON.stringify(subscriptionData, null, 2)}
                </pre>
              </Card>
            )}
          </>
        )}

        {showDebug && (!user || !session) && (
          <Card className="p-4">
            <p className="text-red-500">You must be logged in to use debug tools</p>
          </Card>
        )}
      </div>
    </div>
  )
}