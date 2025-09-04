'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import authService from '@/services/authService'

export default function PaymentDebug() {
  const { user } = useAppStore()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const info: any = {
      timestamp: new Date().toISOString()
    }

    try {
      // Check authentication
      info.auth = {
        isAuthenticated: authService.isAuthenticated(),
        user: user ? {
          id: user.id,
          email: user.email
        } : null,
        session: authService.getCurrentSession() ? 'Present' : 'Missing'
      }

      // Check session token
      const session = authService.getCurrentSession()
      info.sessionToken = {
        present: !!session?.access_token,
        length: session?.access_token?.length || 0,
        prefix: session?.access_token?.substring(0, 20) || 'N/A'
      }

      // Test API authentication
      try {
        const response = await fetch('/api/payment/test-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          }
        })
        
        info.apiAuth = {
          status: response.status,
          ok: response.ok,
          data: await response.json()
        }
      } catch (error: any) {
        info.apiAuth = {
          error: error.message
        }
      }

      // Test checkout API (without creating actual session)
      try {
        const response = await fetch('/api/payment/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            planId: 'pro',
            successUrl: 'https://example.com/success',
            cancelUrl: 'https://example.com/cancel'
          })
        })

        info.checkoutAPI = {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        }

        try {
          const data = await response.json()
          info.checkoutAPI.data = data
        } catch {
          info.checkoutAPI.data = 'Could not parse JSON'
        }
      } catch (error: any) {
        info.checkoutAPI = {
          error: error.message
        }
      }

      setDebugInfo(info)
    } catch (error: any) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }

    setLoading(false)
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Payment Flow Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? 'Running Diagnostics...' : 'Run Payment Diagnostics'}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {/* Authentication Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Authenticated:</span>
                      <Badge variant={debugInfo.auth?.isAuthenticated ? 'default' : 'destructive'}>
                        {debugInfo.auth?.isAuthenticated ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>User ID:</span>
                      <span className="font-mono">{debugInfo.auth?.user?.id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span>{debugInfo.auth?.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session:</span>
                      <Badge variant={debugInfo.auth?.session === 'Present' ? 'default' : 'destructive'}>
                        {debugInfo.auth?.session}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session Token */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Session Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Present:</span>
                      <Badge variant={debugInfo.sessionToken?.present ? 'default' : 'destructive'}>
                        {debugInfo.sessionToken?.present ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Length:</span>
                      <span>{debugInfo.sessionToken?.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prefix:</span>
                      <span className="font-mono text-xs">{debugInfo.sessionToken?.prefix}...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Authentication Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">API Authentication Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={debugInfo.apiAuth?.ok ? 'default' : 'destructive'}>
                        {debugInfo.apiAuth?.status || 'Error'}
                      </Badge>
                    </div>
                    <div className="text-xs">
                      <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(debugInfo.apiAuth, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Checkout API Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Checkout API Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={debugInfo.checkoutAPI?.ok ? 'default' : 'destructive'}>
                        {debugInfo.checkoutAPI?.status || 'Error'}
                      </Badge>
                    </div>
                    <div className="text-xs">
                      <pre className="bg-gray-100 p-2 rounded overflow-x-auto max-h-60">
                        {JSON.stringify(debugInfo.checkoutAPI, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-xs text-gray-500">
              Debug run at: {debugInfo.timestamp}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}