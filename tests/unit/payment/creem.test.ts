import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreemService } from '@/services/payment/creem'

const mockEnv = vi.hoisted(() => ({
  CREEM_SECRET_KEY: 'creem_test_sk_123',
  CREEM_API_KEY: 'creem_test_sk_123',
  CREEM_WEBHOOK_SECRET: 'whsec_test_123',
  NEXT_PUBLIC_CREEM_TEST_MODE: 'true',
  NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY: 'price_pro_monthly',
  NEXT_PUBLIC_PRICE_ID_PRO_YEARLY: 'price_pro_yearly',
  NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY: 'price_proplus_monthly',
  NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY: 'price_proplus_yearly',
  NODE_ENV: 'test'
}))

vi.mock('@/env', () => ({
  env: mockEnv,
  isTestMode: () => true,
  isDevelopment: () => false,
  isProduction: () => false
}))

const mockCreemClient = vi.hoisted(() => ({
  createCheckout: vi.fn(),
  cancelSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  retrieveSubscription: vi.fn(),
  upgradeSubscription: vi.fn(),
  createProduct: vi.fn(),
  generateCustomerLinks: vi.fn()
}))

vi.mock('creem', () => ({
  Creem: vi.fn(() => mockCreemClient)
}))

describe('CreemService', () => {
  let service: CreemService

  beforeEach(() => {
    Object.values(mockCreemClient).forEach(fn => fn.mockReset())
    service = new CreemService()
    ;(service as unknown as { creem: typeof mockCreemClient }).creem = mockCreemClient
  })

  describe('createCheckoutSession', () => {
    it('returns success when checkout is created', async () => {
      mockCreemClient.createCheckout.mockResolvedValueOnce({
        id: 'chk_123',
        checkoutUrl: 'https://pay.creem.dev/checkout/chk_123',
        status: 'open'
      })

      const result = await service.createCheckoutSession({
        userId: 'user_123',
        userEmail: 'test@example.com',
        planId: 'pro',
        successUrl: 'https://covergen.pro/success',
        cancelUrl: 'https://covergen.pro/cancel',
        currentPlan: 'free'
      })

      expect(result).toEqual({
        success: true,
        sessionId: 'chk_123',
        url: 'https://pay.creem.dev/checkout/chk_123'
      })

      expect(mockCreemClient.createCheckout).toHaveBeenCalledTimes(1)
      expect(mockCreemClient.createCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          xApiKey: mockEnv.CREEM_SECRET_KEY,
          createCheckoutRequest: expect.objectContaining({
            metadata: expect.objectContaining({
              userId: 'user_123',
              planId: 'pro'
            })
          })
        })
      )
    })

    it('returns error information when checkout creation fails', async () => {
      mockCreemClient.createCheckout.mockRejectedValueOnce(new Error('provider unavailable'))

      const result = await service.createCheckoutSession({
        userId: 'user_123',
        userEmail: 'test@example.com',
        planId: 'pro',
        successUrl: 'https://covergen.pro/success',
        cancelUrl: 'https://covergen.pro/cancel',
        currentPlan: 'free'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('provider unavailable')
    })
  })

  describe('cancelSubscription', () => {
    it('wraps Creem cancellation success', async () => {
      mockCreemClient.cancelSubscription.mockResolvedValueOnce({
        id: 'sub_123',
        status: 'canceled'
      })

      const result = await service.cancelSubscription('sub_123')

      expect(result).toEqual({
        success: true,
        subscription: {
          id: 'sub_123',
          status: 'canceled'
        }
      })
    })

    it('returns failure payload when cancellation fails', async () => {
      mockCreemClient.cancelSubscription.mockRejectedValueOnce(new Error('not found'))

      const result = await service.cancelSubscription('sub_missing')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('upgradeSubscription', () => {
    it('returns success when upgrade completes', async () => {
      mockCreemClient.upgradeSubscription.mockResolvedValueOnce({
        id: 'sub_123',
        status: 'active',
        latestInvoice: {
          prorationAmount: 599
        }
      })

      const result = await service.upgradeSubscription('sub_123', 'pro_plus')

      expect(result).toEqual({
        success: true,
        subscription: expect.objectContaining({ id: 'sub_123' }),
        prorationAmount: 599,
        message: expect.stringContaining('successfully')
      })
    })

    it('returns failure information when upgrade fails', async () => {
      mockCreemClient.upgradeSubscription.mockRejectedValueOnce(new Error('plan mismatch'))

      const result = await service.upgradeSubscription('sub_123', 'pro_plus')

      expect(result.success).toBe(false)
      expect(result.error).toContain('plan mismatch')
    })
  })

  describe('createPortalSession', () => {
    it('returns portal link from Creem', async () => {
      mockCreemClient.generateCustomerLinks.mockResolvedValueOnce({
        customerPortalLink: 'https://portal.creem.dev/cust_123'
      })

      const result = await service.createPortalSession({
        customerId: 'cus_123',
        returnUrl: 'https://covergen.pro/account'
      })

      expect(result).toEqual({
        success: true,
        url: 'https://portal.creem.dev/cust_123'
      })
    })

    it('returns error when portal link fails', async () => {
      mockCreemClient.generateCustomerLinks.mockRejectedValueOnce(new Error('link disabled'))

      const result = await service.createPortalSession({
        customerId: 'cus_123',
        returnUrl: 'https://covergen.pro/account'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('link disabled')
    })
  })

  describe('getSubscription', () => {
    it('retrieves subscription details', async () => {
      mockCreemClient.retrieveSubscription.mockResolvedValueOnce({
        id: 'sub_123',
        status: 'active'
      })

      const result = await service.getSubscription('sub_123')

      expect(result).toEqual({
        success: true,
        subscription: {
          id: 'sub_123',
          status: 'active'
        }
      })
    })
  })

  describe('handleWebhookEvent', () => {
    it('normalizes checkout completion event', async () => {
      const event = {
        eventType: 'checkout.completed',
        object: {
          id: 'chk_123',
          customer: {
            id: 'cus_123',
            external_id: 'user_123'
          },
          subscription: {
            id: 'sub_123',
            product: { id: mockEnv.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY }
          },
          metadata: {
            planId: 'pro',
            billingCycle: 'monthly',
            internal_customer_id: 'user_123'
          }
        }
      }

      const result = await service.handleWebhookEvent(event)

      expect(result).toEqual(
        expect.objectContaining({
          type: 'checkout_complete',
          userId: 'user_123',
          planId: 'pro'
        })
      )
    })

    it('maps subscription updates to expected payload', async () => {
      const event = {
        eventType: 'subscription.update',
        object: {
          customer: { id: 'cus_123' },
          status: 'active',
          metadata: {
            planId: 'pro_plus',
            internal_customer_id: 'user_123'
          },
          product: { id: mockEnv.NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY },
          current_period_end_date: '2025-11-01T00:00:00.000Z'
        }
      }

      const result = await service.handleWebhookEvent(event)

      expect(result).toEqual(
        expect.objectContaining({
          type: 'subscription_update',
          customerId: 'cus_123',
          planId: 'pro_plus',
          status: 'active'
        })
      )
    })
  })
})
