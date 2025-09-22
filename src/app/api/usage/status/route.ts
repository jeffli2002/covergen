import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGenerationLimit } from '@/lib/generation-limits'
import { getSubscriptionConfig } from '@/lib/subscription-config'
import { authConfig } from '@/config/auth.config'
import { validateSessionFromRequest } from '@/lib/bestauth/request-utils'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

export async function GET(request: NextRequest) {
  try {
    // Get subscription config
    const config = getSubscriptionConfig()
    
    let userId: string | null = null
    
    // Use BestAuth if enabled
    if (authConfig.USE_BESTAUTH) {
      const session = await validateSessionFromRequest(request)
      
      if (session.success && session.data) {
        userId = session.data.user.id
        console.log('[Usage Status] BestAuth user:', session.data.user?.email, userId)
        
        // Get comprehensive usage data from BestAuth
        const subscription = await bestAuthSubscriptionService.getUserSubscription(userId!)
        const usageToday = await bestAuthSubscriptionService.getUserUsageToday(userId!)
        const usageThisMonth = await bestAuthSubscriptionService.getUserUsageThisMonth(userId!)
        
        // Get limits based on subscription tier
        const tier = (subscription?.tier || 'free') as 'free' | 'pro' | 'pro_plus'
        const isTrialing = subscription?.is_trialing || false
        const limits = bestAuthSubscriptionService.getSubscriptionLimits(tier, isTrialing)
        
        return NextResponse.json({
          daily_usage: usageToday,
          daily_limit: limits.daily,
          monthly_usage: usageThisMonth,
          monthly_limit: limits.monthly,
          remaining_daily: Math.max(0, limits.daily - usageToday),
          remaining_monthly: Math.max(0, limits.monthly - usageThisMonth),
          is_trial: subscription?.is_trialing || false,
          subscription_tier: subscription?.tier || 'free',
          trial_ends_at: (subscription as any)?.trial_ends_at
        })
      }
    } else {
      // Fallback to Supabase auth
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
      console.log('[Usage Status] Supabase user:', user?.email, userId)
    }
    
    // Get generation limit status
    const limitStatus = await checkGenerationLimit(userId)
    
    console.log('[Usage Status] Limit status result:', limitStatus)
    
    if (!limitStatus) {
      // Return default free tier limits if check fails
      const config = getSubscriptionConfig()
      return NextResponse.json({
        daily_usage: 0,
        daily_limit: config.limits.free.daily,
        remaining_daily: config.limits.free.daily,
        is_trial: false,
        subscription_tier: 'free'
      })
    }
    
    // Return comprehensive status for header display
    return NextResponse.json({
      daily_usage: limitStatus.daily_usage,
      daily_limit: limitStatus.daily_limit || 
        (limitStatus.is_trial 
          ? Math.ceil((limitStatus.trial_limit || 0) / config.trialDays) // Estimate daily from trial total
          : limitStatus.monthly_limit || 0),
      monthly_usage: limitStatus.monthly_usage,
      monthly_limit: limitStatus.monthly_limit,
      remaining_daily: limitStatus.remaining_daily,
      remaining_monthly: limitStatus.remaining_monthly,
      is_trial: limitStatus.is_trial,
      subscription_tier: limitStatus.subscription_tier,
      trial_ends_at: limitStatus.trial_ends_at
    })
    
  } catch (error) {
    console.error('[Usage Status] Error:', error)
    // Return default free tier on error
    const config = getSubscriptionConfig()
    return NextResponse.json({
      daily_usage: 0,
      daily_limit: config.limits.free.daily,
      remaining_daily: config.limits.free.daily,
      is_trial: false,
      subscription_tier: 'free'
    })
  }
}