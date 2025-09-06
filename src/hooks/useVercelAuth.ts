import { useEffect, useState } from 'react'
import { VercelAuth } from '@/lib/auth/vercel-auth'
import type { AuthState } from '@/lib/auth/vercel-auth'

export function useVercelAuth() {
  const [state, setState] = useState<AuthState>(() => 
    VercelAuth.getInstance().getState()
  )

  useEffect(() => {
    const auth = VercelAuth.getInstance()
    const unsubscribe = auth.subscribe(setState)
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    return VercelAuth.getInstance().signInWithGoogle()
  }

  const signOut = async () => {
    return VercelAuth.getInstance().signOut()
  }

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signInWithGoogle,
    signOut
  }
}