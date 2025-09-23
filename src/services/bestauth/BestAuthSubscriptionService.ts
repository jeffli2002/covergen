// BestAuth Subscription Service
import { db } from '@/lib/bestauth/db-wrapper'
import { getSubscriptionConfig } from '@/lib/subscription-config'

export interface SubscriptionStatus {
  subscription_id?: string
  user_id: string
  tier: 'free' | 'pro' | 'pro_plus'
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'trialing' | 'paused'
  is_trialing: boolean
  trial_days_remaining: number
  can_generate: boolean
  usage_today: number
  daily_limit: number
  monthly_limit: number
  has_payment_method: boolean
  requires_payment_setup: boolean
  next_billing_date?: Date
}

export class BestAuthSubscriptionService {
  /**
   * Get user subscription status with all computed fields
   */
  async getUserSubscription(userId: string): Promise<SubscriptionStatus | null> {
    try {
      // Get subscription status from database function
      const status = await db.subscriptions.getStatus(userId)
      
      if (!status) {
        // Create default free subscription if none exists
        await db.subscriptions.create({
          userId,
          tier: 'free',
          status: 'active'
        })
        
        // Try again
        return await db.subscriptions.getStatus(userId)
      }
      
      return {
        ...status,
        next_billing_date: status.next_billing_date ? new Date(status.next_billing_date) : undefined
      }
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
    status?: 'active' | 'cancelled' | 'expired' | 'pending' | 'trialing' | 'paused'
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripePriceId?: string
    stripePaymentMethodId?: string
    trialEndsAt?: Date
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
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
      
      return await db.subscriptions.update(userId, {
        status: cancelAtPeriodEnd ? 'active' : 'cancelled',
        cancelAtPeriodEnd,
        cancelledAt: new Date()
      })
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
   * Check subscription limits based on tier
   */
  getSubscriptionLimits(tier: 'free' | 'pro' | 'pro_plus', isTrialing: boolean = false) {
    const config = getSubscriptionConfig()
    
    if (isTrialing) {
      // Use configured trial limits from environment variables
      if (tier === 'pro') {
        return {
          daily: config.limits.pro.trial_daily,
          monthly: config.limits.pro.trial_total || 0
        }
      } else if (tier === 'pro_plus') {
        return {
          daily: config.limits.pro_plus.trial_daily,
          monthly: config.limits.pro_plus.trial_total || 0
        }
      } else {
        // Free tier doesn't have trials, use regular limits
        return {
          daily: config.limits.free.daily,
          monthly: config.limits.free.monthly
        }
      }
    }
    
    // Regular (non-trial) limits
    if (tier === 'free') {
      return {
        daily: config.limits.free.daily,
        monthly: config.limits.free.monthly
      }
    } else {
      // Pro and Pro+ use monthly limits only when not in trial
      return {
        daily: config.limits[tier].monthly, // No daily limit for paid plans
        monthly: config.limits[tier].monthly
      }
    }
  }
}

// Export singleton instance
export const bestAuthSubscriptionService = new BestAuthSubscriptionService()