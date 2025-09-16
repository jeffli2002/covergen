'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({
    loading: true,
    timestamp: new Date().toISOString()
  })

  useEffect(() => {
    const runDebug = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        },
        browser: {
          url: window.location.href,
          origin: window.location.origin,
          protocol: window.location.protocol,
          host: window.location.host,
          pathname: window.location.pathname
        },
        cookies: {
          all: document.cookie,
          supabase: document.cookie
            .split(';')
            .filter(c => c.trim().startsWith('sb-'))
            .map(c => {
              const [name, ...valueParts] = c.trim().split('=')
              const value = valueParts.join('=')
              return {
                name,
                length: value?.length || 0,
                firstChars: value?.substring(0, 20) + '...'
              }
            })
        },
        localStorage: {
          keys: Object.keys(localStorage).filter(k => 
            k.includes('supabase') || k.startsWith('sb-')
          ),
          items: Object.keys(localStorage)
            .filter(k => k.includes('supabase') || k.startsWith('sb-'))
            .reduce((acc, key) => {
              const value = localStorage.getItem(key) || ''
              acc[key] = {
                length: value.length,
                preview: value.substring(0, 50) + '...'
              }
              return acc
            }, {} as any)
        }
      }

      // Check Supabase session
      if (supabase) {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          info.session = {
            exists: !!session,
            error: sessionError?.message,
            details: session ? {
              userId: session.user.id,
              email: session.user.email,
              provider: session.user.app_metadata?.provider,
              hasAccessToken: !!session.access_token,
              hasRefreshToken: !!session.refresh_token,
              expiresAt: session.expires_at,
              expiresIn: session.expires_in
            } : null
          }
        } catch (e: any) {
          info.session = { error: e.message }
        }

        // Check user
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          info.user = {
            exists: !!user,
            error: userError?.message,
            details: user ? {
              id: user.id,
              email: user.email,
              provider: user.app_metadata?.provider,
              createdAt: user.created_at,
              lastSignInAt: user.last_sign_in_at
            } : null
          }
        } catch (e: any) {
          info.user = { error: e.message }
        }
      }

      // Test auth API endpoints
      try {
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        info.apiSession = {
          status: sessionRes.status,
          data: sessionData
        }
      } catch (e: any) {
        info.apiSession = { error: e.message }
      }

      setDebugInfo({ ...info, loading: false })
    }

    runDebug()
  }, [])

  if (debugInfo.loading) {
    return <div className="p-8">Loading debug information...</div>
  }

  const hasAuth = debugInfo.session?.exists || debugInfo.user?.exists

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Information</h1>
      
      <div className="mb-6 p-4 rounded-lg" style={{
        backgroundColor: hasAuth ? '#10b981' : '#ef4444',
        color: 'white'
      }}>
        <h2 className="text-xl font-semibold">
          Auth Status: {hasAuth ? '✅ Authenticated' : '❌ Not Authenticated'}
        </h2>
        {hasAuth && debugInfo.user?.details?.email && (
          <p className="mt-2">Logged in as: {debugInfo.user.details.email}</p>
        )}
      </div>

      <div className="space-y-6">
        <section className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Environment</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo.environment, null, 2)}
          </pre>
        </section>

        <section className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Browser</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo.browser, null, 2)}
          </pre>
        </section>

        <section className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Cookies ({debugInfo.cookies?.supabase?.length || 0} Supabase cookies)</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo.cookies?.supabase || [], null, 2)}
          </pre>
        </section>

        <section className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Session</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo.session, null, 2)}
          </pre>
        </section>

        <section className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">User</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo.user, null, 2)}
          </pre>
        </section>

        <section className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Local Storage</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo.localStorage, null, 2)}
          </pre>
        </section>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Actions:</h3>
        <div className="space-x-4">
          <button 
            onClick={() => window.location.href = '/en'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Home
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => {
              document.cookie.split(';').forEach(c => {
                if (c.trim().startsWith('sb-')) {
                  const eqPos = c.indexOf('=')
                  const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
                  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
                }
              })
              window.location.reload()
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Auth Cookies
          </button>
        </div>
      </div>
    </div>
  )
}