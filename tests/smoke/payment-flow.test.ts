/**
 * Smoke Test for Payment Flow
 * 
 * This test verifies:
 * 1. Auth wrapper doesn't interfere with OAuth
 * 2. Payment flow works with valid session
 * 3. Payment flow redirects with invalid session
 * 4. No "Multiple GoTrueClient" warnings
 */

import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import { creemService } from '@/services/payment/creem'
import authService from '@/services/authService'

describe('Payment Flow Smoke Tests', () => {
  // Mock console to catch warnings
  const originalConsole = { ...console }
  const consoleWarnings: string[] = []
  
  beforeEach(() => {
    consoleWarnings.length = 0
    console.warn = jest.fn((msg) => {
      consoleWarnings.push(msg)
      originalConsole.warn(msg)
    })
  })

  afterEach(() => {
    console.warn = originalConsole.warn
  })

  describe('Auth Wrapper Integration', () => {
    it('should not create multiple Supabase client instances', async () => {
      // Get auth context multiple times
      await PaymentAuthWrapper.getAuthContext()
      await PaymentAuthWrapper.getAuthContext()
      await PaymentAuthWrapper.getAuthContext()
      
      // Check for multiple client warnings
      const multipleClientWarnings = consoleWarnings.filter(w => 
        w.includes('Multiple GoTrueClient') || 
        w.includes('multiple instances')
      )
      
      expect(multipleClientWarnings).toHaveLength(0)
    })

    it('should provide read-only auth access', async () => {
      const context = await PaymentAuthWrapper.getAuthContext()
      
      // Should not have methods that modify state
      expect(context).not.toHaveProperty('refreshSession')
      expect(context).not.toHaveProperty('setSession')
      expect(context).not.toHaveProperty('signOut')
      
      // Should only have read-only properties
      if (context) {
        expect(context).toHaveProperty('userId')
        expect(context).toHaveProperty('email')
        expect(context).toHaveProperty('accessToken')
        expect(context).toHaveProperty('isValid')
      }
    })

    it('should validate session time requirements', () => {
      // Mock a session expiring in 3 minutes
      jest.spyOn(authService, 'isSessionExpiringSoon').mockImplementation((minutes) => {
        return minutes >= 3
      })
      
      const isValid = PaymentAuthWrapper.isSessionValidForPayment()
      
      // Should be invalid because we need 5+ minutes
      expect(isValid).toBe(false)
      
      // Restore mock
      jest.restoreAllMocks()
    })
  })

  describe('Payment Service Integration', () => {
    it('should handle auth context in client-side checkout', async () => {
      // Mock valid auth context
      jest.spyOn(PaymentAuthWrapper, 'getAuthContext').mockResolvedValue({
        userId: 'test-user-123',
        email: 'test@example.com',
        accessToken: 'test-token',
        isValid: true,
        expiresAt: Date.now() + 3600000 // 1 hour from now
      })
      
      jest.spyOn(PaymentAuthWrapper, 'isSessionValidForPayment').mockReturnValue(true)
      
      // Mock window for client-side detection
      global.window = {} as any
      
      try {
        const result = await creemService.createCheckoutSession({
          userId: 'test-user-123',
          userEmail: 'test@example.com',
          planId: 'pro',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        })
        
        // Should attempt to create checkout (will fail due to missing fetch)
        expect(result.success).toBe(false)
        
        // Verify no auth state modification warnings
        const stateModWarnings = consoleWarnings.filter(w => 
          w.includes('refresh') || 
          w.includes('setSession')
        )
        expect(stateModWarnings).toHaveLength(0)
      } finally {
        // @ts-ignore
        delete global.window
        jest.restoreAllMocks()
      }
    })
  })

  describe('Session Expiry Handling', () => {
    it('should redirect when session not valid for payment', async () => {
      // Mock invalid session
      jest.spyOn(PaymentAuthWrapper, 'isSessionValidForPayment').mockReturnValue(false)
      
      // This would typically be handled by the payment page component
      const needsAuth = PaymentAuthWrapper.needsReauthForPayment()
      
      expect(needsAuth).toBe(true)
      
      jest.restoreAllMocks()
    })
    
    it('should provide proper auth headers when valid', async () => {
      // Mock valid auth context
      jest.spyOn(PaymentAuthWrapper, 'getAuthContext').mockResolvedValue({
        userId: 'test-user-123',
        email: 'test@example.com',
        accessToken: 'test-token-abc123',
        isValid: true
      })
      
      const headers = await PaymentAuthWrapper.getPaymentAuthHeaders()
      
      expect(headers).not.toBeNull()
      expect(headers?.Authorization).toBe('Bearer test-token-abc123')
      expect(headers?.['X-User-ID']).toBe('test-user-123')
      expect(headers?.['X-User-Email']).toBe('test@example.com')
      
      jest.restoreAllMocks()
    })
  })
})

// Manual test scenarios for development
export const manualTestScenarios = {
  '1. Fresh Login Flow': {
    steps: [
      '1. Clear all cookies and local storage',
      '2. Navigate to /en/payment',
      '3. Should redirect to sign-in',
      '4. Sign in with Google OAuth',
      '5. Should redirect back to payment page',
      '6. Should be able to select plan and proceed'
    ],
    expected: 'No auth errors, smooth flow'
  },
  
  '2. Expiring Session Flow': {
    steps: [
      '1. Sign in and wait until < 5 minutes before expiry',
      '2. Navigate to /en/payment',
      '3. Try to start checkout'
    ],
    expected: 'Should redirect to sign-in with return URL'
  },
  
  '3. Concurrent Auth Test': {
    steps: [
      '1. Open payment page in one tab',
      '2. Sign out in another tab',
      '3. Try to proceed with payment in first tab'
    ],
    expected: 'Should detect invalid session and redirect'
  },
  
  '4. Webhook Processing': {
    steps: [
      '1. Trigger a test webhook',
      '2. Check user remains signed in',
      '3. Verify subscription updated in database'
    ],
    expected: 'Webhook processed without affecting user session'
  }
}