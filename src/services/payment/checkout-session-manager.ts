/**
 * Checkout Session Manager
 * Handles checkout session lifecycle including creation, validation, and cleanup
 */

import { createClient } from '@supabase/supabase-js'

// Create service role Supabase client for admin operations
const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export interface CheckoutSessionStatus {
  canCreate: boolean
  reason?: string
  activeSessionId?: string
  activeSessionUrl?: string
  attemptsRemaining?: number
}

export interface CheckoutSessionConfig {
  maxAttemptsPerHour: number
  sessionExpirationMinutes: number
  autoCleanupEnabled: boolean
}

export class CheckoutSessionManager {
  private config: CheckoutSessionConfig

  constructor(config?: Partial<CheckoutSessionConfig>) {
    this.config = {
      maxAttemptsPerHour: 5,
      sessionExpirationMinutes: 30,
      autoCleanupEnabled: true,
      ...config
    }
  }

  /**
   * Check if user can create a new checkout session
   */
  async canCreateSession(userId: string): Promise<CheckoutSessionStatus> {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      
      const { data, error } = await supabaseAdmin
        .rpc('can_create_checkout_session', {
          p_user_id: userId,
          p_max_attempts: this.config.maxAttemptsPerHour,
          p_window_minutes: 60
        })
        .single()

      if (error) {
        console.error('Error checking checkout eligibility:', error)
        return {
          canCreate: false,
          reason: 'Unable to verify checkout eligibility'
        }
      }

      if (data.allowed) {
        return {
          canCreate: true,
          attemptsRemaining: data.attempts_remaining
        }
      }

      // If there's an active session, get its details
      if (data.active_session_id) {
        const { data: activeSession } = await supabaseAdmin
          .from('checkout_sessions')
          .select('session_id, expires_at')
          .eq('id', data.active_session_id)
          .single()

        if (activeSession) {
          return {
            canCreate: false,
            reason: data.reason,
            activeSessionId: activeSession.session_id,
            activeSessionUrl: `https://app.creem.io/checkout/${activeSession.session_id}`,
            attemptsRemaining: data.attempts_remaining || 0
          }
        }
      }

      return {
        canCreate: false,
        reason: data.reason,
        attemptsRemaining: data.attempts_remaining || 0
      }
    } catch (error) {
      console.error('Error in canCreateSession:', error)
      return {
        canCreate: false,
        reason: 'System error checking checkout eligibility'
      }
    }
  }

  /**
   * Record a new checkout session
   */
  async recordSession(
    userId: string,
    sessionId: string,
    planId: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      
      const { data, error } = await supabaseAdmin
        .rpc('record_checkout_session', {
          p_user_id: userId,
          p_session_id: sessionId,
          p_plan_id: planId,
          p_expires_minutes: this.config.sessionExpirationMinutes,
          p_metadata: metadata || {}
        })

      if (error) {
        console.error('Error recording checkout session:', error)
        return {
          success: false,
          error: 'Failed to record checkout session'
        }
      }

      return {
        success: true,
        sessionId: data
      }
    } catch (error) {
      console.error('Error in recordSession:', error)
      return {
        success: false,
        error: 'System error recording checkout session'
      }
    }
  }

  /**
   * Complete a checkout session
   */
  async completeSession(
    sessionId: string,
    subscriptionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      
      const { data, error } = await supabaseAdmin
        .rpc('complete_checkout_session', {
          p_session_id: sessionId,
          p_subscription_id: subscriptionId
        })

      if (error) {
        console.error('Error completing checkout session:', error)
        return {
          success: false,
          error: 'Failed to complete checkout session'
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in completeSession:', error)
      return {
        success: false,
        error: 'System error completing checkout session'
      }
    }
  }

  /**
   * Cancel a checkout session
   */
  async cancelSession(
    sessionId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      
      const { error } = await supabaseAdmin
        .from('checkout_sessions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .eq('status', 'pending')

      if (error) {
        console.error('Error cancelling checkout session:', error)
        return {
          success: false,
          error: 'Failed to cancel checkout session'
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in cancelSession:', error)
      return {
        success: false,
        error: 'System error cancelling checkout session'
      }
    }
  }

  /**
   * Expire old checkout sessions
   */
  async expireOldSessions(): Promise<{ success: boolean; expiredCount?: number; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      
      const { data, error } = await supabaseAdmin
        .rpc('expire_old_checkout_sessions')

      if (error) {
        console.error('Error expiring old sessions:', error)
        return {
          success: false,
          error: 'Failed to expire old sessions'
        }
      }

      console.log(`Expired ${data} checkout sessions`)
      return {
        success: true,
        expiredCount: data
      }
    } catch (error) {
      console.error('Error in expireOldSessions:', error)
      return {
        success: false,
        error: 'System error expiring old sessions'
      }
    }
  }

  /**
   * Clean up old rate limit records
   */
  async cleanupRateLimits(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      
      const { data, error } = await supabaseAdmin
        .rpc('cleanup_old_rate_limits')

      if (error) {
        console.error('Error cleaning up rate limits:', error)
        return {
          success: false,
          error: 'Failed to cleanup rate limits'
        }
      }

      console.log(`Cleaned up ${data} rate limit records`)
      return {
        success: true,
        deletedCount: data
      }
    } catch (error) {
      console.error('Error in cleanupRateLimits:', error)
      return {
        success: false,
        error: 'System error cleaning up rate limits'
      }
    }
  }

  /**
   * Get active session for user
   */
  async getActiveSession(userId: string): Promise<{
    hasActiveSession: boolean
    session?: {
      id: string
      sessionId: string
      planId: string
      expiresAt: Date
      url: string
    }
  }> {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      
      const { data, error } = await supabaseAdmin
        .from('checkout_sessions')
        .select('id, session_id, plan_id, expires_at')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return { hasActiveSession: false }
      }

      return {
        hasActiveSession: true,
        session: {
          id: data.id,
          sessionId: data.session_id,
          planId: data.plan_id,
          expiresAt: new Date(data.expires_at),
          url: `https://app.creem.io/checkout/${data.session_id}`
        }
      }
    } catch (error) {
      console.error('Error getting active session:', error)
      return { hasActiveSession: false }
    }
  }

  /**
   * Get checkout session analytics
   */
  async getAnalytics(days: number = 30): Promise<{
    success: boolean
    data?: any[]
    error?: string
  }> {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabaseAdmin
        .from('checkout_session_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) {
        console.error('Error getting analytics:', error)
        return {
          success: false,
          error: 'Failed to get analytics'
        }
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error in getAnalytics:', error)
      return {
        success: false,
        error: 'System error getting analytics'
      }
    }
  }
}

// Export singleton instance
export const checkoutSessionManager = new CheckoutSessionManager()

// Export a function to run periodic cleanup
export async function runCheckoutSessionCleanup() {
  console.log('Running checkout session cleanup...')
  
  const expireResult = await checkoutSessionManager.expireOldSessions()
  const cleanupResult = await checkoutSessionManager.cleanupRateLimits()
  
  console.log('Cleanup results:', {
    expiredSessions: expireResult.expiredCount || 0,
    cleanedRateLimits: cleanupResult.deletedCount || 0
  })
  
  return {
    success: expireResult.success && cleanupResult.success,
    expiredSessions: expireResult.expiredCount || 0,
    cleanedRateLimits: cleanupResult.deletedCount || 0
  }
}