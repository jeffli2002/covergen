/**
 * Integration Tests for OAuth Flow with UserSessionService
 * 
 * Tests the complete OAuth authentication flow including:
 * - Google OAuth sign-in initiation
 * - Session management and token refresh
 * - User profile synchronization
 * - Session expiry handling
 * - Sign-out flow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { userSessionService, type UnifiedUser, type AuthResult } from '@/services/unified/UserSessionService'
import { createClient } from '@/utils/supabase/client'

// Mock Supabase client
vi.mock('@/utils/supabase/client')
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
    refreshSession: vi.fn(),
    getUser: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    upsert: vi.fn()
  })),
  rpc: vi.fn()
}

// Mock window.location
const mockLocation = {
  origin: 'https://test.example.com',
  pathname: '/test'
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg'
  },
  app_metadata: {
    provider: 'google'
  }
}

const mockSession = {
  access_token: 'mock-access-token-1234567890abcdef',
  refresh_token: 'mock-refresh-token-1234567890abcdef',
  expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  user: mockUser
}

const mockUnifiedUser: UnifiedUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  provider: 'google',
  subscription: {
    tier: 'free',
    status: 'active',
    customerId: undefined,
    subscriptionId: undefined,
    currentPeriodEnd: undefined,
    cancelAtPeriodEnd: false,
    trialEndsAt: undefined
  },
  usage: {
    monthly: 0,
    monthlyLimit: 10,
    daily: 0,
    dailyLimit: 3,
    remaining: 3
  },
  session: {
    accessToken: 'mock-access-token-1234567890abcdef',
    refreshToken: 'mock-refresh-token-1234567890abcdef',
    expiresAt: mockSession.expires_at,
    isValid: true
  }
}

describe('OAuth Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    
    // Reset service instance
    userSessionService.destroy()
  })

  afterEach(() => {
    userSessionService.destroy()
  })

  describe('Service Initialization', () => {
    it('should initialize successfully with existing session', async () => {
      // Mock existing session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      // Mock subscription data
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' } // No subscription found
        })
      })

      // Mock usage data
      mockSupabase.rpc.mockResolvedValue({
        data: {
          monthly_usage: 0,
          monthly_limit: 10,
          daily_usage: 0,
          daily_limit: 3,
          remaining_daily: 3,
          can_generate: true
        },
        error: null
      })

      const result = await userSessionService.initialize()

      expect(result).toBe(true)
      expect(mockSupabase.auth.getSession).toHaveBeenCalledOnce()
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledOnce()
      expect(userSessionService.getCurrentUser()).toBeTruthy()
      expect(userSessionService.isAuthenticated()).toBe(true)
    })

    it('should initialize successfully with no existing session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const result = await userSessionService.initialize()

      expect(result).toBe(true)
      expect(userSessionService.getCurrentUser()).toBeNull()
      expect(userSessionService.isAuthenticated()).toBe(false)
    })

    it('should handle initialization errors gracefully', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Network error'))

      const result = await userSessionService.initialize()

      expect(result).toBe(false)
      expect(userSessionService.getCurrentUser()).toBeNull()
    })
  })

  describe('Google OAuth Sign-In', () => {
    beforeEach(async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })
      await userSessionService.initialize()
    })

    it('should initiate Google OAuth sign-in successfully', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        error: null
      })

      const result = await userSessionService.signInWithGoogle()

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://test.example.com/auth/callback?next=%2Ftest',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      })
    })

    it('should handle OAuth errors', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        error: { message: 'OAuth provider error' }
      })

      const result = await userSessionService.signInWithGoogle()

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('OAUTH_SIGNIN_FAILED')
      expect(result.error?.message).toBe('OAuth provider error')
    })

    it('should handle network errors during OAuth', async () => {
      mockSupabase.auth.signInWithOAuth.mockRejectedValue(new Error('Network failure'))

      const result = await userSessionService.signInWithGoogle()

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('OAUTH_SIGNIN_ERROR')
      expect(result.error?.message).toBe('Network failure')
    })
  })

  describe('Session Management', () => {
    let authStateCallback: (event: string, session: any) => Promise<void>

    beforeEach(async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      await userSessionService.initialize()
    })

    it('should handle successful OAuth callback', async () => {
      // Mock subscription and usage data calls
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        }),
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      })

      mockSupabase.rpc.mockResolvedValue({
        data: {
          monthly_usage: 0,
          monthly_limit: 10,
          daily_usage: 0,
          daily_limit: 3,
          remaining_daily: 3,
          can_generate: true
        },
        error: null
      })

      // Simulate OAuth callback with new session
      await authStateCallback('SIGNED_IN', mockSession)

      const currentUser = userSessionService.getCurrentUser()
      expect(currentUser).toBeTruthy()
      expect(currentUser?.id).toBe('user-123')
      expect(currentUser?.email).toBe('test@example.com')
      expect(currentUser?.session.accessToken).toBe('mock-access-token-1234567890abcdef')
    })

    it('should handle sign out event', async () => {
      // First sign in
      await authStateCallback('SIGNED_IN', mockSession)
      expect(userSessionService.isAuthenticated()).toBe(true)

      // Then sign out
      await authStateCallback('SIGNED_OUT', null)

      expect(userSessionService.getCurrentUser()).toBeNull()
      expect(userSessionService.isAuthenticated()).toBe(false)
    })

    it('should refresh session when near expiry', async () => {
      // Set up user with expiring session
      const expiringSession = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) + 300 // 5 minutes from now
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      })

      mockSupabase.rpc.mockResolvedValue({
        data: {
          monthly_usage: 0,
          monthly_limit: 10,
          daily_usage: 0,
          daily_limit: 3,
          remaining_daily: 3,
          can_generate: true
        },
        error: null
      })

      await authStateCallback('SIGNED_IN', expiringSession)

      // Mock successful refresh
      const refreshedSession = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        access_token: 'new-access-token-1234567890abcdef'
      }

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: refreshedSession },
        error: null
      })

      // Trigger session refresh check (internal method test through payment flow)
      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false) // Will fail due to missing Creem service mock, but session should refresh
      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled()
    })
  })

  describe('Sign Out Flow', () => {
    beforeEach(async () => {
      // Initialize with signed in user
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      })

      mockSupabase.rpc.mockResolvedValue({
        data: {
          monthly_usage: 0,
          monthly_limit: 10,
          daily_usage: 0,
          daily_limit: 3,
          remaining_daily: 3
        },
        error: null
      })

      await userSessionService.initialize()
    })

    it('should sign out successfully', async () => {
      expect(userSessionService.isAuthenticated()).toBe(true)

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const result = await userSessionService.signOut()

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(userSessionService.getCurrentUser()).toBeNull()
      expect(userSessionService.isAuthenticated()).toBe(false)
      expect(mockSupabase.auth.signOut).toHaveBeenCalledOnce()
    })

    it('should handle sign out errors', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' }
      })

      const result = await userSessionService.signOut()

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('SIGNOUT_FAILED')
      expect(result.error?.message).toBe('Sign out failed')
    })

    it('should clear user state immediately on sign out', async () => {
      mockSupabase.auth.signOut.mockImplementation(async () => {
        // Simulate slow API response
        await new Promise(resolve => setTimeout(resolve, 100))
        return { error: null }
      })

      const signOutPromise = userSessionService.signOut()

      // User should be cleared immediately, not waiting for API response
      expect(userSessionService.getCurrentUser()).toBeNull()
      expect(userSessionService.isAuthenticated()).toBe(false)

      const result = await signOutPromise
      expect(result.success).toBe(true)
    })
  })

  describe('Event Listeners', () => {
    it('should notify listeners of user state changes', async () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      const unsubscribe1 = userSessionService.subscribe(listener1)
      const unsubscribe2 = userSessionService.subscribe(listener2)

      // Should be called immediately with current state
      expect(listener1).toHaveBeenCalledWith(null)
      expect(listener2).toHaveBeenCalledWith(null)

      // Mock auth state change
      let authStateCallback: (event: string, session: any) => Promise<void>
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      await userSessionService.initialize()

      // Mock user sign in
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      })

      mockSupabase.rpc.mockResolvedValue({
        data: {
          monthly_usage: 0,
          monthly_limit: 10,
          daily_usage: 0,
          daily_limit: 3,
          remaining_daily: 3
        },
        error: null
      })

      vi.clearAllMocks()
      await authStateCallback!('SIGNED_IN', mockSession)

      expect(listener1).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user-123',
        email: 'test@example.com'
      }))
      expect(listener2).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user-123',
        email: 'test@example.com'
      }))

      // Test unsubscribe
      unsubscribe1()
      vi.clearAllMocks()

      await authStateCallback!('SIGNED_OUT', null)

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith(null)

      unsubscribe2()
    })

    it('should handle listener errors gracefully', async () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error')
      })
      const normalListener = vi.fn()

      userSessionService.subscribe(errorListener)
      userSessionService.subscribe(normalListener)

      // Should not throw despite error in listener
      expect(() => {
        userSessionService.subscribe(() => {})
      }).not.toThrow()

      expect(errorListener).toHaveBeenCalled()
      expect(normalListener).toHaveBeenCalled()
    })
  })

  describe('Session Validation', () => {
    it('should validate session quality for payment flows', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      })

      mockSupabase.rpc.mockResolvedValue({
        data: {
          monthly_usage: 0,
          monthly_limit: 10,
          daily_usage: 0,
          daily_limit: 3,
          remaining_daily: 3
        },
        error: null
      })

      await userSessionService.initialize()

      // Mock Creem service to test session validation
      vi.doMock('@/services/payment/creem', () => ({
        creemService: {
          createCheckoutSession: vi.fn().mockResolvedValue({
            success: true,
            sessionId: 'cs_test_123',
            url: 'https://checkout.creem.com/cs_test_123'
          })
        }
      }))

      // This will internally validate session for payment
      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(true) // Should pass session validation
    })

    it('should reject invalid session tokens', async () => {
      // Create user with invalid session token
      const invalidSession = {
        ...mockSession,
        access_token: 'short' // Invalid token format
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: invalidSession },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      })

      mockSupabase.rpc.mockResolvedValue({
        data: {
          monthly_usage: 0,
          monthly_limit: 10,
          daily_usage: 0,
          daily_limit: 3,
          remaining_daily: 3
        },
        error: null
      })

      await userSessionService.initialize()

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_TOKEN')
      expect(result.error?.requiresAuth).toBe(true)
    })
  })
})