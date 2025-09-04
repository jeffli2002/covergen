'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ClearAuthPage() {
  const [status, setStatus] = useState('Clearing authentication data...')
  const router = useRouter()

  useEffect(() => {
    const clearAuth = async () => {
      try {
        // Clear Supabase session
        await supabase.auth.signOut()
        
        // Clear all localStorage items related to authentication
        const keysToRemove = [
          'coverimage_session',
          'sb-localhost-auth-token',
          'sb-access-token',
          'sb-refresh-token',
          'sb-auth-token',
          // Clear any Supabase-specific keys
          ...Object.keys(localStorage).filter(key => 
            key.startsWith('sb-') || 
            key.includes('supabase') ||
            key.includes('auth') ||
            key.includes('session')
          )
        ]
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
        })
        
        // Clear all sessionStorage
        sessionStorage.clear()
        
        // Clear cookies (what we can access from JavaScript)
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
          }
        })
        
        setStatus('Authentication cleared successfully! Redirecting...')
        
        // Wait a moment to ensure everything is cleared
        setTimeout(() => {
          router.push('/en')
        }, 2000)
        
      } catch (error) {
        console.error('Error clearing auth:', error)
        setStatus('Error clearing authentication. Please try again.')
      }
    }
    
    clearAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Clear Authentication</h1>
        <p className="text-gray-600">{status}</p>
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            To fully test OAuth from scratch, you may also want to:
          </p>
          <ul className="text-sm text-gray-500 mt-2">
            <li>• Sign out of Google in your browser</li>
            <li>• Use an incognito/private window</li>
            <li>• Clear your browser cache</li>
          </ul>
        </div>
      </div>
    </div>
  )
}