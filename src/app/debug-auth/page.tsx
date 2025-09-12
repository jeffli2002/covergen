'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase-client'

export default function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get all cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          if (key) acc[key] = value
          return acc
        }, {} as Record<string, string>)

        // Get session from Supabase
        const supabase = createSupabaseClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        // Get user
        const { data: { user } } = await supabase.auth.getUser()

        setDebugInfo({
          environment: process.env.NODE_ENV,
          url: window.location.href,
          origin: window.location.origin,
          cookies: Object.keys(cookies).filter(key => key.startsWith('sb-')),
          cookieCount: Object.keys(cookies).filter(key => key.startsWith('sb-')).length,
          hasSession: !!session,
          hasUser: !!user,
          userEmail: user?.email || 'None',
          sessionError: error?.message || 'None',
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          timestamp: new Date().toISOString(),
        })
      } catch (error: any) {
        setDebugInfo({
          error: error.message,
          stack: error.stack,
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Check every 2 seconds
    const interval = setInterval(checkAuth, 2000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="p-8">Loading auth debug info...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Information</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
      <div className="mt-8">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
        >
          Refresh Page
        </button>
        
        <button
          onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            alert(session ? 'Session found!' : 'No session found')
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Check Session
        </button>
      </div>
    </div>
  )
}