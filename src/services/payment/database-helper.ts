/**
 * Database helper for payment services
 * Uses the existing Supabase admin client without creating new instances
 * This prevents the "Multiple GoTrueClient instances" error
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import { Database } from '@/types/supabase'

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row']
type CustomerMappingRow = Database['public']['Tables']['customer_mapping']['Row']

// Use the existing admin client from supabase-server
function getAdminClient() {
  return supabaseAdmin
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
): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: status as 'active' | 'cancelled' | 'past_due',
        tier: tier as 'free' | 'pro' | 'pro_plus',
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
    
    // Ensure required fields are present for upsert
    const dataToUpsert = {
      ...subscriptionData,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(dataToUpsert as any) // Type assertion needed due to Supabase's strict typing
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