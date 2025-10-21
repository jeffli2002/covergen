// BestAuth Subscription Service
import { db } from '@/lib/bestauth/db-wrapper'
import { getSubscriptionConfig } from '@/lib/subscription-config'
import type { GenerationType } from '@/config/subscription'
import { normalizeSubscriptionTier } from '@/lib/subscription-tier'
import { userSyncService } from '@/services/sync/UserSyncService'

const isValidUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value)

export interface SubscriptionStatus {
  subscription_id?: string
  user_id: string
  tier: 'free' | 'pro' | 'pro_plus'
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'trialing' | 'paused' | 'past_due'
  is_trialing: boolean
  trial_days_remaining: number
  can_generate: boolean
  usage_today: number
  daily_limit: number
  monthly_limit: number
  has_payment_method: boolean
  requires_payment_setup: boolean
  next_billing_date?: Date
  // Stripe fields
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  stripe_payment_method_id?: string | null
  // Cancellation fields
  cancel_at_period_end?: boolean
  cancelled_at?: Date | null
  // Billing cycle
  billing_cycle?: 'monthly' | 'yearly'
  // Upgrade tracking fields
  previous_tier?: 'free' | 'pro' | 'pro_plus'
  upgrade_history?: any[]
  proration_amount?: number | null
  last_proration_date?: Date | null
  last_renewed_at?: Date | null
  // Metadata
  metadata?: any
}

export class BestAuthSubscriptionService {
  /**
   * Get user subscription status with all computed fields
   */
  async getUserSubscription(userId: string): Promise<SubscriptionStatus | null> {
    try {
      console.log('[BestAuthSubscriptionService.getUserSubscription] Getting subscription for user:', userId)
      
      // Get subscription status from database function
      const status = await db.subscriptions.getStatus(userId)
      
      console.log('[BestAuthSubscriptionService.getUserSubscription] Status from db:', {
        hasStatus: !!status,
        tier: status?.tier,
        status: status?.status,
        stripe_subscription_id: status?.stripe_subscription_id
      })
      
      if (!status) {
        console.log('[BestAuthSubscriptionService.getUserSubscription] No subscription found, creating default free subscription')
        // Create default free subscription if none exists
        await db.subscriptions.create({
          userId,
          tier: 'free',
          status: 'active'
        })
        
        // Try again
        const newStatus = await db.subscriptions.getStatus(userId)
        console.log('[BestAuthSubscriptionService.getUserSubscription] Created new subscription:', {
          tier: newStatus?.tier,
          status: newStatus?.status
        })
        return newStatus ? {
          ...newStatus,
          next_billing_date: newStatus.next_billing_date ? new Date(newStatus.next_billing_date) : undefined
        } : null
      }
      
      const normalizedTier = normalizeSubscriptionTier(status.tier, status.billing_cycle)
      const normalizedPreviousTier = normalizeSubscriptionTier(status.previous_tier)

      const result = {
        ...status,
        tier: normalizedTier.tier ?? status.tier ?? 'free',
        billing_cycle: normalizedTier.billingCycle ?? status.billing_cycle,
        previous_tier: normalizedPreviousTier.tier ?? status.previous_tier,
        next_billing_date: status.next_billing_date ? new Date(status.next_billing_date) : undefined
      }
      
      console.log('[BestAuthSubscriptionService.getUserSubscription] Returning subscription:', {
        tier: result.tier,
        status: result.status,
        billing_cycle: result.billing_cycle,
        previous_tier: result.previous_tier
      })
      
      return result
    } catch (error) {
      console.error('Error getting subscription:', error)
      return null
    }
  }

  /**
   * Get user's usage for today
   */
  async getUserUsageToday(userId: string): Promise<number> {
    try {
      return await db.usage.getToday(userId)
    } catch (error) {
      console.error('Error getting usage:', error)
      return 0
    }
  }

  /**
   * Get session's usage for today
   */
  async getSessionUsageToday(sessionId: string): Promise<number> {
    try {
      return await db.usage.getTodayBySession(sessionId)
    } catch (error) {
      console.error('Error getting session usage:', error)
      return 0
    }
  }

