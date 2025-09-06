import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimitingService } from '@/services/rate-limiting'

describe('Rate Limiting Service', () => {
  const mockUserId = 'test-user-123'
  const mockDate = new Date('2025-01-15T10:00:00Z')
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  describe('Free Tier Rate Limits', () => {
    it('should allow generation within daily limit', async () => {
      const config = { tier: 'free' as const, isTrialing: false }
      const usage = { daily: 2, monthly: 5 }
      
      const result = await RateLimitingService.checkRateLimit(mockUserId, config, usage)
      
      expect(result.allowed).toBe(true)
      expect(result.limits.remaining.daily).toBe(1)
      expect(result.limits.remaining.monthly).toBe(5)
    })

    it('should block generation when daily limit reached', async () => {
      const config = { tier: 'free' as const, isTrialing: false }
      const usage = { daily: 3, monthly: 5 }
      
      const result = await RateLimitingService.checkRateLimit(mockUserId, config, usage)
      
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Daily limit reached')
      expect(result.limits.remaining.daily).toBe(0)
    })

    it('should calculate correct reset time for daily limit', async () => {
      const config = { tier: 'free' as const, isTrialing: false }
      const usage = { daily: 3, monthly: 5 }
      
      const result = await RateLimitingService.checkRateLimit(mockUserId, config, usage)
      
      expect(result.resetTimes.daily).toBeDefined()
      const resetTime = new Date(result.resetTimes.daily!)
      expect(resetTime.getUTCHours()).toBe(0)
      expect(resetTime.getUTCMinutes()).toBe(0)
      expect(resetTime.getUTCDate()).toBe(16) // Next day
    })
  })

  describe('Trial Period Rate Limits', () => {
    it('should apply Pro trial daily limits correctly', async () => {
      const trialStart = new Date('2025-01-10T00:00:00Z')
      const trialEnd = new Date('2025-01-17T00:00:00Z')
      
      const config = {
        tier: 'pro' as const,
        isTrialing: true,
        trialStartedAt: trialStart,
        trialEndsAt: trialEnd
      }
      const usage = { daily: 3, monthly: 20, trialTotal: 15 }
      
      const result = await RateLimitingService.checkRateLimit(mockUserId, config, usage)
      
      expect(result.allowed).toBe(true)
      expect(result.limits.daily).toBe(4)
      expect(result.limits.remaining.daily).toBe(1)
    })

    it('should block when trial total limit reached', async () => {
      const trialStart = new Date('2025-01-10T00:00:00Z')
      const trialEnd = new Date('2025-01-17T00:00:00Z') // 7-day trial
      
      const config = {
        tier: 'pro' as const,
        isTrialing: true,
        trialStartedAt: trialStart,
        trialEndsAt: trialEnd
      }
      const usage = { daily: 2, monthly: 30, trialTotal: 28 } // 7 days * 4 = 28 total
      
      const result = await RateLimitingService.checkRateLimit(mockUserId, config, usage)
      
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Trial limit reached (28 total)')
    })
  })

  describe('Paid Subscription Rate Limits', () => {
    it('should allow Pro subscription with no daily limit', async () => {
      const config = { tier: 'pro' as const, isTrialing: false }
      const usage = { daily: 50, monthly: 100 }
      
      const result = await RateLimitingService.checkRateLimit(mockUserId, config, usage)
      
      expect(result.allowed).toBe(true)
      expect(result.limits.daily).toBeUndefined()
      expect(result.limits.remaining.monthly).toBe(20)
    })
  })
})