import { createClient } from '@supabase/supabase-js'
import { getSubscriptionConfig, isTrialEnabled } from '@/lib/subscription-config'

export interface TrialUpgradeOptions {
  userId: string
  fromTier: 'free' | 'pro' | 'pro_plus'
  toTier: 'pro' | 'pro_plus'
  isTrialActive: boolean
  trialEndsAt: Date | null
}

export interface UpgradeResult {
  success: boolean
  message: string
  shouldCreateNewSubscription: boolean
  trialDaysRemaining?: number
}

export class TrialUpgradeService {
  /**
   * Check if a user can upgrade during their trial period
   */
  static async canUpgradeDuringTrial(options: TrialUpgradeOptions): Promise<UpgradeResult> {
    const config = getSubscriptionConfig()
    
    // If trials are disabled (trial_days = 0), always create new subscription
    if (!isTrialEnabled()) {
      return {
        success: true,
        message: 'Trials are disabled. Creating new subscription.',
        shouldCreateNewSubscription: true
      }
    }

    // If user is not on trial, create new subscription
    if (!options.isTrialActive || !options.trialEndsAt) {
      return {
        success: true,
        message: 'User is not on trial. Creating new subscription.',
        shouldCreateNewSubscription: true
      }
    }

    // Calculate remaining trial days
    const now = new Date()
    const trialEndDate = new Date(options.trialEndsAt)
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // If upgrading from free to paid during trial
    if (options.fromTier === 'free') {
      return {
        success: true,
        message: `Upgrading to ${options.toTier} with ${daysRemaining} trial days remaining.`,
        shouldCreateNewSubscription: false,
        trialDaysRemaining: daysRemaining
      }
    }

    // If upgrading from pro to pro_plus during trial
    if (options.fromTier === 'pro' && options.toTier === 'pro_plus') {
      return {
        success: true,
        message: `Upgrading from Pro to Pro+ with ${daysRemaining} trial days remaining.`,
        shouldCreateNewSubscription: false,
        trialDaysRemaining: daysRemaining
      }
    }

    // Downgrade during trial is not allowed
    if (options.fromTier === 'pro_plus' && options.toTier === 'pro') {
      return {
        success: false,
        message: 'Downgrade during trial period is not allowed. Please wait until trial ends.',
        shouldCreateNewSubscription: false
      }
    }

    return {
      success: true,
      message: 'Creating new subscription.',
      shouldCreateNewSubscription: true
    }
  }

  /**
   * Update user's trial status when upgrading
   */
  static async updateTrialUpgrade(
    userId: string,
    newTier: 'pro' | 'pro_plus',
    trialEndsAt: Date | null
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create admin Supabase client
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // Update user's trial tier
      const { error: rpcError } = await adminSupabase.rpc('update_user_trial_status', {
        p_user_id: userId,
        p_trial_ends_at: trialEndsAt?.toISOString() || null,
        p_subscription_tier: newTier
      })

      if (rpcError) {
        console.error('[TrialUpgrade] Error updating trial status:', rpcError)
        return { success: false, error: rpcError.message }
      }

      // Update subscription record
      const { error: subError } = await adminSupabase
        .from('subscriptions')
        .update({
          tier: newTier,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'trialing')

      if (subError) {
        console.error('[TrialUpgrade] Error updating subscription:', subError)
        return { success: false, error: subError.message }
      }

      // Update profile
      const config = getSubscriptionConfig()
      const newLimit = newTier === 'pro' ? config.limits.pro.monthly : config.limits.pro_plus.monthly
      
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .update({
          subscription_tier: newTier,
          quota_limit: newLimit,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) {
        console.error('[TrialUpgrade] Error updating profile:', profileError)
        return { success: false, error: profileError.message }
      }

      console.log(`[TrialUpgrade] Successfully upgraded user ${userId} to ${newTier} during trial`)
      return { success: true }
    } catch (error) {
      console.error('[TrialUpgrade] Unexpected error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Calculate prorated trial limits when upgrading
   */
  static calculateProratedTrialLimits(
    fromTier: 'pro' | 'pro_plus',
    toTier: 'pro' | 'pro_plus',
    daysRemaining: number,
    currentTrialUsage: number
  ): {
    newTrialLimit: number
    additionalCredits: number
  } {
    const config = getSubscriptionConfig()
    
    // Get daily rates
    const fromDailyRate = fromTier === 'pro' 
      ? config.limits.pro.monthly / 30 
      : config.limits.pro_plus.monthly / 30
    
    const toDailyRate = toTier === 'pro' 
      ? config.limits.pro.monthly / 30 
      : config.limits.pro_plus.monthly / 30

    // Calculate what user would have for remaining days on new tier
    const newTrialLimit = Math.ceil(toDailyRate * daysRemaining)
    
    // Calculate additional credits (ensure user doesn't lose credits)
    const additionalCredits = Math.max(0, newTrialLimit - currentTrialUsage)

    return {
      newTrialLimit,
      additionalCredits
    }
  }
}