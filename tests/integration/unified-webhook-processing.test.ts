/**
 * Integration Tests for Webhook Processing with Session Context
 * 
 * Tests the complete webhook processing flow including:
 * - Webhook signature verification
 * - Customer mapping validation
 * - Session context preservation
 * - Database updates with proper mapping
 * - Service notification integration
 * - Error handling and recovery
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { userSessionService } from '@/services/unified/UserSessionService'

// Mock dependencies
vi.mock('@/services/payment/creem')
vi.mock('@/utils/supabase/server')
vi.mock('@/services/unified/UserSessionService')

const mockCreemService = {
  verifyWebhookSignature: vi.fn(),
  createCheckoutSession: vi.fn(),
  createPortalSession: vi.fn()
}

const mockServerSupabase = {
  rpc: vi.fn(),
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn()
  }))
}

const mockUserSessionService = {
  handleSubscriptionUpdate: vi.fn()
}

// Mock webhook payloads
const mockWebhookPayloads = {
  subscriptionCreated: {
    id: 'evt_test_webhook_123',
    eventType: 'checkout.completed',
    type: 'checkout.completed',
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        product: 'prod_pro_plan',
        mode: 'subscription',
        metadata: {
          planId: 'pro',
          userId: 'user-123'
        },
        trial_end: null,
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
      }
    }
  },
  subscriptionUpdated: {
    id: 'evt_test_webhook_456',
    eventType: 'subscription.paid',
    type: 'subscription.paid',
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        product: 'prod_pro_plan',
        metadata: {
          planId: 'pro',
          userId: 'user-123'
        }
      }
    }
  },
  subscriptionCanceled: {
    id: 'evt_test_webhook_789',
    eventType: 'subscription.canceled',
    type: 'subscription.canceled',
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'canceled',
        product: 'prod_pro_plan',
        metadata: {
          planId: 'pro',
          userId: 'user-123'
        }
      }
    }
  },
  trialSubscription: {
    id: 'evt_test_webhook_trial',
    eventType: 'checkout.completed',
    type: 'checkout.completed',
    data: {
      object: {
        id: 'sub_test_trial',
        customer: 'cus_test_123',
        status: 'trialing',
        product: 'prod_pro_plus_plan',
        mode: 'trial',
        metadata: {
          planId: 'pro_plus',
          userId: 'user-123'
        },
        trial_end: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days trial
      }
    }
  }
}

const mockCustomerMapping = {
  id: 'mapping-123',
  user_id: 'user-123',
  email: 'test@example.com',
  creem_customer_id: 'cus_test_123',
  creem_subscription_id: 'sub_test_123',
  subscription_tier: 'pro',
  subscription_status: 'active',
  provider: 'google',
  created_from_session_id: 'cs_test_session',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

describe('Webhook Processing Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.doMock('@/services/payment/creem', () => ({
      creemService: mockCreemService
    }))
    
    vi.doMock('@/utils/supabase/server', () => ({
      createClient: () => mockServerSupabase
    }))
    
    vi.doMock('@/services/unified/UserSessionService', () => ({
      userSessionService: mockUserSessionService
    }))
  })

  async function createMockWebhookRequest(payload: any, signature: string = 'valid_signature') {
    const body = JSON.stringify(payload)
    return {
      text: () => Promise.resolve(body),
      headers: {
        get: (key: string) => {
          switch (key) {
            case 'creem-signature': return signature
            case 'user-agent': return 'Creem Webhook/1.0'
            case 'x-forwarded-for': return '192.168.1.1'
            default: return null
          }
        }
      }
    } as any as NextRequest
  }

  describe('Webhook Signature Verification', () => {
    it('should verify valid webhook signatures', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockCreemService.verifyWebhookSignature.mockReturnValue(true)
      
      mockServerSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCustomerMapping,
          error: null
        })
      })

      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      const request = await createMockWebhookRequest(
        mockWebhookPayloads.subscriptionCreated,
        'valid_signature_123'
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockCreemService.verifyWebhookSignature).toHaveBeenCalledWith(
        JSON.stringify(mockWebhookPayloads.subscriptionCreated),
        'valid_signature_123'
      )
    })

    it('should reject webhooks with invalid signatures', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockCreemService.verifyWebhookSignature.mockReturnValue(false)

      const request = await createMockWebhookRequest(
        mockWebhookPayloads.subscriptionCreated,
        'invalid_signature'
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized webhook request')
      expect(mockServerSupabase.rpc).not.toHaveBeenCalled()
    })

    it('should reject webhooks without signatures', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')

      const request = await createMockWebhookRequest(
        mockWebhookPayloads.subscriptionCreated,
        ''
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(mockCreemService.verifyWebhookSignature).toHaveBeenCalledWith(
        JSON.stringify(mockWebhookPayloads.subscriptionCreated),
        ''
      )
    })
  })

  describe('Customer Mapping Validation', () => {
    it('should validate existing customer mapping', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockCreemService.verifyWebhookSignature.mockReturnValue(true)
      
      mockServerSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCustomerMapping,
          error: null
        })
      })

      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Verify customer mapping query
      expect(mockServerSupabase.from).toHaveBeenCalledWith('customer_mapping')
    })

    it('should reject webhooks for non-existent customers', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockCreemService.verifyWebhookSignature.mockReturnValue(true)
      
      mockServerSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' }
        })
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Customer mapping validation failed')
      expect(data.details).toContain('No customer mapping found')
      expect(mockServerSupabase.rpc).not.toHaveBeenCalled()
    })

    it('should handle customer mapping database errors', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockCreemService.verifyWebhookSignature.mockReturnValue(true)
      
      mockServerSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database connection failed'))
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Customer mapping validation failed')
      expect(data.details).toContain('Validation error: Database connection failed')
    })
  })

  describe('Database Webhook Processing', () => {
    beforeEach(() => {
      mockCreemService.verifyWebhookSignature.mockReturnValue(true)
      mockServerSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCustomerMapping,
          error: null
        })
      })
    })

    it('should process subscription created webhook', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.processed.event_type).toBe('checkout.completed')
      
      expect(mockServerSupabase.rpc).toHaveBeenCalledWith(
        'handle_subscription_webhook',
        { p_webhook_data: mockWebhookPayloads.subscriptionCreated }
      )
    })

    it('should process subscription updated webhook', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'subscription.paid',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionUpdated)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.processed.event_type).toBe('subscription.paid')
    })

    it('should process subscription canceled webhook', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'subscription.canceled',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCanceled)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.processed.event_type).toBe('subscription.canceled')
    })

    it('should handle trial subscription webhooks', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_trial',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.trialSubscription)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle database processing errors', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockServerSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database constraint violation', code: '23505' }
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.code).toBe('DATABASE_ERROR')
      expect(data.error).toBe('Database processing failed')
    })

    it('should handle webhook processing failures', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: false,
          error: 'Invalid subscription data'
        },
        error: null
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.code).toBe('PROCESSING_FAILED')
      expect(data.error).toBe('Webhook processing failed')
    })
  })

  describe('Service Notification Integration', () => {
    beforeEach(() => {
      mockCreemService.verifyWebhookSignature.mockReturnValue(true)
      mockServerSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCustomerMapping,
          error: null
        })
      })
    })

    it('should notify UserSessionService of subscription updates', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      // Mock profile check for session validation
      mockServerSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                updated_at: new Date().toISOString()
              },
              error: null
            })
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockCustomerMapping,
            error: null
          })
        }
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      expect(mockUserSessionService.handleSubscriptionUpdate).toHaveBeenCalledWith({
        type: 'subscription_created',
        userId: 'user-123',
        customerId: 'cus_test_123',
        subscriptionId: 'sub_test_123',
        tier: 'pro',
        status: 'active',
        trialEndsAt: undefined
      })
    })

    it('should extract trial end dates correctly', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_trial',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      mockServerSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'user-123', updated_at: new Date().toISOString() },
              error: null
            })
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockCustomerMapping,
            error: null
          })
        }
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.trialSubscription)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      expect(mockUserSessionService.handleSubscriptionUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'subscription_created',
          tier: 'pro_plus',
          trialEndsAt: expect.any(Date)
        })
      )
    })

    it('should continue processing despite service notification errors', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')
      
      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      mockServerSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'user-123', updated_at: new Date().toISOString() },
              error: null
            })
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockCustomerMapping,
            error: null
          })
        }
      })

      // Mock service notification error
      mockUserSessionService.handleSubscriptionUpdate.mockRejectedValue(
        new Error('Service unavailable')
      )

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      // Should still succeed despite notification error
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Session Context Validation', () => {
    beforeEach(() => {
      mockCreemService.verifyWebhookSignature.mockReturnValue(true)
      mockServerSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCustomerMapping,
          error: null
        })
      })

      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })
    })

    it('should validate user session context exists', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')

      mockServerSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                updated_at: new Date().toISOString()
              },
              error: null
            })
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockCustomerMapping,
            error: null
          })
        }
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Verify profile lookup for session context validation
      expect(mockServerSupabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle missing user profile gracefully', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')

      mockServerSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' }
            })
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockCustomerMapping,
            error: null
          })
        }
      })

      const request = await createMockWebhookRequest(mockWebhookPayloads.subscriptionCreated)

      const response = await POST(request)
      const data = await response.json()

      // Should still process successfully even with missing profile
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Event Type Mapping', () => {
    beforeEach(() => {
      mockCreemService.verifyWebhookSignature.mockReturnValue(true)
      mockServerSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCustomerMapping,
          error: null
        })
      })

      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      mockServerSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'user-123', updated_at: new Date().toISOString() },
              error: null
            })
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockCustomerMapping,
            error: null
          })
        }
      })
    })

    const eventMappingTests = [
      { creem: 'checkout.completed', internal: 'subscription_created' },
      { creem: 'subscription.active', internal: 'subscription_updated' },
      { creem: 'subscription.paid', internal: 'payment_succeeded' },
      { creem: 'subscription.canceled', internal: 'subscription_canceled' },
      { creem: 'payment.failed', internal: 'payment_failed' }
    ]

    eventMappingTests.forEach(({ creem, internal }) => {
      it(`should map ${creem} to ${internal}`, async () => {
        const { POST } = await import('@/app/api/webhooks/creem-unified/route')

        const payload = {
          ...mockWebhookPayloads.subscriptionCreated,
          eventType: creem,
          type: creem
        }

        mockServerSupabase.rpc.mockResolvedValue({
          data: {
            success: true,
            user_id: 'user-123',
            customer_id: 'cus_test_123',
            subscription_id: 'sub_test_123',
            event_type: creem,
            mapping_id: 'mapping-123'
          },
          error: null
        })

        const request = await createMockWebhookRequest(payload)

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(mockUserSessionService.handleSubscriptionUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            type: internal
          })
        )
      })
    })
  })

  describe('Subscription Tier Extraction', () => {
    beforeEach(() => {
      mockCreemService.verifyWebhookSignature.mockReturnValue(true)
      mockServerSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCustomerMapping,
          error: null
        })
      })

      mockServerSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'user-123', updated_at: new Date().toISOString() },
              error: null
            })
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockCustomerMapping,
            error: null
          })
        }
      })
    })

    it('should extract tier from metadata', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')

      const payload = {
        ...mockWebhookPayloads.subscriptionCreated,
        data: {
          object: {
            ...mockWebhookPayloads.subscriptionCreated.data.object,
            metadata: { planId: 'pro_plus' }
          }
        }
      }

      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      const request = await createMockWebhookRequest(payload)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockUserSessionService.handleSubscriptionUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          tier: 'pro_plus'
        })
      )
    })

    it('should extract tier from product ID pattern matching', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')

      const payload = {
        ...mockWebhookPayloads.subscriptionCreated,
        data: {
          object: {
            ...mockWebhookPayloads.subscriptionCreated.data.object,
            product: 'prod_pro_plus_monthly',
            metadata: {} // No planId in metadata
          }
        }
      }

      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      const request = await createMockWebhookRequest(payload)

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockUserSessionService.handleSubscriptionUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          tier: 'pro_plus'
        })
      )
    })

    it('should default to pro tier when unclear', async () => {
      const { POST } = await import('@/app/api/webhooks/creem-unified/route')

      const payload = {
        ...mockWebhookPayloads.subscriptionCreated,
        data: {
          object: {
            ...mockWebhookPayloads.subscriptionCreated.data.object,
            product: 'prod_unknown_plan',
            metadata: {}
          }
        }
      }

      mockServerSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          user_id: 'user-123',
          customer_id: 'cus_test_123',
          subscription_id: 'sub_test_123',
          event_type: 'checkout.completed',
          mapping_id: 'mapping-123'
        },
        error: null
      })

      const request = await createMockWebhookRequest(payload)

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockUserSessionService.handleSubscriptionUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          tier: 'pro' // Default fallback
        })
      )
    })
  })
})