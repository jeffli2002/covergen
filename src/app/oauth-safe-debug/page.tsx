'use client'

import { useEffect, useState } from 'react'

export default function OAuthSafeDebugPage() {
  const [status, setStatus] = useState('Loading...')
  const [envVars, setEnvVars] = useState<any>({})
  
  useEffect(() => {
    try {
      // Simple environment check
      setEnvVars({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'NOT SET',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'NOT SET',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'
      })
      
      setStatus('Environment check complete')
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }, [])
  
  const testSupabaseImport = async () => {
    try {
      setStatus('Testing Supabase import...')
      const { createSupabaseClient } = await import('@/lib/supabase-client')
      setStatus('Supabase import successful!')
      
      // Use singleton client
      const client = createSupabaseClient()
      const { error } = await client.auth.getSession()
      
      if (error) {
        setStatus(`Supabase error: ${error.message}`)
      } else {
        setStatus('Supabase client working!')
      }
    } catch (error) {
      setStatus(`Import/Client error: ${error}`)
    }
  }
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Safe OAuth Debug</h1>
      
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Status: {status}</h3>
      </div>
      
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Environment Variables:</h3>
        <ul>
          <li>SUPABASE_URL: {envVars.url}</li>
          <li>SUPABASE_KEY: {envVars.key}</li>
          <li>SITE_URL: {envVars.siteUrl}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <button 
          onClick={testSupabaseImport}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Test Supabase Import
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#666', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
        <h4>Quick Links:</h4>
        <ul>
          <li><a href="/simple-test">Simple Test Page</a></li>
          <li><a href="/test-env">Environment Test Page</a></li>
          <li><a href="/api/oauth-diagnose">API Diagnostics (JSON)</a></li>
        </ul>
      </div>
    </div>
  )
}