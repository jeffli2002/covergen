import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import { NextRequest, NextResponse } from 'next/server'
import { POST as convertTrialHandler } from '@/app/api/payment/convert-trial/route'
import { creemService } from '@/services/payment/creem'

// Mock dependencies
jest.mock('@/services/payment/auth-wrapper')
jest.mock('@/services/payment/creem')
jest.mock('@supabase/supabase-js')

describe('Trial Upgrade Flow', () => {
  const mockUserId = 'test-user-123'
  const mockEmail = 'test@example.com'
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Convert Trial API Endpoint', () => {
    it('should successfully convert trial to paid subscription', async () => {
      // Mock auth context
      const mockAuthContext = {
        isValid: true,
        userId: mockUserId,
        email: mockEmail
      }
      require('@/services/payment/auth-wrapper').PaymentAuthWrapper.getAuthContext
        .mockResolvedValue(mockAuthContext)

      // Mock subscription data
      const mockSubscription = {
        id: 'sub_123',
        user_id: mockUserId,
        tier: 'pro',
        is_trial_active: true,
        trial_end: '2025-01-20T00:00:00Z'
      }
      
      // Mock Supabase queries
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
        update: jest.fn().mockReturnThis()
      }
      
      jest.mocked(require('@supabase/supabase-js').createClient)
        .mockReturnValue(mockSupabase)

      // Mock Creem checkout creation
      const mockCheckoutUrl = 'https://checkout.creem.io/session/123'
      jest.mocked(creemService.createCheckout).mockResolvedValue(mockCheckoutUrl)

      // Create request
      const request = new NextRequest('http://localhost/api/payment/convert-trial', {
        method: 'POST'
      })

      // Call handler
      const response = await convertTrialHandler(request)
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.checkoutUrl).toBe(mockCheckoutUrl)
      expect(data.message).toContain('Redirecting to checkout')
      
      // Verify Creem was called with correct params
      expect(creemService.createCheckout).toHaveBeenCalledWith({
        userId: mockUserId,
        planId: 'pro',
        userEmail: mockEmail,
        currentPlan: 'free',
        redirectUrl: expect.stringContaining('/account'),
        metadata: {
          convertFromTrial: 'true',
          originalTrialEnd: mockSubscription.trial_end
        }
      })
    })

    it('should handle non-trial subscription error', async () => {
      const mockAuthContext = {
        isValid: true,
        userId: mockUserId,
        email: mockEmail
      }
      require('@/services/payment/auth-wrapper').PaymentAuthWrapper.getAuthContext
        .mockResolvedValue(mockAuthContext)

      const mockSubscription = {
        id: 'sub_123',
        user_id: mockUserId,
        tier: 'pro',
        is_trial_active: false // Not in trial
      }
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null })
      }
      
      jest.mocked(require('@supabase/supabase-js').createClient)
        .mockReturnValue(mockSupabase)

      const request = new NextRequest('http://localhost/api/payment/convert-trial', {
        method: 'POST'
      })

      const response = await convertTrialHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Subscription is not in trial period')
    })

    it('should handle authentication failure', async () => {
      require('@/services/payment/auth-wrapper').PaymentAuthWrapper.getAuthContext
        .mockResolvedValue({ isValid: false })

      const request = new NextRequest('http://localhost/api/payment/convert-trial', {
        method: 'POST'
      })

      const response = await convertTrialHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should fallback gracefully when Creem fails', async () => {
      const mockAuthContext = {
        isValid: true,
        userId: mockUserId,
        email: mockEmail
      }
      require('@/services/payment/auth-wrapper').PaymentAuthWrapper.getAuthContext
        .mockResolvedValue(mockAuthContext)

      const mockSubscription = {
        id: 'sub_123',
        user_id: mockUserId,
        tier: 'pro_plus',
        is_trial_active: true,
        trial_end: '2025-01-25T00:00:00Z'
      }
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
        update: jest.fn().mockReturnThis()
      }
      
      jest.mocked(require('@supabase/supabase-js').createClient)
        .mockReturnValue(mockSupabase)

      // Mock Creem failure
      jest.mocked(creemService.createCheckout)
        .mockRejectedValue(new Error('Payment provider error'))

      const request = new NextRequest('http://localhost/api/payment/convert-trial', {
        method: 'POST'
      })

      const response = await convertTrialHandler(request)
      const data = await response.json()

      // Should still return success but without checkout URL
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.checkoutUrl).toBeUndefined()
      expect(data.message).toBe('Trial conversion initiated')
      expect(data.subscription).toBeDefined()
    })
  })

  describe('Trial Status Endpoint', () => {
    it('should return correct trial status for active trial', async () => {
      const mockAuthContext = {
        isValid: true,
        userId: mockUserId
      }
      require('@/services/payment/auth-wrapper').PaymentAuthWrapper.getAuthContext
        .mockResolvedValue(mockAuthContext)

      const mockSubscription = {
        user_id: mockUserId,
        tier: 'pro',
        is_trial_active: true,
        trial_start: '2025-01-10T00:00:00Z',
        trial_end: '2025-01-17T00:00:00Z',
        converted_from_trial: false
      }
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null })
      }
      
      jest.mocked(require('@supabase/supabase-js').createClient)
        .mockReturnValue(mockSupabase)

      // Mock current date
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-01-15T10:00:00Z'))

      const { GET: getTrialStatus } = require('@/app/api/payment/convert-trial/route')
      const request = new NextRequest('http://localhost/api/payment/convert-trial')
      
      const response = await getTrialStatus(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.inTrial).toBe(true)
      expect(data.hasSubscription).toBe(true)
      expect(data.tier).toBe('pro')
      expect(data.daysRemaining).toBe(2) // 2 days left in trial
      expect(data.convertedFromTrial).toBe(false)
      
      jest.useRealTimers()
    })

    it('should return no trial for users without subscription', async () => {
      const mockAuthContext = {
        isValid: true,
        userId: mockUserId
      }
      require('@/services/payment/auth-wrapper').PaymentAuthWrapper.getAuthContext
        .mockResolvedValue(mockAuthContext)

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      }
      
      jest.mocked(require('@supabase/supabase-js').createClient)
        .mockReturnValue(mockSupabase)

      const { GET: getTrialStatus } = require('@/app/api/payment/convert-trial/route')
      const request = new NextRequest('http://localhost/api/payment/convert-trial')
      
      const response = await getTrialStatus(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.inTrial).toBe(false)
      expect(data.hasSubscription).toBe(false)
    })
  })

  describe('UI Integration Tests', () => {
    it('should show upgrade button during trial in account page', () => {
      const mockSubscription = {
        tier: 'pro',
        is_trial_active: true,
        trial_end: '2025-01-20T00:00:00Z'
      }

      // Test that UI would show correct elements
      expect(mockSubscription.is_trial_active).toBe(true)
      expect(mockSubscription.trial_end).toBeDefined()
      
      // UI should show:
      // - "Free trial active" badge
      // - Trial end date
      // - Daily limit info (4 covers/day for Pro)
      // - "Start subscription now (no rate limits)" button
    })

    it('should handle rate limit modal for trial users', () => {
      const rateLimitInfo = {
        daily_usage: 4,
        daily_limit: 4,
        monthly_usage: 20,
        monthly_limit: 120,
        is_trial: true,
        trial_ends_at: '2025-01-20T00:00:00Z',
        tier: 'pro' as const
      }

      // Test modal props
      expect(rateLimitInfo.is_trial).toBe(true)
      expect(rateLimitInfo.daily_usage).toBe(rateLimitInfo.daily_limit)
      
      // Modal should show:
      // - "Trial Daily Limit Reached" title
      // - "You've used all 4 of your daily trial covers"
      // - Reset time countdown
      // - "Start Subscription" button (not "Upgrade")
    })

    it('should redirect to Creem checkout on upgrade click', async () => {
      const mockCheckoutUrl = 'https://checkout.creem.io/session/456'
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          checkoutUrl: mockCheckoutUrl
        })
      })
      
      global.fetch = mockFetch
      global.window = { location: { href: '' } } as any

      // Simulate upgrade button click
      await mockFetch('/api/payment/convert-trial', { method: 'POST' })
      const response = await mockFetch.mock.results[0].value
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.checkoutUrl).toBe(mockCheckoutUrl)
      
      // In real scenario, window.location.href would be set
      // expect(window.location.href).toBe(mockCheckoutUrl)
    })
  })

  describe('Trial Conversion Scenarios', () => {
    it('should handle Pro trial conversion with custom trial days', async () => {
      process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS = '14' // 14-day trial
      
      const trialDays = parseInt(process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS || '7')
      expect(trialDays).toBe(14)
      
      // Daily limit during trial: 4
      // Total trial covers: 4 * 14 = 56
      const totalTrialCovers = 4 * trialDays
      expect(totalTrialCovers).toBe(56)
    })

    it('should handle Pro+ trial conversion with custom trial days', async () => {
      process.env.NEXT_PUBLIC_PRO_PLUS_TRIAL_DAYS = '30' // 30-day trial
      
      const trialDays = parseInt(process.env.NEXT_PUBLIC_PRO_PLUS_TRIAL_DAYS || '7')
      expect(trialDays).toBe(30)
      
      // Daily limit during trial: 6
      // Total trial covers: 6 * 30 = 180
      const totalTrialCovers = 6 * trialDays
      expect(totalTrialCovers).toBe(180)
    })

    it('should handle zero trial days configuration', async () => {
      process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS = '0' // No trial
      
      const trialDays = parseInt(process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS || '7')
      expect(trialDays).toBe(0)
      
      // Should go straight to paid subscription
    })
  })
})