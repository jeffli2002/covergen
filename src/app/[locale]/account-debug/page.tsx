'use client'

import { useState, useEffect } from 'react'
import { useBestAuth } from '@/hooks/useBestAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  params: { locale: string }
}

export default function AccountDebugPage({ params }: Props) {
  const { user, session, loading: authLoading } = useBestAuth()
  const router = useRouter()
  const [accountData, setAccountData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiLogs, setApiLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setApiLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  useEffect(() => {
    if (!authLoading) {
      addLog(`Auth loaded - User: ${user?.email || 'None'}`)
      if (!user) {
        addLog('No user found, redirecting to login...')
        setTimeout(() => {
          router.replace(`/${params.locale}?auth=signin&redirect=/${params.locale}/account-debug`)
        }, 2000)
      } else if (session) {
        addLog('User authenticated, loading account data...')
        loadAccountData()
      }
    }
  }, [authLoading, user, session])

  const loadAccountData = async () => {
    if (!session?.token) {
      addLog('ERROR: No session token available')
      setError('No session token')
      return
    }

    setLoading(true)
    setError(null)
    addLog(`Making API call with token: ${session.token.substring(0, 20)}...`)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        addLog('ERROR: Request timed out after 10 seconds')
      }, 10000)

      const response = await fetch('/api/bestauth/account', {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      addLog(`Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        addLog(`ERROR: ${JSON.stringify(errorData)}`)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      addLog('Success! Data received')
      setAccountData(data)
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`)
      setError(err.message)
      
      // Fallback: Create minimal account data
      if (user) {
        addLog('Using fallback data...')
        setAccountData({
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          },
          subscription: null,
          payments: [],
          usage: {
            today: 0,
            limits: { daily: 3, monthly: 90 }
          }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Account Debug Page</h1>

      {/* API Logs */}
      <Card>
        <CardHeader>
          <CardTitle>API Call Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-1 max-h-60 overflow-y-auto">
            {apiLogs.map((log, i) => (
              <div key={i} className={log.includes('ERROR') ? 'text-red-600' : ''}>
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading account data: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Account Data */}
      {accountData && (
        <Card>
          <CardHeader>
            <CardTitle>Account Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(accountData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={loadAccountData} disabled={loading || !session}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Retry Load'
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/${params.locale}/account`)}
        >
          Go to Account Page
        </Button>
      </div>
    </div>
  )
}