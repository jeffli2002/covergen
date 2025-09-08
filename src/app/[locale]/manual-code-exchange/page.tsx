'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function ManualCodeExchange() {
  const [exchanging, setExchanging] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  // Extract code from current URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const code = urlParams.get('code')
  
  const manualExchange = async () => {
    if (!code) {
      setResult({ error: 'No code found in URL' })
      return
    }
    
    setExchanging(true)
    setResult({ status: 'Starting exchange...' })
    
    try {
      console.log('[ManualExchange] Attempting to exchange code:', code.substring(0, 20) + '...')
      
      // Set a timeout for the exchange
      const timeoutId = setTimeout(() => {
        setResult({ error: 'Exchange timeout - took too long' })
        setExchanging(false)
      }, 30000) // 30 second timeout
      
      const startTime = Date.now()
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      clearTimeout(timeoutId)
      
      const duration = Date.now() - startTime
      
      if (error) {
        console.error('[ManualExchange] Exchange error:', error)
        setResult({
          error: error.message,
          errorCode: error.status,
          duration: `${duration}ms`
        })
      } else if (data?.session) {
        console.log('[ManualExchange] Success! Session created')
        setResult({
          success: true,
          user: data.session.user.email,
          provider: data.session.user.app_metadata?.provider,
          expiresAt: data.session.expires_at,
          duration: `${duration}ms`
        })
        
        // Clean URL after success
        setTimeout(() => {
          const cleanUrl = new URL(window.location.href)
          cleanUrl.searchParams.delete('code')
          window.location.href = cleanUrl.toString()
        }, 2000)
      } else {
        setResult({
          error: 'No session returned',
          duration: `${duration}ms`
        })
      }
    } catch (err: any) {
      console.error('[ManualExchange] Unexpected error:', err)
      setResult({
        error: err.message || 'Unknown error',
        stack: err.stack
      })
    } finally {
      setExchanging(false)
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manual Code Exchange</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p className="font-semibold">Current URL:</p>
        <p className="text-xs break-all">{currentUrl}</p>
        
        <p className="font-semibold mt-2">OAuth Code:</p>
        <p className="text-sm font-mono">{code ? code.substring(0, 40) + '...' : 'No code found'}</p>
      </div>
      
      {code && (
        <button
          onClick={manualExchange}
          disabled={exchanging}
          className="mb-6 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {exchanging ? 'Exchanging...' : 'Manually Exchange Code'}
        </button>
      )}
      
      {result && (
        <div className={`p-4 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h2 className="font-bold mb-2">What this does:</h2>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Takes the OAuth code from the URL</li>
          <li>Calls supabase.auth.exchangeCodeForSession()</li>
          <li>Shows the exact result or error</li>
          <li>Includes timing information</li>
        </ol>
        
        <p className="mt-2 text-sm">
          If the exchange hangs, it will timeout after 30 seconds.
        </p>
      </div>
    </div>
  )
}