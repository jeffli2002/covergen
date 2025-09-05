'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, RefreshCw } from 'lucide-react'

export default function CreemDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/creem-env')
      const data = await response.json()
      setDebugInfo(data)
    } catch (error: any) {
      setDebugInfo({ error: error.message })
    }
    setLoading(false)
  }

  if (!debugInfo && !loading) {
    return (
      <Button 
        onClick={fetchDebugInfo}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Debug Creem Environment
      </Button>
    )
  }

  return (
    <Card className="mt-4 max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Creem Environment Debug</CardTitle>
        <Button 
          onClick={fetchDebugInfo}
          variant="ghost"
          size="sm"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : debugInfo ? (
          <div className="space-y-4">
            {debugInfo.error ? (
              <div className="text-red-600">Error: {debugInfo.error}</div>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Environment Info</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.env?.runtime, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Creem Configuration</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.env?.creemConfig, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Product IDs</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.env?.productIds, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Test Checkout</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.testCheckout, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}