import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export interface GenerationLimitStatus {
  daily_count: number
  daily_limit: number
  can_generate: boolean
  is_trial: boolean
  subscription_tier: string
  remaining?: number
}

export async function checkGenerationLimit(userId: string | null): Promise<GenerationLimitStatus> {
  const supabase = await createClient()

  // For unauthenticated users, always return free tier limits
  if (!userId) {
    return {
      daily_count: 0,
      daily_limit: 3,
      can_generate: true,
      is_trial: false,
      subscription_tier: 'free',
      remaining: 3
    }
  }

  try {
    // Get current daily usage
    const { data, error } = await supabase
      .rpc('get_daily_generation_count', { p_user_id: userId })

    if (error) {
      console.error('Error getting generation count:', error)
      // Return default free tier on error
      return {
        daily_count: 0,
        daily_limit: 3,
        can_generate: true,
        is_trial: false,
        subscription_tier: 'free',
        remaining: 3
      }
    }

    return data as GenerationLimitStatus
  } catch (error) {
    console.error('Error checking generation limit:', error)
    return {
      daily_count: 0,
      daily_limit: 3,
      can_generate: true,
      is_trial: false,
      subscription_tier: 'free',
      remaining: 3
    }
  }
}

export async function incrementGenerationCount(userId: string, subscriptionTier: string = 'free'): Promise<GenerationLimitStatus> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .rpc('increment_daily_generation', { 
        p_user_id: userId,
        p_subscription_tier: subscriptionTier
      })

    if (error) {
      console.error('Error incrementing generation count:', error)
      throw error
    }

    return data as GenerationLimitStatus
  } catch (error) {
    console.error('Error incrementing generation count:', error)
    throw error
  }
}

export async function getUserSubscriptionTier(userId: string): Promise<string> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('auth.users')
      .select('creem_subscription_tier, creem_trial_ends_at')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return 'free'
    }

    // Check if user is on trial
    if (data.creem_trial_ends_at && new Date(data.creem_trial_ends_at) > new Date()) {
      return 'free' // Trial users have free tier limits
    }

    return data.creem_subscription_tier || 'free'
  } catch (error) {
    console.error('Error getting subscription tier:', error)
    return 'free'
  }
}