  /**
   * Get user's usage for the current month
   */
  async getUserUsageThisMonth(userId: string): Promise<number> {
    try {
      return await db.usage.getMonthlyUsage(userId)
    } catch (error) {
      console.error('Error getting monthly usage:', error)
      return 0
    }
  }
  
  /**
   * Get user's video usage for today
   */
  async getUserVideoUsageToday(userId: string): Promise<number> {
    try {
      return await db.usage.getTodayByType(userId, 'video')
    } catch (error) {
      console.error('Error getting video usage today:', error)
      return 0
    }
  }
  
  /**
   * Get user's image usage for today
   */
  async getUserImageUsageToday(userId: string): Promise<number> {
    try {
      return await db.usage.getTodayByType(userId, 'image')
    } catch (error) {
      console.error('Error getting image usage today:', error)
      return 0
    }
  }
  
  /**
   * Get user's video usage for this month
   */
  async getUserVideoUsageThisMonth(userId: string): Promise<number> {
    try {
      return await db.usage.getMonthlyUsageByType(userId, 'video')
    } catch (error) {
      console.error('Error getting video usage this month:', error)
      return 0
    }
  }
  
  /**
   * Get user's image usage for this month
   */
  async getUserImageUsageThisMonth(userId: string): Promise<number> {
    try {
      return await db.usage.getMonthlyUsageByType(userId, 'image')
    } catch (error) {
      console.error('Error getting image usage this month:', error)
      return 0
    }
  }
  
  /**
   * Increment user's video usage count
   */
  async incrementUserVideoUsage(userId: string, amount: number = 1): Promise<{ success: boolean; newCount?: number }> {
    try {
      const canGenerate = await this.canUserGenerateVideo(userId)
      
      if (!canGenerate) {
        return { success: false }
      }
      
      const newCount = await db.usage.incrementByType(userId, 'video', amount)
      return { success: true, newCount }
    } catch (error) {
      console.error('Error incrementing video usage:', error)
      return { success: false }
    }
  }

  /**
   * Increment user's usage count
   */
  async incrementUsage(userId: string, amount: number = 1): Promise<{success: boolean, newCount?: number}> {
    try {
      // First check if user can generate
      const canGenerate = await db.usage.checkLimit(userId)
      
      if (!canGenerate) {
        return { success: false }
      }
      
      const newCount = await db.usage.increment(userId, amount)
      return { success: true, newCount }
    } catch (error) {
      console.error('Error incrementing usage:', error)
      return { success: false }
    }
  }

  /**
   * Increment session's usage count
   */
  async incrementSessionUsage(sessionId: string, amount: number = 1): Promise<{success: boolean, newCount?: number}> {
    try {
      // First check if session can generate
      const canGenerate = await db.usage.checkLimitBySession(sessionId)
      
      if (!canGenerate) {
        return { success: false }
      }
      
      const newCount = await db.usage.incrementBySession(sessionId, amount)
      return { success: true, newCount }
    } catch (error) {
      console.error('Error incrementing session usage:', error)
      return { success: false }
    }
  }

  /**
   * Check if user can generate (hasn't hit limits)
   */
  async canUserGenerate(userId: string): Promise<boolean> {
    try {
      return await db.usage.checkLimit(userId)
    } catch (error) {
      console.error('Error checking generation limit:', error)
      return false
    }
  }

