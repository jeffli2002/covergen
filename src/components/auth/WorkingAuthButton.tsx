'use client'

import { useState, useEffect } from 'react'
import { createSimpleClient } from '@/lib/supabase/simple-client'
import { Button } from '@/components/ui/button'
import { LogIn, LogOut, User } from 'lucide-react'

export function WorkingAuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function checkUser() {
      try {
        // First try manual auth check to bypass hanging Supabase client
        const response = await fetch('/api/debug/manual-auth-check')
        const data = await response.json()
        
        if (data.userApiResponse?.status === 200 && data.userApiResponse?.data?.id) {
          setUser(data.userApiResponse.data)
          setLoading(false)
          return
        }
      } catch (err) {
        console.log('[WorkingAuthButton] Manual auth check failed, falling back to client')
      }
      
      // Fallback to client with timeout
      try {
        const supabase = createSimpleClient()
        
        // Use Promise.race with timeout
        const result = await Promise.race([
          supabase.auth.getUser(),
          new Promise<{ data: { user: null }, error: Error }>((resolve) => 
            setTimeout(() => resolve({ 
              data: { user: null }, 
              error: new Error('getUser timeout') 
            }), 3000)
          )
        ])
        
        const { data: { user }, error } = result
        
        if (!error && user) {
          setUser(user)
        }
      } catch (err) {
        console.error('[WorkingAuthButton] Client check error:', err)
      }
      
      setLoading(false)
    }
    
    checkUser()
  }, [])
  
  const handleSignIn = async () => {
    const supabase = createSimpleClient()
    const currentPath = window.location.pathname
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
      }
    })
    
    if (error) {
      console.error('[WorkingAuthButton] Sign in error:', error)
    }
  }
  
  const handleSignOut = async () => {
    try {
      const supabase = createSimpleClient()
      await supabase.auth.signOut()
      setUser(null)
      
      // Clear all auth-related cookies
      document.cookie.split(';').forEach(cookie => {
        if (cookie.includes('sb-') || cookie.includes('auth-')) {
          const name = cookie.split('=')[0].trim()
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
      
      window.location.reload()
    } catch (error) {
      console.error('[WorkingAuthButton] Sign out error:', error)
      setUser(null)
      window.location.reload()
    }
  }
  
  if (loading) {
    return <Button disabled>Loading...</Button>
  }
  
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <User className="w-4 h-4" />
          {user.email}
        </span>
        <Button onClick={handleSignOut} variant="outline" size="sm">
          <LogOut className="w-4 h-4 mr-1" />
          Sign Out
        </Button>
      </div>
    )
  }
  
  return (
    <Button onClick={handleSignIn} variant="default" size="sm">
      <LogIn className="w-4 h-4 mr-1" />
      Sign In
    </Button>
  )
}