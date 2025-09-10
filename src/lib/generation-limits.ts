import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getSubscriptionConfig } from './subscription-config'

export interface GenerationLimitStatus {
  monthly_usage: number
  monthly_limit: number | null
  daily_usage: number
  daily_limit: number | null
  trial_usage: number
  trial_limit: number | null
  can_generate: boolean
  is_trial: boolean
  trial_ends_at: string | null
  subscription_tier: string
  remaining_monthly: number | null
  remaining_trial: number | null
  remaining_daily: number
}

export async function checkGenerationLimit(userId: string | null): Promise<GenerationLimitStatus | null> {
  const supabase = await createClient()
  const config = getSubscriptionConfig()

  // For unauthenticated users, always return free tier limits
  if (!userId) {
    return {
      monthly_usage: 0,
      monthly_limit: config.limits.free.monthly,
      daily_usage: 0,
      daily_limit: config.limits.free.daily,
      trial_usage: 0,
      trial_limit: null,
      can_generate: true,
      is_trial: false,
      trial_ends_at: null,
      subscription_tier: 'free',
      remaining_monthly: config.limits.free.monthly,
      remaining_trial: null,
      remaining_daily: config.limits.free.daily
    }
  }

  try {
    // First set the configuration for this session
    const configData = {
      trial_days: config.trialDays,
      free_daily: config.limits.free.daily,
      free_monthly: config.limits.free.monthly,
      pro_monthly: config.limits.pro.monthly,
      pro_trial_daily: config.limits.pro.trial_daily,
      pro_plus_monthly: config.limits.pro_plus.monthly,
      pro_plus_trial_daily: config.limits.pro_plus.trial_daily
    }
    
    await supabase.rpc('set_subscription_config', { p_config: configData })

    // Get current generation limit status
    const { data, error } = await supabase
      .rpc('check_generation_limit', { 
        p_user_id: userId,
        p_subscription_tier: 'free' // Will be overridden by actual tier in function
      })

    if (error) {
      console.error('Error checking generation limit:', error)
      return null
    }

    return data as GenerationLimitStatus
  } catch (error) {
    console.error('Error checking generation limit:', error)
    return null
  }
}

export async function incrementGenerationCount(userId: string, subscriptionTier: string = 'free'): Promise<GenerationLimitStatus | null> {
  const supabase = await createClient()
  const config = getSubscriptionConfig()

  try {
    // First set the configuration for this session
    const configData = {
      trial_days: config.trialDays,
      free_daily: config.limits.free.daily,
      free_monthly: config.limits.free.monthly,
      pro_monthly: config.limits.pro.monthly,
      pro_trial_daily: config.limits.pro.trial_daily,
      pro_plus_monthly: config.limits.pro_plus.monthly,
      pro_plus_trial_daily: config.limits.pro_plus.trial_daily
    }
    
    await supabase.rpc('set_subscription_config', { p_config: configData })

    const { data, error } = await supabase
      .rpc('increment_generation_count', { 
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

export async function getUserSubscriptionInfo(userId: string): Promise<{
  subscription_tier: string,
  is_trial: boolean,
  trial_ends_at: string | null
}> {
  const supabase = await createClient()

  try {
    // First try to get from subscriptions table (most up-to-date)
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('tier, status, current_period_end')
      .eq('user_id', userId)
      .single()

    if (!subError && subData) {
      const isTrialing = subData.status === 'trialing'
      return {
        subscription_tier: subData.tier || 'free',
        is_trial: isTrialing,
        trial_ends_at: isTrialing ? subData.current_period_end : null
      }
    }

    // Fallback to profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (!profileError && profileData) {
      return {
        subscription_tier: profileData.subscription_tier || 'free',
        is_trial: false,
        trial_ends_at: null
      }
    }

    return {
      subscription_tier: 'free',
      is_trial: false,
      trial_ends_at: null
    }
  } catch (error) {
    console.error('Error getting subscription info:', error)
    return {
      subscription_tier: 'free',
      is_trial: false,
      trial_ends_at: null
    }
  }
}