'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/authService'

interface AuthContextType {
  user: any
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signOut: () => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (newPassword: string) => Promise<any>
  getUserUsageToday: () => Promise<number>
  incrementUsage: () => Promise<any>
  getUserSubscription: () => Promise<any>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Initialize auth service and set up listener
    const initAuth = async () => {
      try {
        await authService.initialize()
        
        // Set up auth change handler
        authService.setAuthChangeHandler((newUser) => {
          setUser(newUser)
        })
        
        // Get current user
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()
  }, [])

  const refreshUser = async () => {
    try {
      await authService.initialize()
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('[AuthContext] Error fetching user:', error)
      setUser(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    return await authService.signIn(email, password)
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    return await authService.signUp(email, password, metadata)
  }

  const signInWithGoogle = async () => {
    return await authService.signInWithGoogle()
  }

  const signOut = async () => {
    const result = await authService.signOut()
    if (result.success) {
      router.push('/en')
      router.refresh()
    }
    return result
  }

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email)
  }

  const updatePassword = async (newPassword: string) => {
    return await authService.updatePassword(newPassword)
  }

  const getUserUsageToday = async () => {
    return await authService.getUserUsageToday()
  }

  const incrementUsage = async () => {
    return await authService.incrementUsage()
  }

  const getUserSubscription = async () => {
    return await authService.getUserSubscription()
  }

  const authContextValue: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    getUserUsageToday,
    incrementUsage,
    getUserSubscription,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}