// BestAuth Subscription Service
import { db } from '@/lib/bestauth/db-wrapper'
import { getSubscriptionConfig } from '@/lib/subscription-config'

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
      
      const result = {
        ...status,
        next_billing_date: status.next_billing_date ? new Date(status.next_billing_date) : undefined
      }
      
      console.log('[BestAuthSubscriptionService.getUserSubscription] Returning subscription:', {
        tier: result.tier,
        status: result.status,
        plan: result.plan
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
    metadata?: any
  }): Promise<any> {
    try {
      return await db.subscriptions.upsert({
        user_id: data.userId,
        tier: data.tier,
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
        metadata: data.metadata
      })
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