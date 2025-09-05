'use client'

import { useEffect, useState } from 'react'

export default function TestEnvPage() {
  const [clientEnv, setClientEnv] = useState<any>({})
  const [serverEnv, setServerEnv] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check client-side environment
    setClientEnv({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'
    })
    
    // Check server-side environment
    fetch('/api/oauth-diagnose')
      .then(res => res.json())
      .then(data => {
        setServerEnv(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch server diagnostics:', err)
        setLoading(false)
      })
  }, [])
  
  const handleTestSupabase = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        alert('Missing Supabase credentials!')
        return
      }
      
      const supabase = createClient(url, key)
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        alert(`Supabase error: ${error.message}`)
      } else {
        alert(`Supabase connected! Session: ${data.session ? 'Active' : 'None'}`)
      }
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Test</h1>
      
      {/* Client-side Environment */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Client-side Environment</h2>
        <div className="space-y-2 font-mono text-sm">
          {Object.entries(clientEnv).map(([key, value]) => (
            <div key={key} className={value === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
              {key}: {value as React.ReactNode}
            </div>
          ))}
        </div>
      </div>
      
      {/* Server-side Environment */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Server-side Diagnostics</h2>
        {loading ? (
          <div>Loading...</div>
        ) : serverEnv ? (
          <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
{JSON.stringify(serverEnv, null, 2)}
          </pre>
        ) : (
          <div className="text-red-600">Failed to load server diagnostics</div>
        )}
      </div>
      
      {/* Test Button */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Manual Test</h2>
        <button
          onClick={handleTestSupabase}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test Supabase Connection
        </button>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-900 mb-2">If variables show "NOT SET":</h3>
        <ol className="list-decimal list-inside space-y-1 text-yellow-800">
          <li>Check that .env.local file exists in the root directory</li>
          <li>Ensure variables start with NEXT_PUBLIC_ for client-side access</li>
          <li>Restart the Next.js dev server after adding environment variables</li>
          <li>Clear browser cache and hard reload the page</li>
        </ol>
      </div>
    </div>
  )
}