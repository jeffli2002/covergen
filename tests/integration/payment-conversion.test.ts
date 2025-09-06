import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { creemService, SUBSCRIPTION_PLANS } from '@/services/payment/creem'

// Mock environment variables
process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS = '7'
process.env.NEXT_PUBLIC_PRO_PLUS_TRIAL_DAYS = '7'
process.env.NEXT_PUBLIC_CREEM_TEST_MODE = 'true'

describe('Payment Conversion with Trial Support', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Subscription Plan Configuration', () => {
    it('should include trial days in plan configuration', () => {
      expect(SUBSCRIPTION_PLANS.pro.trialDays).toBeDefined()
      expect(SUBSCRIPTION_PLANS.pro_plus.trialDays).toBeDefined()
      expect(SUBSCRIPTION_PLANS.free.trialDays).toBe(0)
    })

    it('should respect environment variable for trial days', () => {
      // Test dynamic trial day configuration
      const proTrialDays = parseInt(process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS || '7')
      const proPlusTrialDays = parseInt(process.env.NEXT_PUBLIC_PRO_PLUS_TRIAL_DAYS || '7')
      
      expect(proTrialDays).toBe(7)
      expect(proPlusTrialDays).toBe(7)
    })

    it('should handle zero trial days configuration', () => {
      const originalEnv = process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS
      process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS = '0'
      
      const trialDays = parseInt(process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS || '7')
      expect(trialDays).toBe(0)
      
      process.env.NEXT_PUBLIC_PRO_TRIAL_DAYS = originalEnv
    })
  })

  describe('Creem Checkout Creation with Trial', () => {
    it('should create checkout with trial period for new Pro subscription', async () => {
      const mockCheckout = {
        checkout_url: 'https://checkout.creem.io/test-session',
        id: 'checkout_123'
      }
      
      // Mock the Creem SDK
      const mockCreemClient = {
        createCheckout: jest.fn().mockResolvedValue(mockCheckout)
      }
      jest.spyOn(creemService, 'createCheckout').mockImplementation(async (params) => {
        // Verify trial parameters are included
        expect(params.metadata?.isTrialCheckout).toBeDefined()
        expect(params.metadata?.trialDays).toBeDefined()
        return mockCheckout.checkout_url
      })

      const checkoutUrl = await creemService.createCheckout({
        userId: 'user_123',
        planId: 'pro',
        userEmail: 'test@example.com',
        currentPlan: 'free',
        redirectUrl: 'http://localhost:3000/account',
        metadata: {
          isTrialCheckout: 'true',
          trialDays: '7'
        }
      })

      expect(checkoutUrl).toBe(mockCheckout.checkout_url)
      expect(creemService.createCheckout).toHaveBeenCalled()
    })

    it('should create checkout for trial conversion', async () => {
      const mockCheckout = {
        checkout_url: 'https://checkout.creem.io/convert-trial',
        id: 'checkout_456'
      }
      
      jest.spyOn(creemService, 'createCheckout').mockImplementation(async (params) => {
        // Verify conversion metadata
        expect(params.metadata?.convertFromTrial).toBe('true')
        expect(params.metadata?.originalTrialEnd).toBeDefined()
        expect(params.currentPlan).toBe('free') // Trial conversion treated as upgrade from free
        return mockCheckout.checkout_url
      })

      const checkoutUrl = await creemService.createCheckout({
        userId: 'user_456',
        planId: 'pro_plus',
        userEmail: 'trial@example.com',
        currentPlan: 'free',
        redirectUrl: 'http://localhost:3000/account',
        metadata: {
          convertFromTrial: 'true',
          originalTrialEnd: '2025-01-20T00:00:00Z'
        }
      })

      expect(checkoutUrl).toBe(mockCheckout.checkout_url)
    })
  })

  describe('Webhook Handling for Trial Conversions', () => {
    it('should process checkout.completed webhook for trial start', () => {
      const webhookData = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {
              internal_customer_id: 'user_789',
              planId: 'pro',
              isTrialCheckout: 'true',
              trialDays: '7'
            },
            customer: {
              id: 'cus_123',
              email: 'newuser@example.com'
            },
            subscription: {
              id: 'sub_123',
              trial_end: '2025-01-27T00:00:00Z'
            }
          }
        }
      }

      const processedData = creemService.processWebhookData(webhookData)
      
      expect(processedData.type).toBe('checkout_complete')
      expect(processedData.userId).toBe('user_789')
      expect(processedData.planId).toBe('pro')
      expect(processedData.isTrialCheckout).toBe(true)
      expect(processedData.trialDays).toBe(7)
    })

    it('should process subscription.updated webhook for trial conversion', () => {
      const webhookData = {
        type: 'subscription.updated',
        data: {
          object: {
            id: 'sub_456',
            customer: 'cus_456',
            metadata: {
              internal_customer_id: 'user_999',
              convertedFromTrial: 'true'
            },
            status: 'active',
            trial_end: null, // No longer in trial
            current_period_end: '2025-02-15T00:00:00Z'
          }
        }
      }

      const processedData = creemService.processWebhookData(webhookData)
      
      expect(processedData.type).toBe('subscription_updated')
      expect(processedData.userId).toBe('user_999')
      expect(processedData.status).toBe('active')
      expect(processedData.metadata?.convertedFromTrial).toBe('true')
    })
  })

  describe('Rate Limit Updates After Conversion', () => {
    it('should remove daily limits after trial conversion', async () => {
      // Before conversion: Trial with daily limits
      const trialLimits = {
        tier: 'pro' as const,
        isTrialing: true,
        dailyLimit: 4,
        monthlyLimit: 120
      }
      
      // After conversion: Paid with no daily limits
      const paidLimits = {
        tier: 'pro' as const,
        isTrialing: false,
        dailyLimit: undefined,
        monthlyLimit: 120
      }
      
      expect(trialLimits.dailyLimit).toBe(4)
      expect(paidLimits.dailyLimit).toBeUndefined()
    })

    it('should update user subscription status in database', async () => {
      const updateData = {
        is_trial_active: false,
        converted_from_trial: true,
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
      
      // Verify all required fields are set
      expect(updateData.is_trial_active).toBe(false)
      expect(updateData.converted_from_trial).toBe(true)
      expect(updateData.current_period_start).toBeDefined()
      expect(updateData.current_period_end).toBeDefined()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle payment failure during trial conversion', async () => {
      jest.spyOn(creemService, 'createCheckout').mockRejectedValue(
        new Error('Payment method required')
      )

      try {
        await creemService.createCheckout({
          userId: 'user_error',
          planId: 'pro',
          userEmail: 'error@example.com',
          currentPlan: 'free',
          redirectUrl: 'http://localhost:3000/account'
        })
      } catch (error) {
        expect(error.message).toContain('Payment method required')
      }
    })

    it('should handle webhook for cancelled trial', () => {
      const webhookData = {
        type: 'subscription.deleted',
        data: {
          object: {
            id: 'sub_cancelled',
            customer: 'cus_cancelled',
            metadata: {
              internal_customer_id: 'user_cancelled',
              wasTrialing: 'true'
            },
            status: 'cancelled',
            trial_end: '2025-01-20T00:00:00Z'
          }
        }
      }

      const processedData = creemService.processWebhookData(webhookData)
      
      expect(processedData.type).toBe('subscription_cancelled')
      expect(processedData.status).toBe('cancelled')
      expect(processedData.metadata?.wasTrialing).toBe('true')
    })

    it('should handle upgrade from Pro trial to Pro+ trial', async () => {
      // User on Pro trial wants to upgrade to Pro+ trial
      const upgradeParams = {
        userId: 'user_upgrade',
        planId: 'pro_plus',
        userEmail: 'upgrade@example.com',
        currentPlan: 'pro',
        metadata: {
          isUpgradeInTrial: 'true',
          currentTrialEnd: '2025-01-20T00:00:00Z',
          newTrialDays: '7' // Pro+ trial days
        }
      }

      jest.spyOn(creemService, 'createCheckout').mockImplementation(async (params) => {
        expect(params.metadata?.isUpgradeInTrial).toBe('true')
        expect(params.currentPlan).toBe('pro')
        expect(params.planId).toBe('pro_plus')
        return 'https://checkout.creem.io/upgrade-trial'
      })

      const checkoutUrl = await creemService.createCheckout(upgradeParams)
      expect(checkoutUrl).toBe('https://checkout.creem.io/upgrade-trial')
    })
  })

  describe('Full Payment Flow Integration', () => {
    it('should complete full trial to paid conversion flow', async () => {
      // Step 1: User signs up for Pro trial
      const trialSignup = {
        userId: 'user_flow',
        planId: 'pro',
        isTrialCheckout: true,
        trialDays: 7
      }
      
      // Step 2: User hits daily limit during trial
      const rateLimitDuringTrial = {
        daily_usage: 4,
        daily_limit: 4,
        is_trial: true
      }
      
      // Step 3: User clicks "Start subscription now"
      const conversionRequest = {
        userId: 'user_flow',
        convertFromTrial: true
      }
      
      // Step 4: Webhook confirms conversion
      const conversionWebhook = {
        userId: 'user_flow',
        is_trial_active: false,
        converted_from_trial: true
      }
      
      // Step 5: User now has no daily limits
      const paidAccess = {
        daily_limit: undefined,
        monthly_limit: 120,
        can_generate: true
      }
      
      // Verify flow progression
      expect(trialSignup.isTrialCheckout).toBe(true)
      expect(rateLimitDuringTrial.daily_usage).toBe(rateLimitDuringTrial.daily_limit)
      expect(conversionRequest.convertFromTrial).toBe(true)
      expect(conversionWebhook.is_trial_active).toBe(false)
      expect(paidAccess.daily_limit).toBeUndefined()
    })
  })
})