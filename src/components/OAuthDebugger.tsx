'use client'

import { useEffect, useState } from 'react'

export function OAuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      environment: process.env.NODE_ENV,
      origin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
    
    console.log('🔍 OAuth Debug Info:', info)
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">OAuth Debug Info</h3>
      <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  )
}
