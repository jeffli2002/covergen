/**
 * Unified Auth Solution for Vercel
 * 
 * This module provides a reliable authentication solution that works
 * consistently on Vercel deployments by using server-side verification
 * as the primary method and client-side only for OAuth initiation.
 */

import { createSimpleClient } from '@/lib/supabase/simple-client'
import { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export class VercelAuth {
  private static instance: VercelAuth
  private listeners: Set<(state: AuthState) => void> = new Set()
  private currentState: AuthState = {
    user: null,
    loading: true,
    error: null
  }
  private checkInterval: NodeJS.Timeout | null = null

  static getInstance() {
    if (!VercelAuth.instance) {
      VercelAuth.instance = new VercelAuth()
    }
    return VercelAuth.instance
  }

  private constructor() {
    // Start checking auth state
    this.startAuthCheck()
  }

  private async startAuthCheck() {
    // Initial check
    await this.checkAuth()

    // Check every 5 seconds for auth changes
    this.checkInterval = setInterval(() => {
      this.checkAuth()
    }, 5000)

    // Also check on focus
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.checkAuth())
    }
  }

  private async checkAuth() {
    try {
      // ALWAYS use server API for auth verification
      const response = await fetch('/api/auth/verify')
      const data = await response.json()

      const newState: AuthState = {
        user: data.authenticated ? data.user : null,
        loading: false,
        error: null
      }

      // Only update if state changed
      if (JSON.stringify(newState.user) !== JSON.stringify(this.currentState.user)) {
        this.updateState(newState)
      }
    } catch (error) {
      this.updateState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check auth'
      })
    }
  }

  private updateState(state: AuthState) {
    this.currentState = state
    this.listeners.forEach(listener => listener(state))
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener)
    // Immediately call with current state
    listener(this.currentState)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState() {
    return this.currentState
  }

  async signInWithGoogle() {
    try {
      const supabase = createSimpleClient()
      const currentPath = window.location.pathname
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('[VercelAuth] Sign in error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  }

  async signOut() {
    try {
      // Call server-side sign out
      await fetch('/api/auth/signout', { method: 'POST' })
      
      // Clear client-side session
      const supabase = createSimpleClient()
      await supabase.auth.signOut()
      
      // Update state immediately
      this.updateState({
        user: null,
        loading: false,
        error: null
      })

      return { success: true }
    } catch (error) {
      console.error('[VercelAuth] Sign out error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      }
    }
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    this.listeners.clear()
  }
}