  /**
   * Check if user can generate image (hasn't hit image limits)
   * For free users: Check BOTH daily and monthly limits
   * For paid users: Check ONLY monthly limit (daily is set equal to monthly as placeholder)
   */
  async canUserGenerateImage(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (!subscription) return false
      
      const limits = this.getSubscriptionLimits(subscription.tier, subscription.is_trialing)
      const tier = subscription.tier
      const isTrialing = subscription.is_trialing
      
      const usageThisMonth = await db.usage.getMonthlyUsageByType(userId, 'image')
      
      // For free users or trial users, check both daily and monthly
      if (tier === 'free' || isTrialing) {
        const usageToday = await db.usage.getTodayByType(userId, 'image')
        return usageToday < limits.images.daily && usageThisMonth < limits.images.monthly
      }
      
      // For paid users (Pro/Pro+), only check monthly
      return usageThisMonth < limits.images.monthly
    } catch (error) {
      console.error('Error checking image generation limit:', error)
      return false
    }
  }

  /**
   * Check if user can generate video (hasn't hit video limits)
   * For free users: Check BOTH daily and monthly limits
   * For paid users: Check ONLY monthly limit (daily is set equal to monthly as placeholder)
   */
  async canUserGenerateVideo(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (!subscription) return false
      
      const limits = this.getSubscriptionLimits(subscription.tier, subscription.is_trialing)
      const tier = subscription.tier
      const isTrialing = subscription.is_trialing
      
      const usageThisMonth = await db.usage.getMonthlyUsageByType(userId, 'video')
      
      // For free users or trial users, check both daily and monthly
      if (tier === 'free' || isTrialing) {
        const usageToday = await db.usage.getTodayByType(userId, 'video')
        return usageToday < limits.videos.daily && usageThisMonth < limits.videos.monthly
      }
      
      // For paid users (Pro/Pro+), only check monthly
      return usageThisMonth < limits.videos.monthly
    } catch (error) {
      console.error('Error checking video generation limit:', error)
      return false
    }
  }

  /**
   * Check if session can generate (hasn't hit limits)
   */
  async canSessionGenerate(sessionId: string): Promise<boolean> {
    try {
      return await db.usage.checkLimitBySession(sessionId)
    } catch (error) {
      console.error('Error checking session generation limit:', error)
      return false
    }
  }

  /**
   * Create or update a subscription
   * If upgrading to Pro/Pro+, automatically grants points
   */
  async createOrUpdateSubscription(data: {
    userId: string
    tier?: 'free' | 'pro' | 'pro_plus'
    status?: 'active' | 'cancelled' | 'expired' | 'pending' | 'trialing' | 'paused' | 'past_due'
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripePriceId?: string
    stripePaymentMethodId?: string
    trialEndsAt?: Date
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
    cancelledAt?: Date
    billingCycle?: 'monthly' | 'yearly'
    previousTier?: 'free' | 'pro' | 'pro_plus'
    upgradeHistory?: any[]
    prorationAmount?: number | null
    lastProrationDate?: Date | null
    lastRenewedAt?: Date | null
    metadata?: any
  }): Promise<any> {
    try {
      console.log('[BestAuthSubscriptionService.createOrUpdateSubscription] Starting upsert with data:', {
        userId: data.userId,
        tier: data.tier,
        status: data.status,
        previousTier: data.previousTier,
        billingCycle: data.billingCycle,
        hasUpgradeHistory: !!data.upgradeHistory,
        upgradeHistoryLength: data.upgradeHistory?.length,
        prorationAmount: data.prorationAmount
      })

      const normalizedTier = normalizeSubscriptionTier(data.tier, data.billingCycle)
      const normalizedPreviousTier = normalizeSubscriptionTier(data.previousTier)
      const resolvedTier = normalizedTier.tier ?? data.tier
      const resolvedBillingCycle = normalizedTier.billingCycle ?? data.billingCycle
      const resolvedPreviousTier = normalizedPreviousTier.tier ?? data.previousTier

      if (normalizedTier.wasNormalized) {
        console.log('[BestAuthSubscriptionService.createOrUpdateSubscription] Normalized tier value:', {
          original: data.tier,
          normalized: resolvedTier,
          billingCycle: resolvedBillingCycle
        })
      }

      if (normalizedPreviousTier.wasNormalized) {
        console.log('[BestAuthSubscriptionService.createOrUpdateSubscription] Normalized previous tier value:', {
          original: data.previousTier,
          normalized: resolvedPreviousTier
        })
      }
      
      const upsertData = {
        user_id: data.userId,
        tier: resolvedTier,
        status: data.status,
        stripe_customer_id: data.stripeCustomerId,
        stripe_subscription_id: data.stripeSubscriptionId,
        stripe_price_id: data.stripePriceId,
        stripe_payment_method_id: data.stripePaymentMethodId,
        trial_ends_at: data.trialEndsAt?.toISOString(),
        current_period_start: data.currentPeriodStart?.toISOString(),
        current_period_end: data.currentPeriodEnd?.toISOString(),
        cancel_at_period_end: data.cancelAtPeriodEnd,
        cancelled_at: data.cancelledAt?.toISOString(),
        billing_cycle: resolvedBillingCycle,
        previous_tier: resolvedPreviousTier,
        upgrade_history: data.upgradeHistory,
        proration_amount: data.prorationAmount,
        last_proration_date: data.lastProrationDate?.toISOString(),
        last_renewed_at: data.lastRenewedAt?.toISOString(),
        metadata: data.metadata
      }
      
      console.log('[BestAuthSubscriptionService.createOrUpdateSubscription] Calling db.subscriptions.upsert')
      const result = await db.subscriptions.upsert(upsertData)
      console.log('[BestAuthSubscriptionService.createOrUpdateSubscription] Upsert completed:', {
        success: !!result,
        resultId: result?.id,
        resultTier: result?.tier,
        resultStatus: result?.status
      })

      // Grant credits for Pro/Pro+ subscriptions (not for free tier)
      // Free users use rate limits (bestauth_usage_tracking), paid users get credits
      const grantTier = resolvedTier ?? data.tier ?? 'free'

      if (grantTier !== 'free' && data.status === 'active' && result?.id) {
        try {
          const { SUBSCRIPTION_CONFIG } = await import('@/config/subscription')
          const cycle = resolvedBillingCycle || data.billingCycle || 'monthly'
          const tierConfig = grantTier === 'pro' ? SUBSCRIPTION_CONFIG.pro : SUBSCRIPTION_CONFIG.proPlus
          const credits = tierConfig.points[cycle]

          console.log(`[BestAuthSubscriptionService] Granting ${credits} credits for ${grantTier} ${cycle}`)

          // Use BestAuth database function to add credits
          const { getBestAuthSupabaseClient } = await import('@/lib/bestauth/db-client')
          const supabase = getBestAuthSupabaseClient()
          
          if (supabase) {
            const metadata = typeof data.metadata === 'object' && data.metadata ? data.metadata : {}
            const metadataSupabaseCandidates = [
              metadata.resolved_supabase_user_id,
              metadata.supabase_user_id,
              metadata.original_payload_user_id,
              metadata.original_userId
            ].filter(isValidUuid)

            let pointsUserId: string | null = metadataSupabaseCandidates[0] || null
            let mappedSupabaseId: string | null = null

            try {
              const { data: mapping, error: mappingError } = await supabase
                .from('user_id_mapping')
                .select('supabase_user_id')
                .eq('bestauth_user_id', data.userId)
                .maybeSingle()

              if (mappingError && mappingError.code !== 'PGRST116') {
                console.error('[BestAuthSubscriptionService] Error querying user_id_mapping during points grant:', mappingError)
              }

              if (mapping?.supabase_user_id && isValidUuid(mapping.supabase_user_id)) {
                mappedSupabaseId = mapping.supabase_user_id
                pointsUserId = mapping.supabase_user_id
                console.log(`[BestAuthSubscriptionService] Found Supabase mapping for user ${data.userId} -> ${mapping.supabase_user_id}`)
              }
            } catch (mappingException) {
              console.error('[BestAuthSubscriptionService] Failed to resolve Supabase user mapping for points grant:', mappingException)
            }

            if (!pointsUserId && isValidUuid(data.stripeCustomerId || '')) {
              console.warn('[BestAuthSubscriptionService] Stripe customer id looked like UUID, but skipping as Supabase user id')
            }

            if (!pointsUserId) {
              console.error('[BestAuthSubscriptionService] Unable to determine Supabase user id for points grant', {
                bestAuthUserId: data.userId
              })
            } else {
              if (!mappedSupabaseId || mappedSupabaseId !== pointsUserId) {
                try {
                  await userSyncService.createUserMapping(pointsUserId, data.userId)
                  console.log('[BestAuthSubscriptionService] Ensured Supabase↔BestAuth user mapping during points grant')
                } catch (mappingCreateError: any) {
                  if (mappingCreateError?.code === '23505') {
                    console.warn('[BestAuthSubscriptionService] Mapping already existed while ensuring user mapping during points grant')
                  } else {
                    console.error('[BestAuthSubscriptionService] Failed to create user mapping during points grant:', mappingCreateError)
                  }
                }
              }

              const { data: creditsResult, error: creditsError } = await supabase.rpc('add_points', {
                p_user_id: pointsUserId,
                p_amount: credits,
                p_transaction_type: 'subscription_grant',
                p_description: `${tierConfig.name} ${cycle} subscription: ${credits} credits`,
                p_subscription_id: null,
                p_metadata: {
                  tier: grantTier,
                  cycle,
                  source: 'subscription',
                  bestauth_user_id: data.userId,
                  resolved_supabase_user_id: pointsUserId
                }
              })

              if (creditsError) {
                console.error('[BestAuthSubscriptionService] CRITICAL: Failed to grant credits:', creditsError)
                console.error('[BestAuthSubscriptionService] User details:', {
                  bestAuthUserId: data.userId,
                  pointsUserId,
                  tier: grantTier,
                  cycle,
                  credits
                })
                // Store failed grant in subscription metadata for later retry
                const failedGrantMetadata = {
                  failed_credit_grant: {
                    error: creditsError.message,
                    timestamp: new Date().toISOString(),
                    user_id: pointsUserId,
                    amount: credits,
                    tier: grantTier,
                    cycle
                  }
                }
                console.warn('[BestAuthSubscriptionService] ⚠️  MANUAL FIX REQUIRED - Run audit script to grant credits')
                console.warn('[BestAuthSubscriptionService] Failed grant metadata stored for retry')
              } else {
                console.log(`[BestAuthSubscriptionService] ✅ Successfully granted ${credits} credits to user ${data.userId}`)
                console.log('[BestAuthSubscriptionService] Credits result:', creditsResult)
                
                // Verify credits were actually granted
                if (!creditsResult || creditsResult.new_balance < credits) {
                  console.error('[BestAuthSubscriptionService] ⚠️  Credits grant succeeded but balance is unexpected:', {
                    expected: credits,
                    actual: creditsResult?.new_balance,
                    result: creditsResult
                  })
                }
              }
            }
          } else {
            console.error('[BestAuthSubscriptionService] Cannot grant credits - BestAuth database client not available')
          }
        } catch (creditsError: any) {
          console.error('[BestAuthSubscriptionService] Exception while granting credits:', creditsError)
          // Don't fail the subscription update
          console.warn('[BestAuthSubscriptionService] Subscription succeeded but credits were not granted - may need manual adjustment')
        }
      }

      return result
    } catch (error) {
      console.error('Error creating/updating subscription:', error)
      throw error
    }
  }

  /**
   * Start a trial for a user
   */
  async startTrial(userId: string, tier: 'pro' | 'pro_plus', trialDays?: number): Promise<any> {
    const config = getSubscriptionConfig()
    const actualTrialDays = trialDays ?? config.trialDays
    
    // Calculate trial end date
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + actualTrialDays)
    
    // Get trial limits from configuration
    const trialLimits = this.getSubscriptionLimits(tier, true)
    
    return await this.createOrUpdateSubscription({
      userId,
      tier,
      status: 'trialing',
      trialEndsAt,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEndsAt,
      metadata: {
        trial_daily_limit: trialLimits.daily,
        trial_total_limit: trialLimits.monthly,
        trial_days: actualTrialDays
      }
    })
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = true): Promise<any> {
    try {
      const subscription = await db.subscriptions.findByUserId(userId)
      
      if (!subscription) {
        throw new Error('Subscription not found')
      }
      
      // If cancelling at period end, keep status as active but set the flag
      // If cancelling immediately, set status to cancelled
      const updateData: any = {
        cancelAtPeriodEnd,
        cancelledAt: new Date()
      }
      
      if (!cancelAtPeriodEnd) {
        updateData.status = 'cancelled'
      }
      
      return await db.subscriptions.update(userId, updateData)
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      throw error
    }
  }

  /**
   * Resume a cancelled subscription
   */
  async resumeSubscription(userId: string): Promise<any> {
    try {
      return await db.subscriptions.update(userId, {
        cancelAtPeriodEnd: false,
        cancelledAt: undefined,
        cancelAt: undefined
      })
    } catch (error) {
      console.error('Error resuming subscription:', error)
      throw error
    }
  }

  /**
   * Record a payment
   */
  async recordPayment(data: {
    userId: string
    stripePaymentIntentId?: string
    stripeInvoiceId?: string
    amount: number
    currency?: string
    status: string
    description?: string
    metadata?: any
  }): Promise<any> {
    try {
      return await db.payments.create(data)
    } catch (error) {
      console.error('Error recording payment:', error)
      throw error
    }
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      return await db.payments.findByUserId(userId, limit)
    } catch (error) {
      console.error('Error getting payment history:', error)
      return []
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    try {
      await db.credentials.update(userId, newPasswordHash)
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  /**
   * Get or create user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const profile = await db.profiles.findByUserId(userId)
      
      if (!profile) {
        // Create default profile
        return await db.profiles.upsert({ userId })
      }
      
      return profile
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: {
    fullName?: string
    avatarUrl?: string
    phone?: string
    address?: any
    metadata?: any
  }): Promise<any> {
    try {
      return await db.profiles.upsert({
        userId,
        ...data
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  /**
   * Merge session usage to user on signup
   */
  async mergeSessionUsageToUser(userId: string, sessionId: string): Promise<boolean> {
    try {
      console.log('[BestAuthSubscriptionService.mergeSessionUsageToUser] Merging session usage:', { userId, sessionId })
      return await db.usage.mergeSessionUsageToUser(userId, sessionId)
    } catch (error) {
      console.error('Error merging session usage:', error)
      return false
    }
  }

  /**
   * Check subscription limits based on tier
   * Returns separate limits for images and videos
   */
  getSubscriptionLimits(tier: 'free' | 'pro' | 'pro_plus', isTrialing: boolean = false) {
    const config = getSubscriptionConfig()
    
    // Import subscription plans for detailed limits
    const { getSubscriptionPlans } = require('@/lib/subscription-plans')
    const plans = getSubscriptionPlans()
    const plan = plans.find((p: any) => p.id === tier)
    
    if (!plan) {
      // Fallback to default free limits
      return {
        daily: 3,
        monthly: 10,
        images: { daily: 3, monthly: 10 },
        videos: { daily: 1, monthly: 5 }
      }
    }
    
    if (isTrialing) {
      // Use configured trial limits from environment variables
      if (tier === 'pro') {
        return {
          daily: config.limits.pro.trial_daily,
          monthly: config.limits.pro.trial_total || 0,
          images: { daily: config.limits.pro.trial_daily, monthly: config.limits.pro.trial_total || 0 },
          videos: { daily: config.limits.pro.trial_daily, monthly: config.limits.pro.trial_total || 0 }
        }
      } else if (tier === 'pro_plus') {
        return {
          daily: config.limits.pro_plus.trial_daily,
          monthly: config.limits.pro_plus.trial_total || 0,
          images: { daily: config.limits.pro_plus.trial_daily, monthly: config.limits.pro_plus.trial_total || 0 },
          videos: { daily: config.limits.pro_plus.trial_daily, monthly: config.limits.pro_plus.trial_total || 0 }
        }
      } else {
        // Free tier doesn't have trials, use regular limits
        return {
          daily: plan.limits.images.daily + plan.limits.videos.daily,
          monthly: plan.limits.images.monthly + plan.limits.videos.monthly,
          images: plan.limits.images,
          videos: plan.limits.videos
        }
      }
    }
    
    // Regular (non-trial) limits from subscription plans
    if (tier === 'free') {
      return {
        daily: plan.limits.images.daily + plan.limits.videos.daily,
        monthly: plan.limits.images.monthly + plan.limits.videos.monthly,
        images: plan.limits.images,
        videos: plan.limits.videos
      }
    } else {
      // Pro and Pro+ use their configured limits
      return {
        daily: plan.limits.images.daily + plan.limits.videos.daily,
        monthly: plan.limits.images.monthly + plan.limits.videos.monthly,
        images: plan.limits.images,
        videos: plan.limits.videos
      }
    }
  }
}

// Export singleton instance
export const bestAuthSubscriptionService = new BestAuthSubscriptionService()
