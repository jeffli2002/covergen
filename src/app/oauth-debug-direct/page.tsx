'use client'

import { useState, useEffect } from 'react'

export default function OAuthDebugDirect() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    console.log(`[OAuth Debug] ${message}`)
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
  }

  useEffect(() => {
    checkEverything()
  }, [])

  const checkEverything = () => {
    // Check URL
    addLog(`Current URL: ${window.location.href}`)
    addLog(`Has hash: ${window.location.hash}`)
    addLog(`Search params: ${window.location.search}`)

    // Check all cookies
    addLog('=== ALL COOKIES ===')
    const cookies = document.cookie.split(';')
    if (cookies.length === 0 || (cookies.length === 1 && cookies[0] === '')) {
      addLog('No cookies found!')
    } else {
      cookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=')
        addLog(`Cookie: ${name} = ${value ? value.substring(0, 100) + '...' : 'empty'}`)
      })
    }

    // Check localStorage
    addLog('=== LOCAL STORAGE ===')
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        const value = localStorage.getItem(key)
        addLog(`LocalStorage: ${key} = ${value ? value.substring(0, 100) + '...' : 'empty'}`)
      }
    }

    // Check sessionStorage
    addLog('=== SESSION STORAGE ===')
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        const value = sessionStorage.getItem(key)
        addLog(`SessionStorage: ${key} = ${value ? value.substring(0, 100) + '...' : 'empty'}`)
      }
    }
  }

  const testDirectOAuth = async () => {
    addLog('Starting direct OAuth test...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const redirectUrl = `${window.location.origin}/auth/callback?next=/oauth-debug-direct`
    
    addLog(`Supabase URL: ${supabaseUrl}`)
    addLog(`Redirect URL: ${redirectUrl}`)

    // Direct OAuth URL construction
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`
    
    addLog(`OAuth URL: ${oauthUrl}`)
    addLog('Redirecting in 2 seconds...')
    
    setTimeout(() => {
      window.location.href = oauthUrl
    }, 2000)
  }

  const clearAll = () => {
    // Clear all cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    
    // Clear storage
    localStorage.clear()
    sessionStorage.clear()
    
    addLog('Cleared all cookies and storage')
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Debug - Direct</h1>
      
      <div className="space-y-2 mb-8">
        <button
          onClick={checkEverything}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Check Everything
        </button>
        
        <button
          onClick={testDirectOAuth}
          className="px-4 py-2 bg-green-500 text-white rounded ml-2"
        >
          Test Direct OAuth
        </button>
        
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-500 text-white rounded ml-2"
        >
          Clear All & Reload
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-xs overflow-auto">
        <h2 className="font-bold mb-2">Debug Logs:</h2>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  )
}