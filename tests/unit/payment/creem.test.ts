import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { CreemService } from '@/services/payment/creem';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      }))
    }))
  }))
}));

// Mock Creem SDK
vi.mock('creem', () => ({
  Creem: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn()
      }
    },
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn()
    },
    subscriptions: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
      reactivate: vi.fn()
    },
    licenses: {
      create: vi.fn(),
      retrieve: vi.fn(),
      validate: vi.fn()
    },
    billingPortal: {
      sessions: {
        create: vi.fn()
      }
    },
    webhooks: {
      constructEvent: vi.fn()
    }
  }))
}));

describe('CreemService', () => {
  let creemService: CreemService;
  let mockSupabase: any;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Setup environment variables
    process.env.CREEM_SECRET_KEY = 'sk_test_123';
    process.env.CREEM_WEBHOOK_SECRET = 'whsec_test_123';
    process.env.NEXT_PUBLIC_CREEM_PUBLIC_KEY = 'pk_test_123';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    
    mockSupabase = createClient('', '');
    creemService = new CreemService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session for new Pro subscription', async () => {
      const userId = 'user_123';
      const email = 'test@example.com';
      const plan = 'pro';
      
      // Mock Creem checkout session creation
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.creem.io/pay/cs_test_123',
        customer: 'cus_test_123',
        payment_status: 'unpaid',
        status: 'open'
      };
      
      (creemService as any).creem.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await creemService.createCheckoutSession({
        userId,
        email,
        plan,
        successUrl: '/payment/success',
        cancelUrl: '/payment/cancel'
      });

      expect(result).toEqual({
        sessionId: mockSession.id,
        url: mockSession.url
      });

      expect((creemService as any).creem.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        line_items: [
          {
            price: expect.stringContaining('price_'),
            quantity: 1
          }
        ],
        success_url: expect.stringContaining('/payment/success'),
        cancel_url: expect.stringContaining('/payment/cancel'),
        customer_email: email,
        metadata: {
          userId,
          plan
        },
        subscription_data: {
          metadata: {
            userId,
            plan
          }
        },
        allow_promotion_codes: true
      });
    });

    it('should create a checkout session for Pro+ subscription', async () => {
      const userId = 'user_123';
      const email = 'test@example.com';
      const plan = 'pro_plus';
      
      const mockSession = {
        id: 'cs_test_456',
        url: 'https://checkout.creem.io/pay/cs_test_456',
        customer: 'cus_test_456',
        payment_status: 'unpaid',
        status: 'open'
      };
      
      (creemService as any).creem.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await creemService.createCheckoutSession({
        userId,
        email,
        plan,
        successUrl: '/payment/success',
        cancelUrl: '/payment/cancel'
      });

      expect(result.sessionId).toBe(mockSession.id);
      expect((creemService as any).creem.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            {
              price: expect.stringContaining('price_'),
              quantity: 1
            }
          ],
          metadata: {
            userId,
            plan
          }
        })
      );
    });

    it('should handle checkout session creation errors', async () => {
      const error = new Error('Payment provider error');
      (creemService as any).creem.checkout.sessions.create.mockRejectedValue(error);

      await expect(
        creemService.createCheckoutSession({
          userId: 'user_123',
          email: 'test@example.com',
          plan: 'pro',
          successUrl: '/success',
          cancelUrl: '/cancel'
        })
      ).rejects.toThrow('Payment provider error');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel a subscription at period end', async () => {
      const subscriptionId = 'sub_test_123';
      
      const mockCancelledSubscription = {
        id: subscriptionId,
        status: 'active',
        cancel_at_period_end: true,
        current_period_end: new Date('2025-10-01').toISOString()
      };
      
      (creemService as any).creem.subscriptions.update.mockResolvedValue(mockCancelledSubscription);

      const result = await creemService.cancelSubscription(subscriptionId);

      expect(result).toEqual(mockCancelledSubscription);
      expect((creemService as any).creem.subscriptions.update).toHaveBeenCalledWith(
        subscriptionId,
        {
          cancel_at_period_end: true
        }
      );
    });

    it('should handle cancellation errors', async () => {
      const error = new Error('Subscription not found');
      (creemService as any).creem.subscriptions.update.mockRejectedValue(error);

      await expect(
        creemService.cancelSubscription('sub_invalid')
      ).rejects.toThrow('Subscription not found');
    });
  });

  describe('resumeSubscription', () => {
    it('should resume a cancelled subscription', async () => {
      const subscriptionId = 'sub_test_123';
      
      const mockResumedSubscription = {
        id: subscriptionId,
        status: 'active',
        cancel_at_period_end: false,
        current_period_end: new Date('2025-10-01').toISOString()
      };
      
      (creemService as any).creem.subscriptions.update.mockResolvedValue(mockResumedSubscription);

      const result = await creemService.resumeSubscription(subscriptionId);

      expect(result).toEqual(mockResumedSubscription);
      expect((creemService as any).creem.subscriptions.update).toHaveBeenCalledWith(
        subscriptionId,
        {
          cancel_at_period_end: false
        }
      );
    });
  });

  describe('upgradeSubscription', () => {
    it('should upgrade from Pro to Pro+ with proration', async () => {
      const subscriptionId = 'sub_test_123';
      const newPlan = 'pro_plus';
      
      // Mock subscription retrieval
      const mockSubscription = {
        id: subscriptionId,
        status: 'active',
        items: {
          data: [
            {
              id: 'si_test_123',
              price: {
                id: 'price_pro_monthly'
              }
            }
          ]
        }
      };
      
      (creemService as any).creem.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      
      const mockUpdatedSubscription = {
        ...mockSubscription,
        items: {
          data: [
            {
              id: 'si_test_123',
              price: {
                id: 'price_pro_plus_monthly'
              }
            }
          ]
        }
      };
      
      (creemService as any).creem.subscriptions.update.mockResolvedValue(mockUpdatedSubscription);

      const result = await creemService.upgradeSubscription(subscriptionId, newPlan);

      expect(result).toEqual(mockUpdatedSubscription);
      expect((creemService as any).creem.subscriptions.update).toHaveBeenCalledWith(
        subscriptionId,
        {
          items: [
            {
              id: 'si_test_123',
              price: expect.stringContaining('price_')
            }
          ],
          proration_behavior: 'create_prorations'
        }
      );
    });
  });

  describe('validateLicense', () => {
    it('should validate an API license for Pro+ users', async () => {
      const licenseKey = 'lic_test_123';
      
      const mockLicense = {
        id: licenseKey,
        status: 'active',
        valid: true,
        metadata: {
          userId: 'user_123',
          plan: 'pro_plus'
        }
      };
      
      (creemService as any).creem.licenses.validate.mockResolvedValue(mockLicense);

      const result = await creemService.validateLicense(licenseKey);

      expect(result).toEqual({
        valid: true,
        userId: 'user_123',
        plan: 'pro_plus'
      });
    });

    it('should return invalid for expired licenses', async () => {
      const licenseKey = 'lic_test_expired';
      
      const mockLicense = {
        id: licenseKey,
        status: 'expired',
        valid: false
      };
      
      (creemService as any).creem.licenses.validate.mockResolvedValue(mockLicense);

      const result = await creemService.validateLicense(licenseKey);

      expect(result).toEqual({
        valid: false,
        userId: null,
        plan: null
      });
    });
  });

  describe('handleWebhook', () => {
    it('should handle checkout.session.completed event', async () => {
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            metadata: {
              userId: 'user_123',
              plan: 'pro'
            }
          }
        }
      };
      
      const signature = 'test_signature';
      
      (creemService as any).creem.webhooks.constructEvent.mockReturnValue(webhookPayload);
      
      // Mock Supabase operations
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: { id: 'user_123', subscription_tier: 'pro' },
        error: null
      });
      
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: { id: 'sub_123' },
        error: null
      });

      const result = await creemService.handleWebhook(
        JSON.stringify(webhookPayload),
        signature
      );

      expect(result).toEqual({ received: true });
      expect((creemService as any).creem.webhooks.constructEvent).toHaveBeenCalledWith(
        JSON.stringify(webhookPayload),
        signature,
        process.env.CREEM_WEBHOOK_SECRET
      );
    });

    it('should handle subscription.updated event', async () => {
      const webhookPayload = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            cancel_at_period_end: true,
            current_period_end: new Date('2025-10-01').toISOString(),
            metadata: {
              userId: 'user_123',
              plan: 'pro'
            }
          }
        }
      };
      
      (creemService as any).creem.webhooks.constructEvent.mockReturnValue(webhookPayload);
      
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: { id: 'sub_123', status: 'active' },
        error: null
      });

      const result = await creemService.handleWebhook(
        JSON.stringify(webhookPayload),
        signature
      );

      expect(result).toEqual({ received: true });
    });

    it('should handle invalid webhook signatures', async () => {
      const webhookPayload = { type: 'test', data: {} };
      const invalidSignature = 'invalid_signature';
      
      (creemService as any).creem.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Webhook signature verification failed');
      });

      await expect(
        creemService.handleWebhook(JSON.stringify(webhookPayload), invalidSignature)
      ).rejects.toThrow('Webhook signature verification failed');
    });

    it('should handle payment_intent.succeeded for one-time payments', async () => {
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 1900,
            currency: 'usd',
            customer: 'cus_test_123',
            metadata: {
              userId: 'user_123',
              type: 'one_time_upgrade'
            }
          }
        }
      };
      
      (creemService as any).creem.webhooks.constructEvent.mockReturnValue(webhookPayload);
      
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: { id: 'payment_123' },
        error: null
      });

      const result = await creemService.handleWebhook(
        JSON.stringify(webhookPayload),
        signature
      );

      expect(result).toEqual({ received: true });
    });
  });

  describe('createPortalSession', () => {
    it('should create a customer portal session', async () => {
      const customerId = 'cus_test_123';
      const returnUrl = 'http://localhost:3000/account';
      
      const mockPortalSession = {
        id: 'bps_test_123',
        url: 'https://billing.creem.io/portal/bps_test_123'
      };
      
      (creemService as any).creem.billingPortal.sessions.create.mockResolvedValue(mockPortalSession);

      const result = await creemService.createPortalSession(customerId, returnUrl);

      expect(result).toEqual({
        sessionId: mockPortalSession.id,
        url: mockPortalSession.url
      });

      expect((creemService as any).creem.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: customerId,
        return_url: returnUrl
      });
    });
  });

  describe('getPriceId', () => {
    it('should return correct price ID for each plan', () => {
      expect(creemService.getPriceId('pro')).toMatch(/price_.*_pro_/);
      expect(creemService.getPriceId('pro_plus')).toMatch(/price_.*_proplus_/);
    });

    it('should throw error for invalid plan', () => {
      expect(() => creemService.getPriceId('invalid_plan' as any)).toThrow('Invalid plan');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      
      (creemService as any).creem.checkout.sessions.create.mockRejectedValue(networkError);

      await expect(
        creemService.createCheckoutSession({
          userId: 'user_123',
          email: 'test@example.com',
          plan: 'pro',
          successUrl: '/success',
          cancelUrl: '/cancel'
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError: any = new Error('Too many requests');
      rateLimitError.statusCode = 429;
      rateLimitError.headers = { 'retry-after': '60' };
      
      (creemService as any).creem.subscriptions.retrieve.mockRejectedValue(rateLimitError);

      await expect(
        creemService.getSubscription('sub_test_123')
      ).rejects.toThrow('Too many requests');
    });
  });
});