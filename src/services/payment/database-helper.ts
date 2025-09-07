/**
 * Database helper for payment services
 * Uses the existing Supabase admin client without creating new instances
 * This prevents the "Multiple GoTrueClient instances" error
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row']
type CustomerMappingRow = Database['public']['Tables']['customer_mapping']['Row']

// Singleton admin client for database operations
let adminClient: ReturnType<typeof createClient> | null = null

function getAdminClient() {
  if (!adminClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables')
    }
    
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return adminClient
}

/**
 * Get user subscription information
 * This is a read-only operation that doesn't affect auth state
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionRow | null> {
  try {
    const supabase = getAdminClient()
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[Database Helper] Error fetching subscription:', error)
      return null
    }
    
    return data || null
  } catch (error) {
    console.error('[Database Helper] Unexpected error:', error)
    return null
  }
}

/**
 * Get customer mapping information
 * This is a read-only operation that doesn't affect auth state
 */
export async function getCustomerMapping(userId: string): Promise<CustomerMappingRow | null> {
  try {
    const supabase = getAdminClient()
    
    const { data, error } = await supabase
      .from('customer_mapping')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[Database Helper] Error fetching customer mapping:', error)
      return null
    }
    
    return data || null
  } catch (error) {
    console.error('[Database Helper] Unexpected error:', error)
    return null
  }
}

/**
 * Update subscription status (webhook use only)
 * This should only be called by webhook handlers, not regular payment flows
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: string,
  tier: string,
  subscriptionData: any
) {
  try {
    const supabase = getAdminClient()
    
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status,
        tier,
        ...subscriptionData,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('[Database Helper] Error updating subscription:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('[Database Helper] Unexpected error:', error)
    return false
  }
}

/**
 * Get subscription by customer ID (webhook use only)
 */
export async function getSubscriptionByCustomerId(customerId: string): Promise<SubscriptionRow | null> {
  try {
    const supabase = getAdminClient()
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('[Database Helper] Error fetching subscription by customer ID:', error)
      return null
    }
    
    return data || null
  } catch (error) {
    console.error('[Database Helper] Unexpected error:', error)
    return null
  }
}

/**
 * Upsert subscription data (webhook use only)
 */
export async function upsertSubscription(subscriptionData: Partial<SubscriptionRow>): Promise<SubscriptionRow | null> {
  try {
    const supabase = getAdminClient()
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData)
      .select()
      .single()
    
    if (error) {
      console.error('[Database Helper] Error upserting subscription:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('[Database Helper] Unexpected error:', error)
    return null
  }
}

/**
 * Update subscription by ID (webhook use only)
 */
export async function updateSubscriptionById(id: string, updateData: Partial<SubscriptionRow>): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    
    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      console.error('[Database Helper] Error updating subscription by ID:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('[Database Helper] Unexpected error:', error)
    return false
  }
}