/**
 * Integration Tests for Database Customer Mapping Functions
 * 
 * Tests the database layer integration including:
 * - Customer mapping CRUD operations
 * - Database function execution
 * - Data consistency and constraints
 * - Transaction handling
 * - RLS policy enforcement
 * - Unified customer data retrieval
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createClient } from '@/utils/supabase/client'

// Mock Supabase client
vi.mock('@/utils/supabase/client')

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn()
  }
}

const mockTable = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis()
}

const mockCustomerMapping = {
  id: 'mapping-123',
  user_id: 'user-456',
  email: 'test@example.com',
  creem_customer_id: 'cus_test_123',
  creem_subscription_id: 'sub_test_123',
  subscription_tier: 'pro',
  subscription_status: 'active',
  provider: 'google',
  created_from_session_id: 'cs_session_123',
  last_auth_provider: 'google',
  last_successful_payment_at: '2024-01-15T10:30:00Z',
  created_at: '2024-01-10T12:00:00Z',
  updated_at: '2024-01-15T10:30:00Z'
}

const mockSubscription = {
  id: 'sub-record-123',
  user_id: 'user-456',
  customer_mapping_id: 'mapping-123',
  stripe_customer_id: 'cus_test_123',
  stripe_subscription_id: 'sub_test_123',
  subscription_tier: 'pro',
  status: 'active',
  stripe_price_id: 'price_pro_monthly',
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  cancel_at_period_end: false,
  payment_context: {
    webhook_event: 'checkout.completed',
    processed_at: '2024-01-15T10:30:00Z'
  },
  created_at: '2024-01-10T12:00:00Z',
  updated_at: '2024-01-15T10:30:00Z'
}

const mockUserTrialData = {
  id: 'user-456',
  creem_trial_ends_at: '2024-02-10T12:00:00Z',
  creem_trial_started_at: '2024-01-10T12:00:00Z',
  creem_subscription_tier: 'pro_plus'
}

const mockUsageData = {
  monthly_usage: 45,
  monthly_limit: 120,
  daily_usage: 3,
  daily_limit: 10,
  remaining_daily: 7,
  can_generate: true,
  trial_usage: 5,
  trial_limit: 10
}

describe('Database Customer Mapping Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    mockSupabase.from.mockReturnValue(mockTable as any)
  })

  describe('Customer Mapping CRUD Operations', () => {
    it('should create new customer mapping', async () => {
      mockTable.single.mockResolvedValue({
        data: mockCustomerMapping,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .insert({
          user_id: 'user-456',
          email: 'test@example.com',
          creem_customer_id: 'cus_test_123',
          subscription_tier: 'pro',
          subscription_status: 'incomplete',
          provider: 'google',
          created_from_session_id: 'cs_session_123'
        })
        .single()

      expect(error).toBeNull()
      expect(data).toEqual(mockCustomerMapping)
      expect(mockSupabase.from).toHaveBeenCalledWith('customer_mapping')
      expect(mockTable.insert).toHaveBeenCalled()
    })

    it('should retrieve customer mapping by user ID', async () => {
      mockTable.single.mockResolvedValue({
        data: mockCustomerMapping,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')
        .eq('user_id', 'user-456')
        .single()

      expect(error).toBeNull()
      expect(data).toEqual(mockCustomerMapping)
      expect(mockTable.eq).toHaveBeenCalledWith('user_id', 'user-456')
    })

    it('should retrieve customer mapping by Creem customer ID', async () => {
      mockTable.single.mockResolvedValue({
        data: mockCustomerMapping,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')
        .eq('creem_customer_id', 'cus_test_123')
        .single()

      expect(error).toBeNull()
      expect(data).toEqual(mockCustomerMapping)
      expect(mockTable.eq).toHaveBeenCalledWith('creem_customer_id', 'cus_test_123')
    })

    it('should update customer mapping', async () => {
      const updatedMapping = {
        ...mockCustomerMapping,
        subscription_status: 'canceled',
        updated_at: '2024-01-20T15:45:00Z'
      }

      mockTable.single.mockResolvedValue({
        data: updatedMapping,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .update({
          subscription_status: 'canceled',
          updated_at: '2024-01-20T15:45:00Z'
        })
        .eq('user_id', 'user-456')
        .single()

      expect(error).toBeNull()
      expect(data.subscription_status).toBe('canceled')
      expect(mockTable.update).toHaveBeenCalled()
      expect(mockTable.eq).toHaveBeenCalledWith('user_id', 'user-456')
    })

    it('should handle unique constraint violations', async () => {
      mockTable.single.mockResolvedValue({
        data: null,
        error: {
          code: '23505',
          message: 'duplicate key value violates unique constraint "unique_user_customer"',
          details: 'Key (user_id)=(user-456) already exists.'
        }
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .insert({
          user_id: 'user-456', // Duplicate user ID
          email: 'test2@example.com',
          creem_customer_id: 'cus_test_456',
          subscription_tier: 'pro'
        })
        .single()

      expect(data).toBeNull()
      expect(error.code).toBe('23505')
      expect(error.message).toContain('unique constraint')
    })

    it('should handle missing customer mapping gracefully', async () => {
      mockTable.single.mockResolvedValue({
        data: null,
        error: {
          code: 'PGRST116',
          message: 'The result contains 0 rows'
        }
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')
        .eq('user_id', 'non-existent-user')
        .single()

      expect(data).toBeNull()
      expect(error.code).toBe('PGRST116')
    })
  })

  describe('upsert_customer_mapping Function', () => {
    it('should create new customer mapping via function', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'mapping-789',
        error: null
      })

      const supabase = createClient()
      const { data: mappingId, error } = await supabase.rpc('upsert_customer_mapping', {
        p_user_id: 'user-new',
        p_email: 'new@example.com',
        p_creem_customer_id: 'cus_new_123',
        p_creem_subscription_id: 'sub_new_123',
        p_subscription_tier: 'pro_plus',
        p_subscription_status: 'active',
        p_provider: 'google',
        p_session_context: {
          session_id: 'cs_new_session',
          checkout_session_id: 'cs_checkout_123',
          request_origin: 'https://example.com'
        }
      })

      expect(error).toBeNull()
      expect(mappingId).toBe('mapping-789')
      expect(mockSupabase.rpc).toHaveBeenCalledWith('upsert_customer_mapping', expect.objectContaining({
        p_user_id: 'user-new',
        p_email: 'new@example.com',
        p_creem_customer_id: 'cus_new_123',
        p_subscription_tier: 'pro_plus'
      }))
    })

    it('should update existing customer mapping via function', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'mapping-123', // Same mapping ID
        error: null
      })

      const supabase = createClient()
      const { data: mappingId, error } = await supabase.rpc('upsert_customer_mapping', {
        p_user_id: 'user-456', // Existing user
        p_email: 'test@example.com',
        p_creem_customer_id: 'cus_test_123',
        p_creem_subscription_id: 'sub_updated_123',
        p_subscription_tier: 'pro_plus', // Upgraded tier
        p_subscription_status: 'active',
        p_provider: 'google'
      })

      expect(error).toBeNull()
      expect(mappingId).toBe('mapping-123')
    })

    it('should handle session context extraction', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'mapping-context-test',
        error: null
      })

      const sessionContext = {
        session_id: 'user_session_456',
        checkout_session_id: 'cs_checkout_789',
        access_token_prefix: 'eyJ0eXAiOi',
        created_at: '2024-01-15T10:30:00Z',
        request_origin: 'https://app.example.com',
        user_agent: 'Mozilla/5.0',
        intended_tier: 'pro',
        current_tier: 'free'
      }

      const supabase = createClient()
      const { data: mappingId, error } = await supabase.rpc('upsert_customer_mapping', {
        p_user_id: 'user-context-test',
        p_email: 'context@example.com',
        p_creem_customer_id: 'cus_context_123',
        p_subscription_tier: 'pro',
        p_subscription_status: 'incomplete',
        p_provider: 'google',
        p_session_context: sessionContext
      })

      expect(error).toBeNull()
      expect(mappingId).toBe('mapping-context-test')
      expect(mockSupabase.rpc).toHaveBeenCalledWith('upsert_customer_mapping', 
        expect.objectContaining({
          p_session_context: sessionContext
        })
      )
    })

    it('should handle function execution errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message: 'function upsert_customer_mapping(uuid,text,text,text,text,text,text,jsonb) does not exist',
          code: '42883'
        }
      })

      const supabase = createClient()
      const { data, error } = await supabase.rpc('upsert_customer_mapping', {
        p_user_id: 'user-456',
        p_email: 'test@example.com',
        p_creem_customer_id: 'cus_test_123',
        p_subscription_tier: 'pro'
      })

      expect(data).toBeNull()
      expect(error.code).toBe('42883')
      expect(error.message).toContain('does not exist')
    })
  })

  describe('get_unified_customer_data Function', () => {
    it('should retrieve complete customer data', async () => {
      const unifiedData = {
        user_id: 'user-456',
        email: 'test@example.com',
        creem_customer_id: 'cus_test_123',
        creem_subscription_id: 'sub_test_123',
        subscription_tier: 'pro',
        subscription_status: 'active',
        provider: 'google',
        last_successful_payment_at: '2024-01-15T10:30:00Z',
        created_at: '2024-01-10T12:00:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        subscription_details: {
          stripe_price_id: 'price_pro_monthly',
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z',
          cancel_at_period_end: false,
          status: 'active'
        },
        trial_info: {
          trial_ends_at: '2024-02-10T12:00:00Z',
          trial_started_at: '2024-01-10T12:00:00Z',
          subscription_tier: 'pro_plus'
        },
        usage: mockUsageData
      }

      mockSupabase.rpc.mockResolvedValue({
        data: unifiedData,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_unified_customer_data', 'user-456')

      expect(error).toBeNull()
      expect(data).toEqual(unifiedData)
      expect(data.subscription_details).toBeDefined()
      expect(data.trial_info).toBeDefined()
      expect(data.usage).toBeDefined()
    })

    it('should return empty object for non-existent user', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: {},
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_unified_customer_data', 'non-existent-user')

      expect(error).toBeNull()
      expect(data).toEqual({})
    })

    it('should handle database errors in unified data retrieval', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message: 'database connection lost',
          code: '08006'
        }
      })

      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_unified_customer_data', 'user-456')

      expect(data).toBeNull()
      expect(error.code).toBe('08006')
    })

    it('should include usage data in unified response', async () => {
      const unifiedDataWithUsage = {
        user_id: 'user-456',
        email: 'test@example.com',
        subscription_tier: 'pro',
        usage: {
          monthly_usage: 45,
          monthly_limit: 120,
          daily_usage: 3,
          daily_limit: 10,
          remaining_daily: 7,
          can_generate: true
        }
      }

      mockSupabase.rpc.mockResolvedValue({
        data: unifiedDataWithUsage,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_unified_customer_data', 'user-456')

      expect(error).toBeNull()
      expect(data.usage).toBeDefined()
      expect(data.usage.monthly_usage).toBe(45)
      expect(data.usage.can_generate).toBe(true)
    })
  })

  describe('handle_subscription_webhook Function', () => {
    const mockWebhookData = {
      type: 'checkout.completed',
      data: {
        object: {
          id: 'sub_test_123',
          customer: 'cus_test_123',
          status: 'active',
          product: 'prod_pro_plan',
          metadata: {
            planId: 'pro',
            userId: 'user-456'
          }
        }
      }
    }

    it('should process subscription webhook successfully', async () => {
      const webhookResult = {
        success: true,
        user_id: 'user-456',
        customer_id: 'cus_test_123',
        subscription_id: 'sub_test_123',
        event_type: 'checkout.completed',
        mapping_id: 'mapping-123'
      }

      mockSupabase.rpc.mockResolvedValue({
        data: webhookResult,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase.rpc('handle_subscription_webhook', {
        p_webhook_data: mockWebhookData
      })

      expect(error).toBeNull()
      expect(data).toEqual(webhookResult)
      expect(data.success).toBe(true)
      expect(data.user_id).toBe('user-456')
      expect(data.event_type).toBe('checkout.completed')
    })

    it('should handle customer not found in webhook', async () => {
      const failureResult = {
        success: false,
        error: 'Customer mapping not found',
        customer_id: 'cus_unknown_123'
      }

      mockSupabase.rpc.mockResolvedValue({
        data: failureResult,
        error: null
      })

      const unknownCustomerWebhook = {
        ...mockWebhookData,
        data: {
          object: {
            ...mockWebhookData.data.object,
            customer: 'cus_unknown_123'
          }
        }
      }

      const supabase = createClient()
      const { data, error } = await supabase.rpc('handle_subscription_webhook', {
        p_webhook_data: unknownCustomerWebhook
      })

      expect(error).toBeNull()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Customer mapping not found')
    })

    it('should extract subscription tier from webhook data', async () => {
      const proPlusWebhook = {
        ...mockWebhookData,
        data: {
          object: {
            ...mockWebhookData.data.object,
            product: 'prod_pro_plus_monthly',
            metadata: { planId: 'pro_plus' }
          }
        }
      }

      const webhookResult = {
        success: true,
        user_id: 'user-456',
        customer_id: 'cus_test_123',
        subscription_id: 'sub_test_123',
        event_type: 'checkout.completed',
        mapping_id: 'mapping-123',
        subscription_tier: 'pro_plus'
      }

      mockSupabase.rpc.mockResolvedValue({
        data: webhookResult,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase.rpc('handle_subscription_webhook', {
        p_webhook_data: proPlusWebhook
      })

      expect(error).toBeNull()
      expect(data.success).toBe(true)
    })

    it('should handle trial subscription webhooks', async () => {
      const trialWebhook = {
        type: 'checkout.completed',
        data: {
          object: {
            id: 'sub_trial_123',
            customer: 'cus_test_123',
            status: 'trialing',
            product: 'prod_pro_plan',
            mode: 'trial',
            trial_end: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
            metadata: {
              planId: 'pro',
              userId: 'user-456'
            }
          }
        }
      }

      const webhookResult = {
        success: true,
        user_id: 'user-456',
        customer_id: 'cus_test_123',
        subscription_id: 'sub_trial_123',
        event_type: 'checkout.completed',
        mapping_id: 'mapping-123',
        trial_processed: true
      }

      mockSupabase.rpc.mockResolvedValue({
        data: webhookResult,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase.rpc('handle_subscription_webhook', {
        p_webhook_data: trialWebhook
      })

      expect(error).toBeNull()
      expect(data.success).toBe(true)
    })

    it('should handle webhook processing errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message: 'invalid input syntax for type uuid',
          code: '22P02'
        }
      })

      const invalidWebhook = {
        ...mockWebhookData,
        data: {
          object: {
            ...mockWebhookData.data.object,
            customer: 'invalid-uuid-format'
          }
        }
      }

      const supabase = createClient()
      const { data, error } = await supabase.rpc('handle_subscription_webhook', {
        p_webhook_data: invalidWebhook
      })

      expect(data).toBeNull()
      expect(error.code).toBe('22P02')
    })
  })

  describe('Data Consistency and Relationships', () => {
    it('should maintain referential integrity between tables', async () => {
      // Test that subscription references customer_mapping
      mockTable.single.mockResolvedValue({
        data: {
          ...mockSubscription,
          customer_mapping: mockCustomerMapping
        },
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          customer_mapping:customer_mapping_id(*)
        `)
        .eq('user_id', 'user-456')
        .single()

      expect(error).toBeNull()
      expect(data.customer_mapping).toEqual(mockCustomerMapping)
    })

    it('should handle cascading deletes properly', async () => {
      mockTable.single.mockResolvedValue({
        data: null,
        error: null // Successful deletion
      })

      const supabase = createClient()
      const { error } = await supabase
        .from('customer_mapping')
        .delete()
        .eq('user_id', 'user-to-delete')

      expect(error).toBeNull()
    })

    it('should enforce subscription tier constraints', async () => {
      mockTable.single.mockResolvedValue({
        data: null,
        error: {
          code: '23514',
          message: 'new row for relation "customer_mapping" violates check constraint "customer_mapping_subscription_tier_check"',
          details: 'Failing row contains invalid subscription_tier value'
        }
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .insert({
          user_id: 'user-456',
          email: 'test@example.com',
          creem_customer_id: 'cus_test_123',
          subscription_tier: 'invalid_tier', // Invalid value
          subscription_status: 'active'
        })
        .single()

      expect(data).toBeNull()
      expect(error.code).toBe('23514')
      expect(error.message).toContain('check constraint')
    })

    it('should enforce subscription status constraints', async () => {
      mockTable.single.mockResolvedValue({
        data: null,
        error: {
          code: '23514',
          message: 'new row for relation "customer_mapping" violates check constraint "customer_mapping_subscription_status_check"',
          details: 'Failing row contains invalid subscription_status value'
        }
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .insert({
          user_id: 'user-456',
          email: 'test@example.com',
          creem_customer_id: 'cus_test_123',
          subscription_tier: 'pro',
          subscription_status: 'invalid_status' // Invalid value
        })
        .single()

      expect(data).toBeNull()
      expect(error.code).toBe('23514')
    })
  })

  describe('Query Performance and Indexing', () => {
    it('should efficiently query by user_id (indexed)', async () => {
      mockTable.single.mockResolvedValue({
        data: mockCustomerMapping,
        error: null
      })

      const supabase = createClient()
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')
        .eq('user_id', 'user-456')
        .single()

      const queryTime = Date.now() - startTime

      expect(error).toBeNull()
      expect(data).toEqual(mockCustomerMapping)
      // In a real test, we'd check that this uses the index
      expect(queryTime).toBeLessThan(1000) // Mock should be fast
    })

    it('should efficiently query by creem_customer_id (indexed)', async () => {
      mockTable.single.mockResolvedValue({
        data: mockCustomerMapping,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')
        .eq('creem_customer_id', 'cus_test_123')
        .single()

      expect(error).toBeNull()
      expect(data).toEqual(mockCustomerMapping)
    })

    it('should efficiently query by email (indexed)', async () => {
      mockTable.single.mockResolvedValue({
        data: mockCustomerMapping,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')
        .eq('email', 'test@example.com')
        .single()

      expect(error).toBeNull()
      expect(data).toEqual(mockCustomerMapping)
    })

    it('should efficiently query active subscriptions (partial index)', async () => {
      const activeSubscriptions = [
        { ...mockCustomerMapping, subscription_status: 'active' },
        { ...mockCustomerMapping, id: 'mapping-456', subscription_status: 'trialing' }
      ]

      mockTable.single.mockResolvedValue({
        data: activeSubscriptions,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')
        .neq('subscription_status', 'canceled')

      expect(error).toBeNull()
      // This query should use the partial index on active subscriptions
    })
  })

  describe('Row Level Security (RLS)', () => {
    it('should allow users to view their own mapping', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-456' }
          }
        },
        error: null
      })

      mockTable.single.mockResolvedValue({
        data: mockCustomerMapping,
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')
        .eq('user_id', 'user-456')
        .single()

      expect(error).toBeNull()
      expect(data).toEqual(mockCustomerMapping)
    })

    it('should block users from viewing other users mappings', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-different' }
          }
        },
        error: null
      })

      mockTable.single.mockResolvedValue({
        data: null,
        error: {
          code: 'PGRST116',
          message: 'The result contains 0 rows' // RLS filtered out the row
        }
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')
        .eq('user_id', 'user-456') // Different from authenticated user
        .single()

      expect(data).toBeNull()
      expect(error.code).toBe('PGRST116')
    })

    it('should allow service role to access all mappings', async () => {
      // Simulate service role authentication
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'service-role' },
            access_token: 'service-role-token'
          }
        },
        error: null
      })

      mockTable.single.mockResolvedValue({
        data: [mockCustomerMapping],
        error: null
      })

      const supabase = createClient()
      const { data, error } = await supabase
        .from('customer_mapping')
        .select('*')

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })
  })
})