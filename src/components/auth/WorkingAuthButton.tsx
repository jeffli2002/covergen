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
      const supabase = createSimpleClient()
      
      // Use getUser instead of getSession
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (!error && user) {
        setUser(user)
      }
      setLoading(false)
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[WorkingAuthButton] Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      })
      
      return () => subscription.unsubscribe()
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
    const supabase = createSimpleClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('[WorkingAuthButton] Sign out error:', error)
    } else {
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