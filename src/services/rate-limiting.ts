/**
 * Rate Limiting Service
 * 
 * Handles generation limits based on subscription tier and trial status
 * 
 * Rate Limits:
 * - Free: 3/day hard limit
 * - Pro Trial: 4/day (28 total for 7 days)
 * - Pro+ Trial: 6/day (42 total for 7 days) 
 * - Pro Paid: No daily limit (120/month)
 * - Pro+ Paid: No daily limit (300/month)
 */

export interface RateLimitConfig {
  tier: 'free' | 'pro' | 'pro_plus'
  isTrialing: boolean
  trialEndsAt?: Date
}

export interface RateLimitResult {
  allowed: boolean
  reason?: string
  limits: {
    daily?: number
    monthly: number
    used: {
      daily: number
      monthly: number
    }
    remaining: {
      daily?: number
      monthly: number
    }
  }
  resetTimes: {
    daily?: Date
    monthly: Date
  }
}

export class RateLimitingService {
  // Rate limit configurations
  private static readonly LIMITS = {
    free: {
      daily: 3,
      monthly: 10
    },
    pro_trial: {
      daily: 4,
      total: 28 // 7 days × 4
    },
    pro_plus_trial: {
      daily: 6,
      total: 42 // 7 days × 6
    },
    pro: {
      daily: null, // No daily limit
      monthly: 120
    },
    pro_plus: {
      daily: null, // No daily limit
      monthly: 300
    }
  }

  /**
   * Check if a generation is allowed based on rate limits
   */
  static async checkRateLimit(
    userId: string,
    config: RateLimitConfig,
    currentUsage: {
      daily: number
      monthly: number
      trialTotal?: number
    }
  ): Promise<RateLimitResult> {
    const { tier, isTrialing, trialEndsAt } = config
    
    // Determine which limits to apply
    let dailyLimit: number | null
    let monthlyLimit: number
    let trialTotalLimit: number | null = null
    
    if (tier === 'free') {
      // Free tier always has daily limit
      dailyLimit = this.LIMITS.free.daily
      monthlyLimit = this.LIMITS.free.monthly
    } else if (isTrialing && trialEndsAt && trialEndsAt > new Date()) {
      // Trial period limits
      if (tier === 'pro') {
        dailyLimit = this.LIMITS.pro_trial.daily
        trialTotalLimit = this.LIMITS.pro_trial.total
        monthlyLimit = this.LIMITS.pro.monthly // For display purposes
      } else {
        dailyLimit = this.LIMITS.pro_plus_trial.daily
        trialTotalLimit = this.LIMITS.pro_plus_trial.total
        monthlyLimit = this.LIMITS.pro_plus.monthly // For display purposes
      }
    } else {
      // Paid subscriptions - no daily limit
      dailyLimit = null
      monthlyLimit = tier === 'pro' ? this.LIMITS.pro.monthly : this.LIMITS.pro_plus.monthly
    }
    
    // Check limits
    let allowed = true
    let reason: string | undefined
    
    // Check trial total limit if applicable
    if (isTrialing && trialTotalLimit !== null && currentUsage.trialTotal !== undefined) {
      if (currentUsage.trialTotal >= trialTotalLimit) {
        allowed = false
        reason = `Trial limit reached (${trialTotalLimit} total)`
      }
    }
    
    // Check daily limit if applicable
    if (allowed && dailyLimit !== null && currentUsage.daily >= dailyLimit) {
      allowed = false
      reason = `Daily limit reached (${dailyLimit}/day)`
    }
    
    // Check monthly limit (for paid subscriptions)
    if (allowed && !isTrialing && currentUsage.monthly >= monthlyLimit) {
      allowed = false
      reason = `Monthly quota exhausted (${monthlyLimit}/month)`
    }
    
    // Calculate reset times
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextMonth = new Date(now)
    nextMonth.setDate(1)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setHours(0, 0, 0, 0)
    
    return {
      allowed,
      reason,
      limits: {
        daily: dailyLimit ?? undefined,
        monthly: monthlyLimit,
        used: {
          daily: currentUsage.daily,
          monthly: currentUsage.monthly
        },
        remaining: {
          daily: dailyLimit ? Math.max(0, dailyLimit - currentUsage.daily) : undefined,
          monthly: Math.max(0, monthlyLimit - currentUsage.monthly)
        }
      },
      resetTimes: {
        daily: dailyLimit ? tomorrow : undefined,
        monthly: nextMonth
      }
    }
  }
  
  /**
   * Get rate limit headers for HTTP responses
   */
  static getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {}
    
    // Use daily limit if present, otherwise monthly
    if (result.limits.daily !== undefined) {
      headers['X-RateLimit-Limit'] = result.limits.daily.toString()
      headers['X-RateLimit-Remaining'] = (result.limits.remaining.daily ?? 0).toString()
      headers['X-RateLimit-Reset'] = result.resetTimes.daily!.toISOString()
    } else {
      headers['X-RateLimit-Limit'] = result.limits.monthly.toString()
      headers['X-RateLimit-Remaining'] = result.limits.remaining.monthly.toString()
      headers['X-RateLimit-Reset'] = result.resetTimes.monthly.toISOString()
    }
    
    // Add monthly quota info as custom headers
    headers['X-RateLimit-Monthly-Limit'] = result.limits.monthly.toString()
    headers['X-RateLimit-Monthly-Remaining'] = result.limits.remaining.monthly.toString()
    
    return headers
  }
  
  /**
   * Calculate remaining trial days
   */
  static getTrialDaysRemaining(trialEndsAt: Date): number {
    const now = new Date()
    const msRemaining = trialEndsAt.getTime() - now.getTime()
    return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))
  }
  
  /**
   * Check if user can cancel trial
   */
  static canCancelTrial(isTrialing: boolean, trialEndsAt?: Date): boolean {
    if (!isTrialing || !trialEndsAt) return false
    return trialEndsAt > new Date()
  }
}