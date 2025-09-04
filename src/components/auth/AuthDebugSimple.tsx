'use client'

import { useAuth } from '@/contexts/AuthContext'

export function AuthDebugSimple() {
  const { user } = useAuth()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleGoogleSignIn = async () => {
    try {
      // Import dynamically to avoid issues
      const authService = (await import('@/services/authService')).default
      const result = await authService.signInWithGoogle()
      console.log('[AuthDebug] Google sign-in result:', result)
    } catch (error) {
      console.error('[AuthDebug] Google sign-in error:', error)
    }
  }

  const handleClearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      window.location.reload()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-red-600 text-white rounded shadow-lg text-sm z-[9999]">
      <div className="font-bold mb-2">🔍 Auth Debug</div>
      
      <div className="mb-2 text-xs">
        User: {user?.email || '❌ Not signed in'}
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleGoogleSignIn}
          className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Google OAuth
        </button>
        <button 
          onClick={handleClearStorage}
          className="bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded text-xs"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}