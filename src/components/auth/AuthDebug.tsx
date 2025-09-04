'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function AuthDebug() {
  const [cookies, setCookies] = useState<string>('')
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const { user } = useAuth()
  
  const handleManualSessionSet = async () => {
    try {
      console.log('[AuthDebug] Looking for auth cookies...')
      
      // Look for both new format cookies
      const sbCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('sb-exungkcoaihcemcmhqdr-auth-token.0='))
        
      if (sbCookie) {
        const tokenData = sbCookie.split('=')[1]
        const decodedToken = decodeURIComponent(tokenData)
        
        let sessionInfo
        try {
          if (decodedToken.startsWith('base64-')) {
            const base64Part = decodedToken.replace('base64-', '')
            sessionInfo = JSON.parse(atob(base64Part))
          } else {
            sessionInfo = JSON.parse(decodedToken)
          }
          
          console.log('[AuthDebug] Found new format session:', sessionInfo)
          
          if (!supabase) {
            setError('Supabase client not initialized')
            return
          }
          
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: sessionInfo.access_token,
            refresh_token: sessionInfo.refresh_token
          })
          
          if (setSessionError) {
            setError(setSessionError.message)
          } else {
            console.log('[AuthDebug] Session set successfully:', data)
            // Store in localStorage for persistence
            localStorage.setItem('coverimage_session', JSON.stringify(sessionInfo))
            window.location.reload()
          }
          return
        } catch (e) {
          console.error('[AuthDebug] Error parsing new format cookie:', e)
        }
      }
      
      // If new format not found, this is where we'd check for old format
      // But since you have the new format cookies, this shouldn't be needed
      
      setError('No auth token cookie found in expected format')
    } catch (err) {
      console.error('[AuthDebug] Manual session set error:', err)
      setError(err?.toString() || 'Unknown error')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get all cookies and localStorage
        setCookies(document.cookie)
        
        // Get session from Supabase
        if (supabase) {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            setError(error.message)
          } else {
            setSessionData(session)
          }
        } else {
          setError('Supabase client not initialized')
        }
      } catch (err) {
        setError(err?.toString() || 'Unknown error')
      }
    }
    
    checkAuth()
  }, [])

  const handleRefresh = async () => {
    try {
      console.log('[AuthDebug] Attempting hybrid refresh...')
      
      // Import authService dynamically to avoid circular imports
      const authService = (await import('@/services/authService')).default
      
      const success = await authService.refreshAuth()
      console.log('[AuthDebug] Hybrid refresh result:', success)
      
      if (success) {
        // Get updated session
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          setSessionData(session)
        }
        setError('')
        // Optionally reload page for complete UI refresh
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setError('Hybrid refresh failed - no valid session found')
      }
    } catch (err) {
      console.error('[AuthDebug] Hybrid refresh error:', err)
      setError(err?.toString() || 'Unknown error')
    }
  }

  // Always show in development
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black text-white rounded shadow-lg max-w-md overflow-auto max-h-96 text-xs z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      
      <div className="mb-2">
        <strong>Auth Context User:</strong> {user ? user.email : 'null'}
      </div>
      
      <div className="mb-2">
        <strong>Supabase Session:</strong> {sessionData ? sessionData.user?.email : 'null'}
      </div>
      
      <div className="mb-2">
        <strong>Has Auth Cookies:</strong> {cookies.includes('sb-') ? 'Yes' : 'No'}
      </div>
      
      <div className="mb-2">
        <strong>Has Stored Session:</strong> {typeof window !== 'undefined' && localStorage.getItem('coverimage_session') ? 'Yes' : 'No'}
      </div>
      
      <div className="mb-2">
        <strong>Error:</strong> {error || 'None'}
      </div>
      
      <details className="mb-2">
        <summary className="cursor-pointer">All Cookies</summary>
        <pre className="whitespace-pre-wrap break-all mt-1">{cookies}</pre>
      </details>
      
      <div className="flex gap-2">
        <button 
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
        >
          Hybrid Refresh
        </button>
        
        <button 
          onClick={handleManualSessionSet}
          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
        >
          Set Session from Cookies
        </button>
      </div>
    </div>
  )
}