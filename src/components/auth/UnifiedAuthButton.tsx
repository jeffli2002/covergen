'use client'

import { Button } from '@/components/ui/button'
import { LogIn, LogOut, User } from 'lucide-react'
import { useVercelAuth } from '@/hooks/useVercelAuth'

export function UnifiedAuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useVercelAuth()

  const handleSignIn = async () => {
    const result = await signInWithGoogle()
    if (!result.success) {
      console.error('[UnifiedAuthButton] Sign in failed:', result.error)
    }
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (!result.success) {
      console.error('[UnifiedAuthButton] Sign out failed:', result.error)
    } else {
      // Force reload to ensure clean state
      window.location.reload()
    }
  }

  if (loading) {
    return <Button disabled size="sm">Loading...</Button>
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
      Sign In with Google
    </Button>
  )
}