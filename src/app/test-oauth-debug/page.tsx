'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import authService from '@/services/authService'

export default function TestOAuthDebug() {
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [currentSession, setCurrentSession] = useState<any>(null)
  
  const addLog = (log: string) => {
    console.log(`[OAuth Debug] ${log}`)
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${log}`])
  }

  useEffect(() => {
    // Check initial state
    checkInitialState()
  }, [])

  const checkInitialState = async () => {
    addLog('Checking initial state...')
    
    // Check URL for OAuth params
    const url = new URL(window.location.href)
    addLog(`Current URL: ${url.toString()}`)
    addLog(`URL Hash: ${url.hash}`)
    addLog(`URL Search: ${url.search}`)
    
    // Check cookies
    addLog(`Cookies: ${document.cookie}`)
    
    // Check session
    await checkSession()
    
    // Initialize auth service
    try {
      await authService.initialize()
      const user = authService.getCurrentUser()
      addLog(`AuthService user: ${user?.email || 'null'}`)
    } catch (err) {
      addLog(`AuthService init error: ${err}`)
    }
  }
  
  const testGoogleOAuth = async () => {
    try {
      setStatus('Starting Google OAuth...')
      setError('')
      
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectUrl = `${siteUrl}/auth/callback?next=/test-oauth-debug`
      
      addLog(`Site URL: ${siteUrl}`)
      addLog(`Redirect URL: ${redirectUrl}`)
      
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
        setError(error.message)
        addLog(`OAuth error: ${error.message}`)
      } else {
        setStatus('OAuth initiated successfully!')
        addLog(`OAuth initiated, URL: ${data?.url}`)
      }
    } catch (err: any) {
      setError(err.message)
      addLog(`Unexpected error: ${err.message}`)
    }
  }
  
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    addLog(`Session check: ${session ? 'present' : 'null'}`)
    if (session) {
      addLog(`User: ${session.user.email}`)
      setCurrentSession(session)
    }
    setStatus(session ? `Logged in as: ${session.user.email}` : 'Not logged in')
  }

  const signOut = async () => {
    try {
      addLog('Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        addLog(`Sign out error: ${error.message}`)
      } else {
        addLog('Signed out successfully')
        setCurrentSession(null)
        setStatus('Not logged in')
      }
    } catch (err: any) {
      addLog(`Sign out exception: ${err.message}`)
    }
  }
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Debug Page</h1>
      
      <div className="space-y-4 max-w-4xl">
        <div className="p-4 bg-gray-100 rounded">
          <p><strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || 'Not set (using window.location.origin)'}</p>
          <p><strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
          <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p><strong>Session Status:</strong> {currentSession ? `Logged in as ${currentSession.user.email}` : 'Not logged in'}</p>
        </div>
        
        <div className="space-x-4">
          <button 
            onClick={testGoogleOAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Google OAuth
          </button>
          
          <button 
            onClick={checkSession}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Check Session
          </button>

          {currentSession && (
            <button 
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          )}
        </div>
        
        {status && (
          <div className="p-4 bg-green-100 text-green-800 rounded">
            {status}
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        <div className="p-4 bg-gray-50 border rounded">
          <h2 className="font-bold mb-2">Debug Logs:</h2>
          <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-700">{log}</div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-bold mb-2">Required Supabase OAuth Settings:</h2>
          <p className="mb-2">Add these URLs to your Supabase project's Authentication → URL Configuration:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Site URL:</strong> https://covergen.pro</li>
            <li><strong>Redirect URLs:</strong></li>
            <ul className="list-disc pl-5">
              <li>https://covergen.pro/auth/callback</li>
              <li>http://localhost:3000/auth/callback</li>
              <li>http://localhost:3001/auth/callback</li>
            </ul>
          </ul>
          <p className="mt-2 text-sm">Go to: <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/default/auth/url-configuration`} target="_blank" className="text-blue-600 underline">Supabase Dashboard → Authentication → URL Configuration</a></p>
        </div>
      </div>
    </div>
  )
}