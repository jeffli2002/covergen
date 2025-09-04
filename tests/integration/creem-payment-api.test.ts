import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Import route handlers
import { POST as createCheckoutHandler } from '@/app/api/payment/create-checkout/route';
import { POST as createPortalHandler } from '@/app/api/payment/create-portal/route';
import { POST as cancelSubscriptionHandler } from '@/app/api/payment/cancel-subscription/route';
import { POST as resumeSubscriptionHandler } from '@/app/api/payment/resume-subscription/route';
import { POST as upgradeSubscriptionHandler } from '@/app/api/payment/upgrade-subscription/route';
import { POST as webhookHandler } from '@/app/api/webhooks/creem/route';

// Mock environment variables
process.env.CREEM_SECRET_KEY = 'test_secret_key';
process.env.CREEM_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.NEXT_PUBLIC_CREEM_TEST_MODE = 'true';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

// Mock modules
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn()
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
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }))
}));

vi.mock('creem', () => ({
  Creem: vi.fn().mockImplementation(() => ({
    createCheckout: vi.fn(),
    generateCustomerLinks: vi.fn(),
    cancelSubscription: vi.fn(),
    updateSubscription: vi.fn(),
    retrieveSubscription: vi.fn(),
    createCustomer: vi.fn(),
    retrieveCustomer: vi.fn(),
    upgradeSubscription: vi.fn(),
    validateLicense: vi.fn()
  }))
}));

// Helper to create a valid webhook signature
function createWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Helper to create mock NextRequest
function createNextRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
}): NextRequest {
  const { method = 'POST', url = 'http://localhost:3000', headers = {}, body } = options;
  
  const request = new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  return request as unknown as NextRequest;
}

