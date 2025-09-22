// BestAuth Context Provider
'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useBestAuth } from '@/hooks/useBestAuth'
import type { User, SignUpData, SignInData } from '@/lib/bestauth/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  signInWithOAuth: (provider: 'google' | 'github') => void
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function BestAuthProvider({ children }: { children: ReactNode }) {
  const auth = useBestAuth()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a BestAuthProvider')
  }
  return context
}