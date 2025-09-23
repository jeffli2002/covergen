// BestAuth Database Wrapper with Connection Error Handling
import { db as bestAuthDb } from './db'
import { getSubscriptionConfig } from '@/lib/subscription-config'

/**
 * Wrapper for BestAuth database operations with connection error handling
 * Falls back gracefully when database is not available
 */
export const db = {
  ...bestAuthDb,
  
  // Override subscription operations with safe fallbacks
  subscriptions: {
    ...bestAuthDb.subscriptions,
    
    async findByUserId(userId: string): Promise<any | null> {
      try {
        return await bestAuthDb.subscriptions.findByUserId(userId)
      } catch (error) {
        console.error('BestAuth: Failed to find subscription:', error)
        return null
      }
    },

    async getStatus(userId: string): Promise<any | null> {
      try {
        return await bestAuthDb.subscriptions.getStatus(userId)
      } catch (error) {
        console.error('BestAuth: Failed to get subscription status:', error)
        // Return default free subscription status with config values
        const config = getSubscriptionConfig()
        
        return {
          subscription_id: null,
          user_id: userId,
          tier: 'free',
          status: 'active',
          is_trialing: false,
          trial_days_remaining: 0,
          can_generate: true,
          usage_today: 0,
          daily_limit: config.limits.free.daily,
          monthly_limit: config.limits.free.monthly,
          has_payment_method: false,
          requires_payment_setup: false,
          next_billing_date: null
        }
      }
    },

    async create(subscriptionData: any): Promise<any> {
      try {
        return await bestAuthDb.subscriptions.create(subscriptionData)
      } catch (error) {
        console.error('BestAuth: Failed to create subscription:', error)
        throw error
      }
    },

    async update(userId: string, updates: any): Promise<any> {
      try {
        return await bestAuthDb.subscriptions.update(userId, updates)
      } catch (error) {
        console.error('BestAuth: Failed to update subscription:', error)
        throw error
      }
    },

    async upsert(subscriptionData: any): Promise<any> {
      try {
        return await bestAuthDb.subscriptions.upsert(subscriptionData)
      } catch (error) {
        console.error('BestAuth: Failed to upsert subscription:', error)
        throw error
      }
    }
  },

  usage: {
    ...bestAuthDb.usage,
    
    async getToday(userId: string): Promise<number> {
      try {
        return await bestAuthDb.usage.getToday(userId)
      } catch (error) {
        console.error('BestAuth: Failed to get usage:', error)
        // Return 0 to prevent app crashes when usage table doesn't exist
        return 0
      }
    },

    async getTodayBySession(sessionId: string): Promise<number> {
      try {
        return await bestAuthDb.usage.getTodayBySession(sessionId)
      } catch (error) {
        console.error('BestAuth: Failed to get session usage:', error)
        return 0
      }
    },

    async increment(userId: string, amount: number = 1): Promise<number> {
      try {
        return await bestAuthDb.usage.increment(userId, amount)
      } catch (error) {
        console.error('BestAuth: Failed to increment usage:', error)
        // Return the amount as if it was incremented to prevent app crashes
        return amount
      }
    },

    async incrementBySession(sessionId: string, amount: number = 1): Promise<number> {
      try {
        return await bestAuthDb.usage.incrementBySession(sessionId, amount)
      } catch (error) {
        console.error('BestAuth: Failed to increment session usage:', error)
        return amount
      }
    },

    async checkLimit(userId: string): Promise<boolean> {
      try {
        return await bestAuthDb.usage.checkLimit(userId)
      } catch (error) {
        console.error('BestAuth: Failed to check limit:', error)
        return true // Allow generation on error
      }
    },

    async checkLimitBySession(sessionId: string): Promise<boolean> {
      try {
        return await bestAuthDb.usage.checkLimitBySession(sessionId)
      } catch (error) {
        console.error('BestAuth: Failed to check session limit:', error)
        return true // Allow generation on error
      }
    },

    async getMonthlyUsage(userId: string): Promise<number> {
      try {
        return await bestAuthDb.usage.getMonthlyUsage(userId)
      } catch (error) {
        console.error('BestAuth: Failed to get monthly usage:', error)
        return 0
      }
    }
  },

  profiles: {
    ...bestAuthDb.profiles,
    
    async findByUserId(userId: string): Promise<any | null> {
      try {
        return await bestAuthDb.profiles.findByUserId(userId)
      } catch (error) {
        console.error('BestAuth: Failed to find profile:', error)
        return null
      }
    },

    async upsert(profileData: any): Promise<any> {
      try {
        return await bestAuthDb.profiles.upsert(profileData)
      } catch (error) {
        console.error('BestAuth: Failed to upsert profile:', error)
        throw error
      }
    }
  },

  payments: {
    ...bestAuthDb.payments,
    
    async create(paymentData: any): Promise<any> {
      try {
        return await bestAuthDb.payments.create(paymentData)
      } catch (error) {
        console.error('BestAuth: Failed to create payment:', error)
        throw error
      }
    },

    async findByUserId(userId: string, limit: number = 10): Promise<any[]> {
      try {
        return await bestAuthDb.payments.findByUserId(userId, limit)
      } catch (error) {
        console.error('BestAuth: Failed to find payments:', error)
        return []
      }
    },

    async findByInvoiceId(invoiceId: string): Promise<any | null> {
      try {
        return await bestAuthDb.payments.findByInvoiceId(invoiceId)
      } catch (error) {
        console.error('BestAuth: Failed to find payment by invoice:', error)
        return null
      }
    }
  }
}