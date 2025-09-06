'use client'

import { createSimpleClient } from '@/lib/supabase/simple-client'
import { Button } from '@/components/ui/button'
import { LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function WorkingAuthButton() {
  const { user, loading, signOut } = useAuth()
  
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
    await signOut()
    window.location.reload()
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