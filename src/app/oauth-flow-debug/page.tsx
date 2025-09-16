'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OAuthFlowDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  const debugOAuthFlow = async () => {
    try {
      // Get the OAuth URL without redirecting
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          skipBrowserRedirect: true // Don't redirect, just get the URL
        }
      })
      
      if (error) {
        setDebugInfo({ error: error.message })
        return
      }
      
      if (data?.url) {
        const oauthUrl = new URL(data.url)
        const responseType = oauthUrl.searchParams.get('response_type')
        const hasCodeChallenge = oauthUrl.searchParams.has('code_challenge')
        const codeChallengeMethod = oauthUrl.searchParams.get('code_challenge_method')
        
        setDebugInfo({
          fullUrl: data.url,
          responseType: responseType,
          flow: responseType === 'code' ? 'PKCE' : 'Implicit',
          hasCodeChallenge: hasCodeChallenge,
          codeChallengeMethod: codeChallengeMethod,
          isPKCE: responseType === 'code' && hasCodeChallenge,
          redirectUri: decodeURIComponent(oauthUrl.searchParams.get('redirect_uri') || ''),
          searchParams: Object.fromEntries(oauthUrl.searchParams)
        })
      }
    } catch (err) {
      setDebugInfo({ 
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      })
    }
  }
  
  const checkSupabaseConfig = () => {
    // Check if Supabase client has PKCE configured
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAuthConfig: !!(supabase as any).auth,
      // Try to access internal config (might not work in production)
      authOptions: (supabase as any).auth?.options || 'Not accessible'
    }
    
    setDebugInfo(config)
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Flow Debug</h1>
      
      <div className="mb-6 p-4 bg-yellow-50 rounded">
        <h2 className="font-semibold mb-2">Issue:</h2>
        <p className="text-sm">OAuth is using implicit flow (tokens in #hash) instead of PKCE flow (code in ?params)</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={debugOAuthFlow}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Debug OAuth URL Generation
        </button>
        
        <button
          onClick={checkSupabaseConfig}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          Check Supabase Config
        </button>
      </div>
      
      {Object.keys(debugInfo).length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          {debugInfo.flow && (
            <div className={`mt-4 p-4 rounded ${debugInfo.isPKCE ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <p className="font-semibold">{debugInfo.isPKCE ? '✅ Using PKCE Flow' : '❌ Using Implicit Flow'}</p>
              <p className="text-sm mt-1">Response Type: {debugInfo.responseType}</p>
              {debugInfo.hasCodeChallenge && <p className="text-sm">Code Challenge: Present</p>}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Possible Solutions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Check Supabase Dashboard → Settings → Auth → Auth Providers → Google configuration</li>
          <li>Ensure "Use PKCE flow" is enabled in Supabase Auth settings</li>
          <li>The flowType: 'pkce' client config might be overridden by Supabase project settings</li>
          <li>Try clearing browser cache and cookies completely</li>
        </ol>
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        <p>Note: The flow type might be determined by Supabase project settings, not just client configuration.</p>
      </div>
    </div>
  )
}