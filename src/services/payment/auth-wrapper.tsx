/**
 * Payment Auth Wrapper
 * 
 * This wrapper provides isolated authentication handling for payment operations
 * to prevent conflicts with the main OAuth flow. It follows the lessons learned
 * from the 3-day OAuth debugging journey.
 * 
 * Key principles:
 * 1. No direct manipulation of Supabase auth state
 * 2. Read-only access to current session
 * 3. No session refresh during payment flows
 * 4. Clear separation of concerns
 */

import authService from '@/services/authService'
import { supabase } from '@/lib/supabase-simple'
import React from 'react'

// Module load check
console.error('[PaymentAuthWrapper] !!!! MODULE LOADED !!!!', new Date().toISOString())

export interface PaymentAuthContext {
  userId: string
  email: string
  accessToken: string
  isValid: boolean
  expiresAt?: number
}

export class PaymentAuthWrapper {
  /**
   * Get current auth context for payment operations
   * This is a READ-ONLY operation that doesn't modify auth state
   */
  static async getAuthContext(): Promise<PaymentAuthContext | null> {
    try {
      // First try the authService which maintains the single source of truth
      const session = authService.getCurrentSession()
      
      if (!session || !session.access_token) {
        console.log('[PaymentAuth] No session from authService')
        return null
      }

      // Check if we have valid user data
      if (!session.user || !session.user.id) {
        console.log('[PaymentAuth] Session missing user data')
        return null
      }

      // Check if session is expiring within 2 minutes (critical for payment flows)
      const criticalExpiryMinutes = 2
      if (authService.isSessionExpiringSoon(criticalExpiryMinutes)) {
        console.warn('[PaymentAuth] Session expiring within 2 minutes - too risky for payment flow')
        return null
      }

      return {
        userId: session.user.id,
        email: session.user.email || '',
        accessToken: session.access_token,
        isValid: true,
        expiresAt: session.expires_at
      }
    } catch (error) {
      console.error('[PaymentAuth] Error getting auth context:', error)
      return null
    }
  }

  /**
   * Validate if current session is suitable for payment operations
   * Requires at least 5 minutes of validity remaining
   */
  static isSessionValidForPayment(): boolean {
    try {
      const session = authService.getCurrentSession()
      
      console.log('[PaymentAuth] isSessionValidForPayment check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasAccessToken: !!session?.access_token,
        sessionData: session ? {
          userId: session.user?.id,
          email: session.user?.email,
          expiresAt: session.expires_at,
          expiresIn: session.expires_in
        } : null,
        timestamp: new Date().toISOString()
      })
      
      if (!session || !session.user || !session.access_token) {
        console.log('[PaymentAuth] Session invalid - missing required fields')
        return false
      }

      // Require at least 5 minutes remaining for payment operations
      const minMinutesRequired = 5
      const isExpiringSoon = authService.isSessionExpiringSoon(minMinutesRequired)
      
      console.log('[PaymentAuth] Session expiry check:', {
        minMinutesRequired,
        isExpiringSoon,
        result: !isExpiringSoon
      })
      
      return !isExpiringSoon
    } catch (error) {
      console.error('[PaymentAuth] Error validating session for payment:', error)
      return false
    }
  }

  /**
   * Get auth headers for payment API calls
   * Returns null if session is not valid for payments
   */
  static async getPaymentAuthHeaders(): Promise<Record<string, string> | null> {
    const context = await this.getAuthContext()
    
    if (!context || !context.isValid) {
      return null
    }

    return {
      'Authorization': `Bearer ${context.accessToken}`,
      'X-User-ID': context.userId,
      'X-User-Email': context.email
    }
  }

  /**
   * Check if user needs to re-authenticate before payment
   */
  static needsReauthForPayment(): boolean {
    return !this.isSessionValidForPayment()
  }

  /**
   * Get the minimum session validity time required for payments (in minutes)
   */
  static getMinSessionValidityMinutes(): number {
    return 5
  }

  /**
   * Wait for auth to be ready (for client-side usage)
   * This doesn't modify auth state, just waits for it to be available
   */
  static async waitForAuth(maxWaitMs = 5000): Promise<boolean> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitMs) {
      if (authService.isAuthenticated()) {
        return true
      }
      
      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return false
  }

  /**
   * Server-side session validation for payment webhooks ONLY
   * WARNING: This method creates an admin client and should ONLY be used in webhook handlers
   * DO NOT use this in regular payment flows - use getAuthContext instead
   * 
   * @param accessToken - The token to validate
   * @returns Validation result with user details if valid
   */
  static async validateWebhookSession(accessToken: string): Promise<{
    valid: boolean
    userId?: string
    email?: string
  }> {
    // This method should only be called in webhook context
    if (typeof window !== 'undefined') {
      throw new Error('validateWebhookSession must only be called server-side in webhook handlers')
    }
    
    try {
      // For webhook validation, we need to use the admin client
      // This is acceptable ONLY in webhook context where we need service role access
      const { createClient } = require('@supabase/supabase-js')
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      )

      const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken)
      
      if (error || !user) {
        return { valid: false }
      }

      return {
        valid: true,
        userId: user.id,
        email: user.email || ''
      }
    } catch (error) {
      console.error('[PaymentAuth] Error validating webhook session:', error)
      return { valid: false }
    }
  }
}

// Helper functions for payment components

/**
 * HOC to ensure auth before payment operations
 */
export function withPaymentAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WithPaymentAuthComponent = (props: P) => {
    const [authReady, setAuthReady] = React.useState(false)
    const [needsAuth, setNeedsAuth] = React.useState(false)

    React.useEffect(() => {
      const checkAuth = async () => {
        // Wait for auth to be ready
        const ready = await PaymentAuthWrapper.waitForAuth()
        
        if (!ready || PaymentAuthWrapper.needsReauthForPayment()) {
          setNeedsAuth(true)
        } else {
          setAuthReady(true)
        }
      }

      checkAuth()
    }, [])

    if (needsAuth) {
      // Return a component that redirects to auth
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to continue with payment</p>
          </div>
        </div>
      )
    }

    if (!authReady) {
      // Return loading state
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )
    }

    // Auth is ready and valid for payment
    return <Component {...props} />
  }

  WithPaymentAuthComponent.displayName = `WithPaymentAuth(${Component.displayName || Component.name || 'Component'})`
  
  return WithPaymentAuthComponent
}

// Type guard for auth context
export function isValidPaymentAuthContext(
  context: PaymentAuthContext | null
): context is PaymentAuthContext {
  return context !== null && context.isValid && !!context.accessToken
}