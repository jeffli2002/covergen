'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase-simple'

export default function OAuthProductionDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    checkEnvironment()
    checkSession()
    checkOAuthCallback()
  }, [])

  const checkEnvironment = () => {
    const info = {
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isProduction: process.env.NODE_ENV === 'production',
        currentUrl: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        search: window.location.search,
        protocol: window.location.protocol,
        host: window.location.host,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        timestamp: new Date().toISOString()
      },
      cookies: {
        all: document.cookie,
        authCookies: document.cookie.split(';').filter(c => c.trim().startsWith('sb-')).length,
        cookieNames: document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(name => name.startsWith('sb-'))
      },
      localStorage: {
        keys: Object.keys(localStorage).filter(key => key.includes('supabase') || key.startsWith('sb-')),
        hasAuthToken: localStorage.getItem('sb-exungkcoaihcemcmhqdr-auth-token') !== null
      }
    }
    setDebugInfo(prev => ({ ...prev, ...info }))
  }

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Session check error:', error)
        setDebugInfo(prev => ({ ...prev, sessionError: error.message }))
      } else {
        setSession(session)
        setDebugInfo(prev => ({ 
          ...prev, 
          session: session ? {
            user: session.user.email,
            provider: session.user.app_metadata?.provider,
            expiresAt: new Date(session.expires_at! * 1000).toLocaleString()
          } : null 
        }))
      }
    } catch (err) {
      setDebugInfo(prev => ({ ...prev, sessionError: String(err) }))
    }
  }

  const checkOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    
    setDebugInfo(prev => ({ 
      ...prev, 
      oauthCallback: {
        hasCode: !!code,
        codeLength: code?.length || 0,
        hasError: !!error,
        error: error,
        errorDescription: errorDescription,
        allParams: Object.fromEntries(urlParams)
      }
    }))
  }

  const testOAuthWithDebug = async () => {
    setIsLoading(true)
    
    try {
      // Build the redirect URL
      const currentPath = window.location.pathname
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
      
      console.log('[OAuth Debug] Starting OAuth with redirect URL:', redirectUrl)
      
      // Log to debug info
      setDebugInfo(prev => ({ 
        ...prev, 
        oauthAttempt: {
          redirectUrl,
          timestamp: new Date().toISOString(),
          origin: window.location.origin
        }
      }))

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('[OAuth Debug] Error:', error)
        setDebugInfo(prev => ({ 
          ...prev, 
          oauthError: {
            message: error.message,
            name: error.name,
            status: error.status
          }
        }))
      } else {
        console.log('[OAuth Debug] Success, redirecting...')
      }
    } catch (err) {
      console.error('[OAuth Debug] Exception:', err)
      setDebugInfo(prev => ({ ...prev, oauthException: String(err) }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Production Debug</h1>
      
      {/* Current Session */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Session</h2>
        {session ? (
          <div className="space-y-2">
            <p className="text-green-600">✅ Authenticated</p>
            <p>User: {session.user.email}</p>
            <p>Provider: {session.user.app_metadata?.provider}</p>
          </div>
        ) : (
          <p className="text-red-600">❌ Not authenticated</p>
        )}
      </Card>

      {/* Environment Info */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment</h2>
        <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-1">
          <p className={debugInfo.environment?.isProduction ? 'text-red-600 font-bold' : 'text-green-600'}>
            Mode: {debugInfo.environment?.nodeEnv}
          </p>
          <p>Origin: {debugInfo.environment?.origin}</p>
          <p>Protocol: {debugInfo.environment?.protocol}</p>
          <p>Host: {debugInfo.environment?.host}</p>
          <p>Path: {debugInfo.environment?.pathname}</p>
          {debugInfo.environment?.search && <p>Query: {debugInfo.environment.search}</p>}
        </div>
      </Card>

      {/* OAuth Callback Info */}
      {debugInfo.oauthCallback?.hasCode || debugInfo.oauthCallback?.hasError ? (
        <Card className="p-6 mb-6 border-2 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">OAuth Callback Detected</h2>
          <div className="space-y-2">
            {debugInfo.oauthCallback.hasCode && (
              <p className="text-green-600">✅ OAuth code received (length: {debugInfo.oauthCallback.codeLength})</p>
            )}
            {debugInfo.oauthCallback.hasError && (
              <>
                <p className="text-red-600">❌ OAuth error: {debugInfo.oauthCallback.error}</p>
                {debugInfo.oauthCallback.errorDescription && (
                  <p className="text-red-600 text-sm">{debugInfo.oauthCallback.errorDescription}</p>
                )}
              </>
            )}
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <p className="font-medium">All URL Parameters:</p>
              <pre className="text-xs">{JSON.stringify(debugInfo.oauthCallback.allParams, null, 2)}</pre>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Cookies Info */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Auth Cookies</h2>
        <div className="space-y-2">
          <p>Auth cookies count: {debugInfo.cookies?.authCookies || 0}</p>
          {debugInfo.cookies?.cookieNames?.length > 0 && (
            <div className="bg-gray-100 p-3 rounded">
              <p className="font-medium mb-1">Cookie names:</p>
              {debugInfo.cookies.cookieNames.map((name: string, i: number) => (
                <p key={i} className="text-sm font-mono">{name}</p>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* LocalStorage Info */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">LocalStorage Auth Keys</h2>
        <div className="space-y-2">
          <p>Has auth token: {debugInfo.localStorage?.hasAuthToken ? '✅ Yes' : '❌ No'}</p>
          {debugInfo.localStorage?.keys?.length > 0 && (
            <div className="bg-gray-100 p-3 rounded">
              <p className="font-medium mb-1">Auth-related keys:</p>
              {debugInfo.localStorage.keys.map((key: string, i: number) => (
                <p key={i} className="text-sm font-mono">{key}</p>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* OAuth Test */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">OAuth Test</h2>
        <div className="space-y-4">
          <Button 
            onClick={testOAuthWithDebug}
            disabled={isLoading || !!session}
          >
            {isLoading ? 'Redirecting...' : session ? 'Already Authenticated' : 'Test OAuth Sign In'}
          </Button>
          
          {debugInfo.oauthAttempt && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="font-medium">Last OAuth Attempt:</p>
              <p className="text-sm">Redirect URL: {debugInfo.oauthAttempt.redirectUrl}</p>
              <p className="text-sm">Time: {debugInfo.oauthAttempt.timestamp}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-yellow-50">
        <h2 className="text-xl font-semibold mb-4">🔍 Debugging Steps</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Check if this page URL contains <code>?code=</code> parameter after OAuth redirect</li>
          <li>If yes, but no session, the callback route might not be processing the code</li>
          <li>If no code parameter, check Supabase dashboard redirect URLs</li>
          <li>Expected redirect URL in Supabase: <code className="bg-white px-2 py-1 rounded">{window.location.origin}/auth/callback</code></li>
          <li>Current page URL should be the redirect target after OAuth</li>
        </ol>
      </Card>
    </div>
  )
}