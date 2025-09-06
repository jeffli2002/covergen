/**
 * Integration Tests for Payment Flow with Session Validation
 * 
 * Tests the complete payment flow including:
 * - Session-aware checkout creation
 * - Customer mapping validation
 * - Portal access with session validation
 * - Payment error handling with session context
 * - Session refresh during payment flows
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { userSessionService, type UnifiedUser } from '@/services/unified/UserSessionService'
import { createClient } from '@/utils/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

// Mock dependencies
vi.mock('@/utils/supabase/client')
vi.mock('@/services/payment/creem')
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn()
}))

const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    refreshSession: vi.fn(),
    signOut: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn().mockReturnThis()
  })),
  rpc: vi.fn()
}

const mockCreemService = {
  createCheckoutSession: vi.fn(),
  createPortalSession: vi.fn(),
  verifyWebhookSignature: vi.fn()
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
  expires_at: Math.floor(Date.now() / 1000) + 3600,
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
    monthly: 2,
    monthlyLimit: 10,
    daily: 1,
    dailyLimit: 3,
    remaining: 2
  },
  session: {
    accessToken: 'mock-access-token-1234567890abcdef',
    refreshToken: 'mock-refresh-token-1234567890abcdef',
    expiresAt: mockSession.expires_at,
    isValid: true
  }
}

describe('Payment Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    vi.doMock('@/services/payment/creem', () => ({
      creemService: mockCreemService
    }))
    
    // Reset service instance
    userSessionService.destroy()
  })

  afterEach(() => {
    userSessionService.destroy()
  })

  async function setupAuthenticatedUser() {
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
        monthly_usage: 2,
        monthly_limit: 10,
        daily_usage: 1,
        daily_limit: 3,
        remaining_daily: 2,
        can_generate: true
      },
      error: null
    })

    await userSessionService.initialize()
  }

  describe('Checkout Session Creation', () => {
    it('should create checkout session with valid session', async () => {
      await setupAuthenticatedUser()

      mockCreemService.createCheckoutSession.mockResolvedValue({
        success: true,
        sessionId: 'cs_test_123',
        url: 'https://checkout.creem.com/cs_test_123'
      })

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(true)
      expect(result.url).toBe('https://checkout.creem.com/cs_test_123')
      expect(result.sessionId).toBe('cs_test_123')

      expect(mockCreemService.createCheckoutSession).toHaveBeenCalledWith({
        userId: 'user-123',
        userEmail: 'test@example.com',
        planId: 'pro',
        successUrl: expect.stringContaining('/payment/success?plan=pro&user=user-123'),
        cancelUrl: expect.stringContaining('/payment/cancel?plan=pro'),
        currentPlan: 'free'
      })
    })

    it('should reject checkout for unauthenticated user', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      await userSessionService.initialize()

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.requiresAuth).toBe(true)
      expect(mockCreemService.createCheckoutSession).not.toHaveBeenCalled()
    })

    it('should refresh session before checkout if near expiry', async () => {
      // Mock session that expires soon
      const expiringSoon = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) + 300 // 5 minutes
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: expiringSoon },
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
          monthly_usage: 2,
          monthly_limit: 10,
          daily_usage: 1,
          daily_limit: 3,
          remaining_daily: 2
        },
        error: null
      })

      await userSessionService.initialize()

      // Mock successful refresh
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockCreemService.createCheckoutSession.mockResolvedValue({
        success: true,
        sessionId: 'cs_test_123',
        url: 'https://checkout.creem.com/cs_test_123'
      })

      const result = await userSessionService.createCheckoutSession('pro')

      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })

    it('should handle session refresh failure during checkout', async () => {
      const expiringSoon = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) + 300
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: expiringSoon },
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
          monthly_usage: 2,
          monthly_limit: 10,
          daily_usage: 1,
          daily_limit: 3,
          remaining_daily: 2
        },
        error: null
      })

      await userSessionService.initialize()

      // Mock refresh failure
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Token expired' }
      })

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('SESSION_REFRESH_REQUIRED')
      expect(result.error?.requiresAuth).toBe(true)
    })

    it('should prevent duplicate subscriptions', async () => {
      // Mock user with existing pro subscription
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            subscription_tier: 'pro',
            status: 'active',
            stripe_customer_id: 'cus_123'
          },
          error: null
        })
      })

      mockSupabase.rpc.mockResolvedValue({
        data: {
          monthly_usage: 50,
          monthly_limit: 120,
          daily_usage: 5,
          daily_limit: 10,
          remaining_daily: 5
        },
        error: null
      })

      await userSessionService.initialize()

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('ALREADY_SUBSCRIBED')
      expect(mockCreemService.createCheckoutSession).not.toHaveBeenCalled()
    })

    it('should handle Creem service failures', async () => {
      await setupAuthenticatedUser()

      mockCreemService.createCheckoutSession.mockResolvedValue({
        success: false,
        error: 'Payment service temporarily unavailable'
      })

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('CHECKOUT_FAILED')
      expect(result.error?.message).toContain('Payment service temporarily unavailable')
    })

    it('should handle network errors during checkout', async () => {
      await setupAuthenticatedUser()

      mockCreemService.createCheckoutSession.mockRejectedValue(new Error('Network error'))

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection error')
    })
  })

  describe('Portal Session Creation', () => {
    it('should create portal session for subscribed user', async () => {
      // Mock user with active subscription
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            subscription_tier: 'pro',
            status: 'active',
            stripe_customer_id: 'cus_123'
          },
          error: null
        })
      })

      mockSupabase.rpc.mockResolvedValue({
        data: {
          monthly_usage: 50,
          monthly_limit: 120,
          daily_usage: 5,
          daily_limit: 10,
          remaining_daily: 5
        },
        error: null
      })

      await userSessionService.initialize()

      mockCreemService.createPortalSession.mockResolvedValue({
        success: true,
        url: 'https://portal.creem.com/portal_123'
      })

      const result = await userSessionService.createPortalSession()

      expect(result.success).toBe(true)
      expect(result.url).toBe('https://portal.creem.com/portal_123')
    })

    it('should reject portal access for free users', async () => {
      await setupAuthenticatedUser()

      const result = await userSessionService.createPortalSession()

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NO_SUBSCRIPTION')
      expect(result.error?.message).toContain('No subscription found')
    })

    it('should require authentication for portal access', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      await userSessionService.initialize()

      const result = await userSessionService.createPortalSession()

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.requiresAuth).toBe(true)
    })
  })

  describe('Unified Checkout API Integration', () => {
    async function createMockRequest(body: any, headers: Record<string, string> = {}) {
      return {
        json: () => Promise.resolve(body),
        headers: {
          get: (key: string) => headers[key] || null,
        },
        nextUrl: {
          origin: 'https://test.example.com'
        }
      } as any as NextRequest
    }

    it('should validate session in unified checkout API', async () => {
      // Import the API route handler
      const { POST } = await import('@/app/api/payment/unified-checkout/route')
      
      // Mock server-side Supabase client
      const mockServerSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null, // No existing mapping
            error: { code: 'PGRST116' }
          })
        })),
        rpc: vi.fn().mockResolvedValue({
          data: 'mapping-123',
          error: null
        })
      }

      vi.doMock('@/utils/supabase/server', () => ({
        createClient: () => mockServerSupabase
      }))

      mockCreemService.createCheckoutSession.mockResolvedValue({
        success: true,
        sessionId: 'cs_test_123',
        url: 'https://checkout.creem.com/cs_test_123'
      })

      const request = await createMockRequest(
        {
          planId: 'pro',
          successUrl: 'https://test.example.com/success',
          cancelUrl: 'https://test.example.com/cancel'
        },
        {
          'authorization': 'Bearer valid-token-1234567890abcdef'
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.sessionId).toBe('cs_test_123')
      expect(mockServerSupabase.auth.getUser).toHaveBeenCalledWith('valid-token-1234567890abcdef')
    })

    it('should reject requests without authorization header', async () => {
      const { POST } = await import('@/app/api/payment/unified-checkout/route')

      const request = await createMockRequest({
        planId: 'pro'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.code).toBe('AUTH_REQUIRED')
    })

    it('should validate token expiry in API', async () => {
      const { POST } = await import('@/app/api/payment/unified-checkout/route')

      // Create token that expires soon
      const expiringSoonToken = Buffer.from(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 120 // 2 minutes
      })).toString('base64')
      const mockToken = `header.${expiringSoonToken}.signature`

      const mockServerSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      }

      vi.doMock('@/utils/supabase/server', () => ({
        createClient: () => mockServerSupabase
      }))

      const request = await createMockRequest(
        {
          planId: 'pro'
        },
        {
          'authorization': `Bearer ${mockToken}`
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.code).toBe('SESSION_EXPIRING')
      expect(data.requiresRefresh).toBe(true)
    })

    it('should handle invalid session tokens', async () => {
      const { POST } = await import('@/app/api/payment/unified-checkout/route')

      const mockServerSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' }
          })
        }
      }

      vi.doMock('@/utils/supabase/server', () => ({
        createClient: () => mockServerSupabase
      }))

      const request = await createMockRequest(
        {
          planId: 'pro'
        },
        {
          'authorization': 'Bearer invalid-token'
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.code).toBe('SESSION_INVALID')
      expect(data.requiresReauth).toBe(true)
    })

    it('should create customer mapping during checkout', async () => {
      const { POST } = await import('@/app/api/payment/unified-checkout/route')

      const mockServerSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })),
        rpc: vi.fn().mockResolvedValue({
          data: 'mapping-456',
          error: null
        })
      }

      vi.doMock('@/utils/supabase/server', () => ({
        createClient: () => mockServerSupabase
      }))

      mockCreemService.createCheckoutSession.mockResolvedValue({
        success: true,
        sessionId: 'cs_test_789',
        url: 'https://checkout.creem.com/cs_test_789'
      })

      const request = await createMockRequest(
        {
          planId: 'pro_plus',
          successUrl: 'https://test.example.com/success',
          cancelUrl: 'https://test.example.com/cancel'
        },
        {
          'authorization': 'Bearer valid-token-1234567890abcdef',
          'user-agent': 'Test Browser'
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Verify customer mapping was created
      expect(mockServerSupabase.rpc).toHaveBeenCalledWith(
        'upsert_customer_mapping',
        expect.objectContaining({
          p_user_id: 'user-123',
          p_email: 'test@example.com',
          p_subscription_tier: 'pro_plus',
          p_subscription_status: 'incomplete',
          p_session_context: expect.objectContaining({
            checkout_session_id: 'cs_test_789',
            intended_tier: 'pro_plus',
            current_tier: 'free'
          })
        })
      )
    })
  })

  describe('Error Categorization', () => {
    it('should categorize authentication errors correctly', async () => {
      await setupAuthenticatedUser()

      mockCreemService.createCheckoutSession.mockRejectedValue(
        new Error('Authentication failed: invalid token')
      )

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('AUTH_ERROR')
      expect(result.error?.requiresAuth).toBe(true)
    })

    it('should categorize network errors correctly', async () => {
      await setupAuthenticatedUser()

      mockCreemService.createCheckoutSession.mockRejectedValue(
        new Error('Network error: fetch failed')
      )

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.requiresAuth).toBe(false)
    })

    it('should categorize subscription conflicts correctly', async () => {
      await setupAuthenticatedUser()

      mockCreemService.createCheckoutSession.mockRejectedValue(
        new Error('User already_subscribed to this plan')
      )

      const result = await userSessionService.createCheckoutSession('pro')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('ALREADY_SUBSCRIBED')
      expect(result.error?.requiresAuth).toBe(false)
    })
  })
})