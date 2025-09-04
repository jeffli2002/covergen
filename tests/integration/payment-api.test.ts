import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST as createCheckoutHandler } from '@/app/api/payment/create-checkout/route';
import { POST as createPortalHandler } from '@/app/api/payment/create-portal/route';
import { POST as cancelSubscriptionHandler } from '@/app/api/payment/cancel-subscription/route';
import { POST as resumeSubscriptionHandler } from '@/app/api/payment/resume-subscription/route';
import { POST as upgradeSubscriptionHandler } from '@/app/api/payment/upgrade-subscription/route';
import { POST as webhookHandler } from '@/app/api/webhooks/creem/route';
import { createServerClient } from '@supabase/ssr';

// Mock Supabase
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    },
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

// Mock CreemService
vi.mock('@/services/payment/creem', () => ({
  CreemService: vi.fn().mockImplementation(() => ({
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
    cancelSubscription: vi.fn(),
    resumeSubscription: vi.fn(),
    upgradeSubscription: vi.fn(),
    handleWebhook: vi.fn()
  }))
}));

describe('Payment API Integration Tests', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createServerClient('', '');
  });

  describe('POST /api/payment/create-checkout', () => {
    it('should create checkout session for authenticated user', async () => {
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

      // Mock user data
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          subscription_tier: 'free',
          subscription_status: null
        },
        error: null
      });

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          plan: 'pro'
        }
      });

      const response = await createCheckoutHandler(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('url');
    });

    it('should return 401 for unauthenticated users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const { req } = createMocks({
        method: 'POST',
        body: { plan: 'pro' }
      });

      const response = await createCheckoutHandler(req as any);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid plan', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      const { req } = createMocks({
        method: 'POST',
        body: { plan: 'invalid_plan' }
      });

      const response = await createCheckoutHandler(req as any);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid plan');
    });

    it('should prevent upgrade if user already has active subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          subscription_tier: 'pro',
          subscription_status: 'active'
        },
        error: null
      });

      const { req } = createMocks({
        method: 'POST',
        body: { plan: 'pro' }
      });

      const response = await createCheckoutHandler(req as any);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Already subscribed to this plan');
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
          creem_customer_id: 'cus_test_123',
          subscription_tier: 'pro',
          subscription_status: 'active'
        },
        error: null
      });

      const { req } = createMocks({
        method: 'POST'
      });

      const response = await createPortalHandler(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('url');
    });

    it('should return 404 for users without subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          creem_customer_id: null,
          subscription_tier: 'free'
        },
        error: null
      });

      const { req } = createMocks({
        method: 'POST'
      });

      const response = await createPortalHandler(req as any);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('No customer found');
    });
  });

  describe('POST /api/payment/cancel-subscription', () => {
    it('should cancel active subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          creem_subscription_id: 'sub_test_123',
          subscription_status: 'active'
        },
        error: null
      });

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: {
          subscription_status: 'active',
          subscription_cancel_at_period_end: true
        },
        error: null
      });

      const { req } = createMocks({
        method: 'POST'
      });

      const response = await cancelSubscriptionHandler(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subscription_status).toBe('active');
      expect(data.subscription_cancel_at_period_end).toBe(true);
    });

    it('should return 404 if no active subscription', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          creem_subscription_id: null,
          subscription_status: null
        },
        error: null
      });

      const { req } = createMocks({
        method: 'POST'
      });

      const response = await cancelSubscriptionHandler(req as any);

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
          creem_subscription_id: 'sub_test_123',
          subscription_status: 'active',
          subscription_cancel_at_period_end: true
        },
        error: null
      });

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: {
          subscription_status: 'active',
          subscription_cancel_at_period_end: false
        },
        error: null
      });

      const { req } = createMocks({
        method: 'POST'
      });

      const response = await resumeSubscriptionHandler(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subscription_cancel_at_period_end).toBe(false);
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
          creem_subscription_id: 'sub_test_123',
          subscription_tier: 'pro',
          subscription_status: 'active'
        },
        error: null
      });

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: {
          subscription_tier: 'pro_plus'
        },
        error: null
      });

      const { req } = createMocks({
        method: 'POST',
        body: { newPlan: 'pro_plus' }
      });

      const response = await upgradeSubscriptionHandler(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subscription_tier).toBe('pro_plus');
    });

    it('should return 400 for invalid upgrade path', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          subscription_tier: 'pro_plus',
          subscription_status: 'active'
        },
        error: null
      });

      const { req } = createMocks({
        method: 'POST',
        body: { newPlan: 'pro' }
      });

      const response = await upgradeSubscriptionHandler(req as any);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Cannot downgrade subscription');
    });
  });

  describe('POST /api/webhooks/creem', () => {
    it('should handle valid webhook with correct signature', async () => {
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

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'creem-signature': 'valid_signature'
        },
        body: webhookPayload
      });

      const response = await webhookHandler(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should reject webhook with invalid signature', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'creem-signature': 'invalid_signature'
        },
        body: { type: 'test' }
      });

      const response = await webhookHandler(req as any);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('signature');
    });

    it('should handle missing signature header', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {},
        body: { type: 'test' }
      });

      const response = await webhookHandler(req as any);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing creem-signature header');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on checkout creation', async () => {
      // Simulate multiple rapid requests
      const requests = Array(6).fill(null).map(() => 
        createMocks({
          method: 'POST',
          body: { plan: 'pro' }
        })
      );

      // First 5 requests should succeed
      for (let i = 0; i < 5; i++) {
        const response = await createCheckoutHandler(requests[i].req as any);
        expect(response.status).toBeLessThan(429);
      }

      // 6th request should be rate limited
      const response = await createCheckoutHandler(requests[5].req as any);
      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toContain('rate limit');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      mockSupabase.from().select().eq().single.mockRejectedValue(
        new Error('Database connection error')
      );

      const { req } = createMocks({
        method: 'POST',
        body: { plan: 'pro' }
      });

      const response = await createCheckoutHandler(req as any);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should handle payment provider errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' }
        },
        error: null
      });

      // Mock CreemService to throw error
      const CreemService = vi.mocked(await import('@/services/payment/creem')).CreemService;
      const mockInstance = new CreemService();
      (mockInstance.createCheckoutSession as any).mockRejectedValue(
        new Error('Payment provider unavailable')
      );

      const { req } = createMocks({
        method: 'POST',
        body: { plan: 'pro' }
      });

      const response = await createCheckoutHandler(req as any);

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toContain('Payment service');
    });
  });
});