describe('Creem Payment API Integration Tests', () => {
  let mockSupabase: any;
  let mockCreem: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Get mocked instances
    const { createClient } = vi.mocked(await import('@supabase/supabase-js'));
    mockSupabase = createClient('', '');
    
    const { Creem } = vi.mocked(await import('creem'));
    mockCreem = new Creem({ serverIdx: 1 });
  });

  describe('POST /api/payment/create-checkout', () => {
    const validCheckoutRequest = {
      planId: 'pro',
      successUrl: 'http://localhost:3000/payment/success',
      cancelUrl: 'http://localhost:3000/payment/cancel'
    };

    it('should create checkout session for authenticated free user', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com'
          }
        },
        error: null
      });

      // Mock user has free tier
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          tier: 'free',
          status: null
        },
        error: null
      });

      // Mock Creem checkout creation
      mockCreem.createCheckout.mockResolvedValue({
        ok: true,
        value: {
          id: 'checkout_test_123',
          checkoutUrl: 'https://checkout.creem.io/test'
        }
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: validCheckoutRequest
      });

      const response = await createCheckoutHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        sessionId: 'checkout_test_123',
        url: 'https://checkout.creem.io/test'
      });

      // Verify Creem was called with correct parameters
      expect(mockCreem.createCheckout).toHaveBeenCalledWith({
        xApiKey: 'test_secret_key',
        createCheckoutRequest: expect.objectContaining({
          productId: 'prod_test_pro',
          requestId: expect.stringMatching(/^checkout_user_123_\d+$/),
          successUrl: validCheckoutRequest.successUrl,
          metadata: {
            userId: 'user_123',
            userEmail: 'test@example.com',
            planId: 'pro',
            currentPlan: 'free'
          },
          customer: {
            email: 'test@example.com'
          }
        })
      });
    });

    it('should handle Pro to Pro+ upgrade', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      // User already has Pro
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          tier: 'pro',
          status: 'active'
        },
        error: null
      });

      mockCreem.createCheckout.mockResolvedValue({
        ok: true,
        value: {
          id: 'checkout_upgrade_123',
          checkoutUrl: 'https://checkout.creem.io/upgrade'
        }
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          ...validCheckoutRequest,
          planId: 'pro_plus'
        }
      });

      const response = await createCheckoutHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockCreem.createCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          createCheckoutRequest: expect.objectContaining({
            productId: 'prod_test_proplus',
            metadata: expect.objectContaining({
              planId: 'pro_plus',
              currentPlan: 'pro'
            })
          })
        })
      );
    });

    it('should reject unauthenticated requests', async () => {
      const request = createNextRequest({
        body: validCheckoutRequest
      });

      const response = await createCheckoutHandler(request);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Authentication required');
    });

    it('should reject invalid plan IDs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          ...validCheckoutRequest,
          planId: 'invalid_plan'
        }
      });

      const response = await createCheckoutHandler(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid plan selected');
    });

    it('should handle missing required parameters', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          planId: 'pro'
          // Missing successUrl and cancelUrl
        }
      });

      const response = await createCheckoutHandler(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing required parameters');
    });

    it('should handle Creem API errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { tier: 'free' },
        error: null
      });

      // Mock Creem error
      mockCreem.createCheckout.mockResolvedValue({
        ok: false,
        error: 'Payment provider unavailable'
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: validCheckoutRequest
      });

      const response = await createCheckoutHandler(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Failed to create checkout session');
    });
  });

  describe('POST /api/payment/create-portal', () => {
    it('should create portal session for user with subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          stripe_customer_id: 'cus_test_123',
          tier: 'pro',
          status: 'active'
        },
        error: null
      });

      mockCreem.generateCustomerLinks.mockResolvedValue({
        data: {
          portalUrl: 'https://portal.creem.io/test'
        }
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          returnUrl: 'http://localhost:3000/account'
        }
      });

      const response = await createPortalHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        url: 'https://portal.creem.io/test'
      });

      expect(mockCreem.generateCustomerLinks).toHaveBeenCalledWith({
        customerId: 'cus_test_123',
        xApiKey: 'test_secret_key',
        generateCustomerLinks: {
          returnUrl: 'http://localhost:3000/account'
        }
      });
    });

    it('should return error for users without subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          stripe_customer_id: null,
          tier: 'free'
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          returnUrl: 'http://localhost:3000/account'
        }
      });

      const response = await createPortalHandler(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('No active subscription');
    });
  });

  describe('POST /api/payment/cancel-subscription', () => {
    it('should cancel subscription at period end', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          stripe_subscription_id: 'sub_test_123',
          status: 'active'
        },
        error: null
      });

      mockCreem.cancelSubscription.mockResolvedValue({
        data: {
          id: 'sub_test_123',
          status: 'active',
          cancelAtPeriodEnd: true
        }
      });

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: {
          status: 'active',
          cancel_at_period_end: true
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          cancelAtPeriodEnd: true
        }
      });

      const response = await cancelSubscriptionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cancel_at_period_end).toBe(true);

      expect(mockCreem.cancelSubscription).toHaveBeenCalledWith({
        subscriptionId: 'sub_test_123',
        xApiKey: 'test_secret_key',
        cancelSubscription: {
          cancelAtPeriodEnd: true
        }
      });
    });

    it('should handle immediate cancellation', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          stripe_subscription_id: 'sub_test_123',
          status: 'active'
        },
        error: null
      });

      mockCreem.cancelSubscription.mockResolvedValue({
        data: {
          id: 'sub_test_123',
          status: 'canceled',
          cancelAtPeriodEnd: false
        }
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          cancelAtPeriodEnd: false
        }
      });

      const response = await cancelSubscriptionHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockCreem.cancelSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          cancelSubscription: {
            cancelAtPeriodEnd: false
          }
        })
      );
    });

    it('should return error if no active subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          stripe_subscription_id: null,
          status: null
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        }
      });

      const response = await cancelSubscriptionHandler(request);
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('No active subscription found');
    });
  });

  describe('POST /api/payment/resume-subscription', () => {
    it('should resume cancelled subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          stripe_subscription_id: 'sub_test_123',
          status: 'active',
          cancel_at_period_end: true
        },
        error: null
      });

      mockCreem.updateSubscription.mockResolvedValue({
        data: {
          id: 'sub_test_123',
          status: 'active',
          cancelAtPeriodEnd: false
        }
      });

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: {
          status: 'active',
          cancel_at_period_end: false
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        }
      });

      const response = await resumeSubscriptionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cancel_at_period_end).toBe(false);

      expect(mockCreem.updateSubscription).toHaveBeenCalledWith({
        subscriptionId: 'sub_test_123',
        xApiKey: 'test_secret_key',
        updateSubscription: {
          cancelAtPeriodEnd: false
        }
      });
    });

    it('should return error if subscription not scheduled for cancellation', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          stripe_subscription_id: 'sub_test_123',
          status: 'active',
          cancel_at_period_end: false
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        }
      });

      const response = await resumeSubscriptionHandler(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Subscription is not scheduled for cancellation');
    });
  });

  describe('POST /api/payment/upgrade-subscription', () => {
    it('should upgrade from Pro to Pro+', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          stripe_subscription_id: 'sub_test_123',
          tier: 'pro',
          status: 'active'
        },
        error: null
      });

      mockCreem.upgradeSubscription.mockResolvedValue({
        data: {
          id: 'sub_test_123',
          status: 'active',
          priceId: 'price_test_proplus_1900'
        }
      });

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: {
          tier: 'pro_plus'
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          newPlanId: 'pro_plus'
        }
      });

      const response = await upgradeSubscriptionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tier).toBe('pro_plus');

      expect(mockCreem.upgradeSubscription).toHaveBeenCalledWith({
        subscriptionId: 'sub_test_123',
        xApiKey: 'test_secret_key',
        upgradeSubscription: {
          priceId: 'price_test_proplus_1900',
          prorationBehavior: 'create_prorations'
        }
      });
    });

    it('should prevent downgrade attempts', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          tier: 'pro_plus',
          status: 'active'
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          newPlanId: 'pro'
        }
      });

      const response = await upgradeSubscriptionHandler(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Cannot downgrade subscription');
    });

    it('should handle invalid upgrade paths', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          tier: 'free',
          status: null
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          newPlanId: 'pro_plus'
        }
      });

      const response = await upgradeSubscriptionHandler(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('No active subscription to upgrade');
    });
  });

  describe('POST /api/webhooks/creem', () => {
    it('should handle checkout.completed event', async () => {
      const webhookPayload = {
        eventType: 'checkout.completed',
        id: 'evt_test_123',
        object: {
          id: 'checkout_test_123',
          customer: { id: 'cus_test_123', email: 'test@example.com' },
          subscription: { id: 'sub_test_123' },
          metadata: {
            userId: 'user_123',
            planId: 'pro'
          }
        }
      };

      const payload = JSON.stringify(webhookPayload);
      const signature = createWebhookSignature(payload, process.env.CREEM_WEBHOOK_SECRET!);

      // Mock database operations
      mockSupabase.from().upsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        })
      });

      mockSupabase.from().update().eq.mockResolvedValue({ data: {}, error: null });

      const request = createNextRequest({
        headers: {
          'creem-signature': signature
        },
        body: webhookPayload
      });

      // Override text() method to return raw payload
      request.text = vi.fn().mockResolvedValue(payload);

      const response = await webhookHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);

      // Verify subscription was created/updated
      expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions');
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should handle subscription.active event', async () => {
      const webhookPayload = {
        eventType: 'subscription.active',
        object: {
          id: 'sub_active_123',
          customer: { id: 'cus_active_123' },
          status: 'active',
          current_period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          product: { id: 'prod_test_pro' }
        }
      };

      const payload = JSON.stringify(webhookPayload);
      const signature = createWebhookSignature(payload, process.env.CREEM_WEBHOOK_SECRET!);

      mockSupabase.from().update().eq.mockResolvedValue({ data: {}, error: null });

      const request = createNextRequest({
        headers: {
          'creem-signature': signature
        },
        body: webhookPayload
      });

      request.text = vi.fn().mockResolvedValue(payload);

      const response = await webhookHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions');
    });

    it('should handle subscription.canceled event', async () => {
      const webhookPayload = {
        eventType: 'subscription.canceled',
        object: {
          id: 'sub_canceled_123',
          customer: { id: 'cus_canceled_123' },
          metadata: { userId: 'user_123' }
        }
      };

      const payload = JSON.stringify(webhookPayload);
      const signature = createWebhookSignature(payload, process.env.CREEM_WEBHOOK_SECRET!);

      // Mock finding user by customer ID
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { user_id: 'user_123' },
        error: null
      });

      mockSupabase.from().update().eq.mockResolvedValue({ data: {}, error: null });

      const request = createNextRequest({
        headers: {
          'creem-signature': signature
        },
        body: webhookPayload
      });

      request.text = vi.fn().mockResolvedValue(payload);

      const response = await webhookHandler(request);
      
      expect(response.status).toBe(200);

      // Verify user was downgraded to free
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_tier: 'free',
          quota_limit: 10
        })
      );
    });

    it('should handle subscription.paid event', async () => {
      const webhookPayload = {
        eventType: 'subscription.paid',
        object: {
          id: 'sub_paid_123',
          customer: { id: 'cus_paid_123' },
          metadata: { userId: 'user_123' }
        }
      };

      const payload = JSON.stringify(webhookPayload);
      const signature = createWebhookSignature(payload, process.env.CREEM_WEBHOOK_SECRET!);

      mockSupabase.from().update().eq.mockResolvedValue({ data: {}, error: null });

      const request = createNextRequest({
        headers: {
          'creem-signature': signature
        },
        body: webhookPayload
      });

      request.text = vi.fn().mockResolvedValue(payload);

      const response = await webhookHandler(request);
      
      expect(response.status).toBe(200);

      // Verify usage was reset
      expect(mockSupabase.from).toHaveBeenCalledWith('user_usage');
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          generation_count: 0
        })
      );
    });

    it('should handle refund.created event', async () => {
      const webhookPayload = {
        eventType: 'refund.created',
        object: {
          id: 'refund_123',
          refund_amount: 900,
          customer: { id: 'cus_refund_123' },
          subscription: { id: 'sub_refund_123' },
          checkout: { id: 'checkout_refund_123' }
        }
      };

      const payload = JSON.stringify(webhookPayload);
      const signature = createWebhookSignature(payload, process.env.CREEM_WEBHOOK_SECRET!);

      const request = createNextRequest({
        headers: {
          'creem-signature': signature
        },
        body: webhookPayload
      });

      request.text = vi.fn().mockResolvedValue(payload);

      const response = await webhookHandler(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.received).toBe(true);
    });

    it('should reject invalid webhook signatures', async () => {
      const webhookPayload = {
        eventType: 'test.event',
        object: {}
      };

      const request = createNextRequest({
        headers: {
          'creem-signature': 'invalid_signature'
        },
        body: webhookPayload
      });

      request.text = vi.fn().mockResolvedValue(JSON.stringify(webhookPayload));

      const response = await webhookHandler(request);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid signature');
    });

    it('should reject missing signature header', async () => {
      const request = createNextRequest({
        body: { eventType: 'test.event' }
      });

      request.text = vi.fn().mockResolvedValue('{}');

      const response = await webhookHandler(request);
      
      expect(response.status).toBe(401);
    });

    it('should handle webhook parsing errors', async () => {
      const signature = createWebhookSignature('invalid json', process.env.CREEM_WEBHOOK_SECRET!);

      const request = createNextRequest({
        headers: {
          'creem-signature': signature
        }
      });

      request.text = vi.fn().mockResolvedValue('invalid json');

      const response = await webhookHandler(request);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Webhook processing failed');
    });

    it('should handle duplicate webhook events idempotently', async () => {
      const webhookPayload = {
        eventType: 'checkout.completed',
        id: 'evt_duplicate_123',
        object: {
          customer: { id: 'cus_dup_123' },
          metadata: { userId: 'user_123', planId: 'pro' }
        }
      };

      const payload = JSON.stringify(webhookPayload);
      const signature = createWebhookSignature(payload, process.env.CREEM_WEBHOOK_SECRET!);

      mockSupabase.from().upsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        })
      });

      const request = createNextRequest({
        headers: {
          'creem-signature': signature
        },
        body: webhookPayload
      });

      request.text = vi.fn().mockResolvedValue(payload);

      // Send same webhook twice
      const response1 = await webhookHandler(request);
      const response2 = await webhookHandler(request);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Verify upsert was used (handles duplicates)
      expect(mockSupabase.from().upsert).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Database connection failed'));

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          planId: 'pro',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        }
      });

      const response = await createCheckoutHandler(request);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Failed to create checkout session');
    });

    it('should handle Creem API timeout', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { tier: 'free' },
        error: null
      });

      // Mock timeout error
      mockCreem.createCheckout.mockRejectedValue(new Error('Request timeout'));

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          planId: 'pro',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        }
      });

      const response = await createCheckoutHandler(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Request timeout');
    });

    it('should handle concurrent modification conflicts', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      // Mock optimistic locking error
      mockSupabase.from().update().eq().select().single.mockRejectedValue({
        code: '23505', // Unique violation
        message: 'Concurrent modification detected'
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        }
      });

      const response = await cancelSubscriptionHandler(request);
      
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toContain('conflict');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on checkout creation', async () => {
      const requests = [];
      const mockUser = {
        data: {
          user: { id: 'user_rate_limit', email: 'ratelimit@example.com' }
        },
        error: null
      };

      mockSupabase.auth.getUser.mockResolvedValue(mockUser);
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { tier: 'free' },
        error: null
      });

      // Create multiple requests
      for (let i = 0; i < 10; i++) {
        requests.push(createNextRequest({
          headers: {
            'authorization': 'Bearer test_token'
          },
          body: {
            planId: 'pro',
            successUrl: 'http://localhost:3000/success',
            cancelUrl: 'http://localhost:3000/cancel'
          }
        }));
      }

      // Send requests rapidly
      const responses = await Promise.all(
        requests.map(req => createCheckoutHandler(req))
      );

      // Check if rate limiting kicked in
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection in user lookups', async () => {
      const maliciousUserId = "'; DROP TABLE users; --";
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: maliciousUserId, email: 'test@example.com' }
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          planId: 'pro',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        }
      });

      const response = await createCheckoutHandler(request);
      
      // Should handle safely without executing malicious SQL
      expect(response.status).toBeLessThan(500);
    });

    it('should sanitize webhook metadata', async () => {
      const webhookPayload = {
        eventType: 'checkout.completed',
        object: {
          customer: { id: 'cus_xss_test' },
          metadata: {
            userId: '<script>alert("xss")</script>',
            planId: 'pro<img src=x onerror=alert(1)>'
          }
        }
      };

      const payload = JSON.stringify(webhookPayload);
      const signature = createWebhookSignature(payload, process.env.CREEM_WEBHOOK_SECRET!);

      const request = createNextRequest({
        headers: {
          'creem-signature': signature
        },
        body: webhookPayload
      });

      request.text = vi.fn().mockResolvedValue(payload);

      const response = await webhookHandler(request);
      
      // Should process without executing scripts
      expect(response.status).toBe(200);
    });

    it('should validate redirect URLs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      const request = createNextRequest({
        headers: {
          'authorization': 'Bearer test_token'
        },
        body: {
          planId: 'pro',
          successUrl: 'javascript:alert(1)',
          cancelUrl: 'http://evil.com/phishing'
        }
      });

      const response = await createCheckoutHandler(request);
      
      // Should reject invalid URLs
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid URL');
    });
  });
});