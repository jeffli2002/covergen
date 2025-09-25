import { Creem } from 'creem'
import { getSubscriptionConfig, isTrialEnabled, calculateTrialEndDate } from '@/lib/subscription-config'

// Use lazy evaluation for all environment variables to handle edge runtime
const getCreemTestMode = () => {
  // Check multiple conditions for test mode
  const isTestMode = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
  const isVercelPreview = process.env.VERCEL_ENV === 'preview'
  const isDevEnvironment = process.env.NODE_ENV === 'development'
  
  // Log the decision for debugging
  if (typeof window === 'undefined') {
    console.log('[Creem] Test mode check:', {
      NEXT_PUBLIC_CREEM_TEST_MODE: process.env.NEXT_PUBLIC_CREEM_TEST_MODE,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      isTestMode,
      isVercelPreview,
      isDevEnvironment,
      result: isTestMode || isVercelPreview || isDevEnvironment
    })
  }
  
  return isTestMode || isVercelPreview || isDevEnvironment
}

// Use lazy evaluation for API keys to handle edge runtime
const getCreemApiKey = () => {
  // Try multiple possible environment variable names
  let key = process.env.CREEM_SECRET_KEY || 
            process.env.CREEM_API_KEY || 
            process.env.NEXT_PUBLIC_CREEM_SECRET_KEY || // Sometimes mistakenly made public
            process.env.CREEM_TEST_API_KEY || // Alternative test key name
            ''
  
  // Fix for Vercel environment variable misconfiguration
  // If the value contains "CREEM_SECRET_KEY=" at the start, extract the actual key
  if (key.startsWith('CREEM_SECRET_KEY=')) {
    console.warn('[Creem] Detected misconfigured environment variable, extracting actual key')
    key = key.substring('CREEM_SECRET_KEY='.length)
  }
  
  // Always log in server context for debugging
  if (typeof window === 'undefined') {
    console.log('[Creem] API key retrieval:', {
      found: !!key,
      length: key.length,
      prefix: key ? key.substring(0, 15) + '...' : 'NONE',
      isTestKey: key.startsWith('creem_test_'),
      checkedVars: {
        CREEM_SECRET_KEY: process.env.CREEM_SECRET_KEY ? 'SET' : 'NOT SET',
        CREEM_API_KEY: process.env.CREEM_API_KEY ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_CREEM_SECRET_KEY: process.env.NEXT_PUBLIC_CREEM_SECRET_KEY ? 'SET' : 'NOT SET',
        CREEM_TEST_API_KEY: process.env.CREEM_TEST_API_KEY ? 'SET' : 'NOT SET'
      }
    })
  }
  return key
}

const getCreemWebhookSecret = () => {
  return process.env.CREEM_WEBHOOK_SECRET || ''
}

// Lazy initialization of Creem client
let creemClient: Creem | null = null

const getCreemClient = () => {
  if (!creemClient) {
    const testMode = getCreemTestMode()
    console.log('[Creem] Initializing client:', {
      testMode,
      hasApiKey: !!getCreemApiKey(),
      apiKeyPrefix: getCreemApiKey().substring(0, 10) + '...',
      nodeEnv: process.env.NODE_ENV,
      runtime: typeof window === 'undefined' ? 'server' : 'client'
    })
    creemClient = new Creem({
      serverIdx: testMode ? 1 : 0, // 0: production, 1: test-mode
    })
  }
  return creemClient
}

// Test card numbers for Creem
export const CREEM_TEST_CARDS = {
  success: '4242424242424242', // Successful payment
  decline: '4000000000000002', // Card declined
  insufficient: '4000000000009995', // Insufficient funds
  expired: '4000000000000069', // Expired card
  processing_error: '4000000000000119', // Processing error
  threeDSecure: '4000000000003220', // 3D Secure required
}

// Product IDs for subscription tiers (from Creem dashboard)
// Same product IDs are used for both test and production modes
export const CREEM_PRODUCTS = {
  pro: process.env.CREEM_PRO_PLAN_ID || '',
  pro_plus: process.env.CREEM_PRO_PLUS_PLAN_ID || ''
}

// Subscription Plans
// Note: To avoid circular dependencies, we'll use a getter function for dynamic values
const getSubscriptionPlansWithConfig = () => {
  const config = getSubscriptionConfig()
  return {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      priceId: '', // No Creem price ID for free tier
      credits: config.limits.free.monthly,
      features: [
        `${config.limits.free.monthly} covers per month`,
        'No watermark',
        'Basic platform sizes',
        'Email support'
      ]
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 900, // $9.00 in cents
      priceId: CREEM_PRODUCTS.pro,
      credits: config.limits.pro.monthly,
      features: [
        `${config.limits.pro.monthly} covers per month`,
        'No watermark',
        'All platform sizes',
        'Priority support'
      ]
    },
    pro_plus: {
      id: 'pro_plus',
      name: 'Pro+',
      price: 1900, // $19.00 in cents
      priceId: CREEM_PRODUCTS.pro_plus,
      credits: config.limits.pro_plus.monthly,
      features: [
        `${config.limits.pro_plus.monthly} covers per month`,
        'No watermark',
        'All platform sizes',
        'Advanced customization',
        'Commercial usage license',
        'Dedicated support'
      ]
    }
  }
}

// Export the dynamic version as the main export
export const SUBSCRIPTION_PLANS = getSubscriptionPlansWithConfig()

// Price IDs for subscription tiers (to be created in Creem dashboard)
export const CREEM_PRICES = {
  pro: getCreemTestMode() ? 'price_test_pro_900' : 'price_pro_900',
  pro_plus: getCreemTestMode() ? 'price_test_proplus_1900' : 'price_proplus_1900',
}

export interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  planId: 'pro' | 'pro_plus'
  successUrl: string
  cancelUrl: string
  currentPlan?: 'free' | 'pro' | 'pro_plus'
}

export interface CreatePortalSessionParams {
  customerId: string
  returnUrl: string
}

export interface WebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

class CreemPaymentService {
  /**
   * Create a checkout session for subscription
   * This is called from the client side and delegates to the API route
   */
  async createCheckoutSession({
    userId,
    userEmail,
    planId,
    successUrl,
    cancelUrl,
    currentPlan = 'free'
  }: CreateCheckoutSessionParams) {
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) {
      throw new Error('Invalid plan selected')
    }

    try {
      // Client-side implementation - delegate to API route
      if (typeof window !== 'undefined') {
        const baseUrl = window.location.origin
        const apiUrl = `${baseUrl}/api/payment/create-checkout`
        
        // Check auth configuration
        const { authConfig } = await import('@/config/auth.config')
        
        let headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        
        let credentials: RequestCredentials = 'same-origin'
        
        if (authConfig.USE_BESTAUTH) {
          // BestAuth uses session cookies
          console.log('[CreemService] Using BestAuth - including credentials')
          credentials = 'include'
        } else {
          // Supabase uses Bearer tokens
          const authService = (await import('@/services/authService')).default
          
          // Ensure auth is initialized
          if (!authService.isAuthenticated()) {
            console.log('[CreemService] User not authenticated, waiting for auth...')
            await authService.waitForAuth()
          }
          
          // Force refresh session to ensure we have a fresh token
          console.log('[CreemService] Refreshing session to ensure fresh token...')
          const refreshResult = await authService.refreshSession()
          
          if (!refreshResult.session) {
            console.error('[CreemService] Failed to refresh session:', refreshResult.error)
            
            // Try to get current session as fallback
            const sessionResult = await authService.ensureValidSession()
            if (!sessionResult.success || !sessionResult.session) {
              throw new Error(sessionResult.error || 'Authentication required - unable to get valid session')
            }
          }
          
          // Get the current session (should be fresh now)
          const session = authService.getCurrentSession()
          
          if (!session || !session.access_token) {
            console.error('[CreemService] No valid session after refresh')
            throw new Error('Authentication required - please sign in again')
          }
          
          const authToken = session.access_token
          
          console.log('[CreemService] Session refreshed:', {
            hasSession: !!session,
            hasToken: !!authToken,
            tokenPrefix: authToken?.substring(0, 20),
            expiresAt: session.expires_at,
            expiresIn: session.expires_in
          })
          
          // Check if token will expire soon (within 1 minute)
          if (session.expires_at) {
            const expiresAt = new Date(session.expires_at * 1000)
            const now = new Date()
            const timeUntilExpiry = expiresAt.getTime() - now.getTime()
            console.log('[CreemService] Token expires in:', Math.floor(timeUntilExpiry / 1000), 'seconds')
            
            if (timeUntilExpiry < 60000) { // Less than 1 minute
              console.error('[CreemService] Token is about to expire, cannot proceed')
              throw new Error('Session expired - please sign in again')
            }
          }
          
          headers.Authorization = `Bearer ${authToken}`
        }
        
        console.log('[CreemService] Making API request to:', apiUrl)
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          credentials,
          body: JSON.stringify({
            planId,
            successUrl,
            cancelUrl
          })
        })
        
        console.log('[CreemService] API response:', {
          status: response.status,
          ok: response.ok
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create checkout session')
        }

        const data = await response.json()
        return {
          success: true,
          sessionId: data.sessionId,
          url: data.url
        }
      }
      
      // Server-side implementation - use Creem SDK
      console.log('[Creem] Server-side checkout session creation started')
      
      // Get API key with detailed logging
      const CREEM_API_KEY = getCreemApiKey()
      const testMode = getCreemTestMode()
      
      console.log('[Creem] Environment check before validation:', {
        hasApiKey: !!CREEM_API_KEY,
        apiKeyLength: CREEM_API_KEY.length,
        apiKeyPrefix: CREEM_API_KEY ? CREEM_API_KEY.substring(0, 20) + '...' : 'NONE',
        isTestKey: CREEM_API_KEY.startsWith('creem_test_'),
        testMode: testMode,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      })
      
      if (!CREEM_API_KEY) {
        console.error('[Creem] No API key found!')
        throw new Error('Creem API key not configured')
      }

      const productId = CREEM_PRODUCTS[planId as keyof typeof CREEM_PRODUCTS]
      
      if (!productId) {
        console.error('[Creem] Product ID not found for plan:', planId)
        console.error('[Creem] Available products:', CREEM_PRODUCTS)
        console.error('[Creem] Environment variables:', {
          CREEM_PRO_PLAN_ID: process.env.CREEM_PRO_PLAN_ID || 'NOT SET',
          CREEM_PRO_PLUS_PLAN_ID: process.env.CREEM_PRO_PLUS_PLAN_ID || 'NOT SET'
        })
        throw new Error(`Product ID not configured for plan: ${planId}. Please check environment variables.`)
      }
      
      console.log('[Creem] Creating checkout with:', {
        productId,
        planId,
        userEmail,
        apiKey: CREEM_API_KEY ? 'Present' : 'Missing',
        apiKeyPrefix: CREEM_API_KEY.substring(0, 15) + '...',
        apiKeyLength: CREEM_API_KEY.length,
        testMode: testMode,
        serverIdx: testMode ? 1 : 0,
        isTestKey: CREEM_API_KEY.startsWith('creem_test_'),
        expectedKeyType: testMode ? 'test' : 'production'
      })
      
      // Validate API key matches environment
      if (CREEM_API_KEY === '') {
        console.error('[Creem] ERROR: API key is empty!')
        console.error('[Creem] Environment check:', {
          CREEM_SECRET_KEY: process.env.CREEM_SECRET_KEY ? `SET (${process.env.CREEM_SECRET_KEY.substring(0, 15)}...)` : 'NOT SET',
          CREEM_API_KEY: process.env.CREEM_API_KEY ? 'SET' : 'NOT SET',
          NEXT_PUBLIC_CREEM_SECRET_KEY: process.env.NEXT_PUBLIC_CREEM_SECRET_KEY ? 'SET (WARNING: Should not be public!)' : 'NOT SET',
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL,
          VERCEL_ENV: process.env.VERCEL_ENV
        })
        throw new Error('Creem API key not found in environment variables. Please check CREEM_SECRET_KEY is set in Vercel.')
      }
      
      if (testMode && !CREEM_API_KEY.startsWith('creem_test_')) {
        console.error('[Creem] ERROR: Test mode enabled but using production API key')
        console.error('[Creem] API key prefix:', CREEM_API_KEY.substring(0, 10))
        throw new Error('Test mode requires a test API key (should start with "creem_test_")')
      }
      if (!testMode && CREEM_API_KEY.startsWith('creem_test_')) {
        console.error('[Creem] ERROR: Production mode enabled but using test API key')
        throw new Error('Production mode requires a production API key (should not start with "creem_test_")')
      }
      
      // Debug: Log the API call details (without exposing sensitive data)
      console.log('[Creem] API Call Details:', {
        hasApiKey: !!CREEM_API_KEY,
        productId: productId,
        requestId: `checkout_${userId}_${Date.now()}`,
        successUrl: successUrl,
        testMode: testMode,
        serverUrl: testMode ? 'test-mode' : 'production'
      })
      
      let checkout
      try {
        // Create checkout session with Creem SDK
        console.log('[Creem] Creating checkout session with SDK')
        
        // Check if trials are enabled
        const config = getSubscriptionConfig()
        const trialEnabled = isTrialEnabled() && currentPlan === 'free'
        
        const checkoutRequest: any = {
          productId: productId,
          requestId: `checkout_${userId}_${Date.now()}`,
          successUrl: successUrl,
          metadata: {
            userId: userId,
            userEmail: userEmail,
            planId: planId,
            currentPlan: currentPlan,
          },
          customer: {
            email: userEmail,
          }
        }
        
        // Add trial period if enabled and user is upgrading from free
        if (trialEnabled) {
          checkoutRequest.trialPeriodDays = config.trialDays
          console.log(`[Creem] Adding ${config.trialDays} day trial period to checkout`)
        }
        
        checkout = await getCreemClient().createCheckout({
          xApiKey: CREEM_API_KEY,
          createCheckoutRequest: checkoutRequest
        })
        
        console.log('[Creem] SDK checkout response:', {
          id: checkout.id,
          status: checkout.status,
          checkoutUrl: checkout.checkoutUrl,
          product: checkout.product,
          mode: checkout.mode
        })
      } catch (sdkError: any) {
        console.error('[Creem] SDK Error Details:', {
          message: sdkError.message,
          stack: sdkError.stack,
          response: sdkError.response,
          data: sdkError.data,
          status: sdkError.status
        })
        throw new Error(`Creem SDK Error: ${sdkError.message || 'Unknown error'}`)
      }

      console.log('[Creem] Checkout response:', {
        hasCheckout: !!checkout,
        checkoutKeys: checkout ? Object.keys(checkout) : [],
        checkoutType: typeof checkout
      })

      // Check if we have a valid checkout response
      if (!checkout) {
        console.error('Invalid checkout response:', checkout)
        throw new Error('Invalid checkout response from Creem')
      }

      // Handle different response structures
      const checkoutId = checkout.id
      const checkoutUrl = checkout.checkoutUrl
      
      console.log('[Creem] Checkout created:', {
        id: checkoutId,
        url: checkoutUrl,
        hasUrl: !!checkoutUrl,
        status: checkout.status
      })
      
      // Validate checkout URL
      if (!checkoutUrl) {
        console.error('[Creem] No checkout URL in response:', checkout)
        throw new Error('Payment service configuration error. Please try again later.')
      }
      
      // Add warning about potential Creem infrastructure issues
      if (testMode && checkoutUrl.includes('test/checkout')) {
        console.warn('[Creem] Test mode checkout URL detected. Note: Creem test checkout pages may return 404 errors.')
        console.warn('[Creem] This is a known issue with Creem\'s test infrastructure, not your implementation.')
      }
      
      return {
        success: true,
        sessionId: checkoutId,
        url: checkoutUrl
      }
    } catch (error: any) {
      console.error('Creem checkout session error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create checkout session'
      }
    }
  }

  /**
   * Create a customer portal session for managing subscriptions
   */
  async createPortalSession({ customerId, returnUrl }: CreatePortalSessionParams) {
    try {
      // Client-side implementation - delegate to API route
      if (typeof window !== 'undefined') {
        // Check auth configuration
        const { authConfig } = await import('@/config/auth.config')
        
        let headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        
        let credentials: RequestCredentials = 'same-origin'
        
        if (authConfig.USE_BESTAUTH) {
          // BestAuth uses session cookies
          console.log('[CreemService Portal] Using BestAuth - including credentials')
          credentials = 'include'
        } else {
          // Supabase uses Bearer tokens
          const authService = (await import('@/services/authService')).default
          
          // Ensure we have a valid session
          const sessionResult = await authService.ensureValidSession()
          
          if (!sessionResult.success || !sessionResult.session) {
            throw new Error(sessionResult.error || 'Authentication required')
          }
          
          const authToken = sessionResult.session.access_token
          headers.Authorization = `Bearer ${authToken}`
        }
        
        const response = await fetch('/api/payment/create-portal', {
          method: 'POST',
          headers,
          credentials,
          body: JSON.stringify({
            returnUrl
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create portal session')
        }

        const data = await response.json()
        
        // Handle cases where portal URL isn't available
        if (!data.url && data.message) {
          console.warn('[CreemService Portal]', data.message)
          // Return a temporary message
          return {
            success: false,
            error: data.message || 'Billing portal is currently unavailable'
          }
        }
        
        return {
          success: true,
          url: data.url
        }
      }
      
      // Server-side implementation - use Creem SDK
      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      console.log('[Creem] Creating customer portal session:', {
        customerId,
        hasApiKey: !!CREEM_API_KEY,
        apiKeyPrefix: CREEM_API_KEY.substring(0, 15) + '...',
        testMode: getCreemTestMode()
      })

      // Generate customer links using Creem SDK
      const creem = getCreemClient()
      const result = await creem.generateCustomerLinks({
        xApiKey: CREEM_API_KEY,
        createCustomerPortalLinkRequestEntity: {
          customerId: customerId
        }
      })

      console.log('[Creem] Portal session result:', {
        success: !!result?.customerPortalLink,
        hasUrl: !!result?.customerPortalLink,
        customerId,
        result: result
      })

      if (!result?.customerPortalLink) {
        throw new Error('Failed to create customer portal session')
      }

      return {
        success: true,
        url: result.customerPortalLink
      }
    } catch (error: any) {
      console.error('Creem portal session error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create portal session'
      }
    }
  }

  /**
   * Cancel a subscription
   * Note: This should be called from server-side only or through an API endpoint
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    try {
      // This method should only be called from server-side
      if (typeof window !== 'undefined') {
        throw new Error('This method must be called from server-side')
      }

      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      console.log('[Creem] Attempting to cancel subscription:', {
        subscriptionId,
        cancelAtPeriodEnd,
        apiKeyPrefix: CREEM_API_KEY.substring(0, 15) + '...',
        isTestMode: getCreemTestMode()
      })

      // Use the Creem SDK to cancel subscription
      // Note: Creem API doesn't support cancelAtPeriodEnd parameter directly
      const result = await getCreemClient().cancelSubscription({
        id: subscriptionId,
        xApiKey: CREEM_API_KEY
      })

      console.log('[Creem] Subscription cancelled:', result)
      
      return {
        success: true,
        subscription: result
      }
    } catch (error: any) {
      console.error('[Creem] Cancel subscription error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      })
      
      // Check if subscription is already cancelled
      if (error.message?.includes('Subscription already canceled') || 
          error.response?.data?.message?.includes('Subscription already canceled')) {
        console.log('[Creem] Subscription was already cancelled on Creem side, treating as success')
        return {
          success: true,
          alreadyCancelled: true
        }
      }
      
      // Check if it's a specific Creem API error
      if (error.response?.data?.error) {
        return {
          success: false,
          error: error.response.data.error
        }
      }
      
      return {
        success: false,
        error: error.message || 'Failed to cancel subscription'
      }
    }
  }

  /**
   * Resume a cancelled subscription
   * Note: This should be called from server-side only or through an API endpoint
   */
  async resumeSubscription(subscriptionId: string) {
    try {
      // This method should only be called from server-side
      if (typeof window !== 'undefined') {
        throw new Error('This method must be called from server-side')
      }

      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      // TODO: Fix Creem SDK integration for resuming subscriptions
      console.log(`[Creem] Would resume subscription ${subscriptionId}`)

      return {
        success: true,
        subscription: { id: subscriptionId, status: 'active' }
      }
    } catch (error: any) {
      console.error('Creem resume subscription error:', error)
      return {
        success: false,
        error: error.message || 'Failed to resume subscription'
      }
    }
  }

  /**
   * Update subscription (e.g., change items, proration)
   * Note: This should be called from server-side only or through an API endpoint
   */
  async updateSubscription(subscriptionId: string, updates: {
    items?: Array<{ productId?: string; quantity?: number }>,
    updateBehavior?: 'proration-charge-immediately' | 'proration-charge' | 'proration-none'
  }) {
    try {
      // This method should only be called from server-side
      if (typeof window !== 'undefined') {
        throw new Error('This method must be called from server-side')
      }

      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      console.log(`[Creem] Updating subscription ${subscriptionId}`)
      
      // Use the Creem SDK to update subscription
      const result = await getCreemClient().updateSubscription({
        id: subscriptionId,
        xApiKey: CREEM_API_KEY,
        updateSubscriptionRequestEntity: {
          items: updates.items?.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          updateBehavior: updates.updateBehavior || 'proration-charge-immediately'
        }
      })

      console.log('[Creem] Subscription update result:', result)

      return {
        success: true,
        subscription: result
      }
    } catch (error: any) {
      console.error('Creem update subscription error:', error)
      return {
        success: false,
        error: error.message || 'Failed to update subscription'
      }
    }
  }

  /**
   * Get subscription details
   * Note: This should be called from server-side only or through an API endpoint
   */
  async getSubscription(subscriptionId: string) {
    try {
      // This method should only be called from server-side
      if (typeof window !== 'undefined') {
        throw new Error('This method must be called from server-side')
      }

      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      // Use the Creem SDK to retrieve subscription
      const result = await getCreemClient().retrieveSubscription({
        subscriptionId: subscriptionId,
        xApiKey: CREEM_API_KEY
      })

      console.log('[Creem] Retrieved subscription:', result)

      return {
        success: true,
        subscription: result
      }
    } catch (error: any) {
      console.error('Creem get subscription error:', error)
      return {
        success: false,
        error: error.message || 'Failed to get subscription'
      }
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const CREEM_WEBHOOK_SECRET = getCreemWebhookSecret()
    // In test mode, skip signature verification if no webhook secret
    if (getCreemTestMode() && !CREEM_WEBHOOK_SECRET) {
      console.warn('Webhook signature verification skipped in test mode')
      return true
    }

    try {
      const crypto = require('crypto')
      const hmac = crypto.createHmac('sha256', CREEM_WEBHOOK_SECRET)
      const digest = hmac.update(payload).digest('hex')
      return digest === signature
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: any) {
    // Creem uses 'eventType' instead of 'type'
    const eventType = event.eventType || event.type
    const eventData = event.object || event.data?.object
    
    switch (eventType) {
      case 'checkout.completed':
        return this.handleCheckoutComplete(eventData)
      
      case 'subscription.created':
        return this.handleSubscriptionCreated(eventData)
      
      case 'subscription.active':
      case 'subscription.update':
        return this.handleSubscriptionUpdate(eventData)
      
      case 'subscription.canceled':
        return this.handleSubscriptionDeleted(eventData)
      
      case 'subscription.paid':
        return this.handlePaymentSuccess(eventData)
      
      case 'subscription.expired':
        return this.handleSubscriptionExpired(eventData)
      
      case 'subscription.trial_will_end':
        return this.handleSubscriptionTrialWillEnd(eventData)
      
      case 'subscription.trial_ended':
        return this.handleSubscriptionTrialEnded(eventData)
      
      case 'subscription.paused':
        return this.handleSubscriptionPaused(eventData)
      
      case 'refund.created':
        return this.handleRefundCreated(eventData)
        
      case 'dispute.created':
        return this.handleDisputeCreated(eventData)
      
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
        return { success: true }
    }
  }

  private async handleSubscriptionCreated(subscription: any) {
    const { id, customer, metadata, status, trial_period_days, trial_start_date, trial_end_date, current_period_start_date, current_period_end_date } = subscription
    
    console.log('[Creem Webhook] Subscription created:', {
      subscriptionId: id,
      customerId: customer?.id || customer,
      status: status,
      metadata: metadata,
      trial_period_days: trial_period_days,
      trial_start: trial_start_date,
      trial_end: trial_end_date
    })
    
    const customerId = typeof customer === 'string' ? customer : customer?.id
    const userId = metadata?.internal_customer_id || metadata?.userId || customer?.external_id
    
    if (!id || !customerId) {
      console.error('[Creem Webhook] Missing subscription ID or customer ID in subscription.created')
      return { success: true }
    }
    
    const planId = metadata?.planId || this.getPlanFromProduct(subscription.product?.id)
    
    return {
      type: 'subscription_created',
      subscriptionId: id,
      customerId: customerId,
      userId: userId,
      status: status,
      planId: planId,
      trialPeriodDays: trial_period_days,
      trialStart: trial_start_date ? new Date(trial_start_date) : undefined,
      trialEnd: trial_end_date ? new Date(trial_end_date) : undefined,
      currentPeriodStart: current_period_start_date ? new Date(current_period_start_date) : undefined,
      currentPeriodEnd: current_period_end_date ? new Date(current_period_end_date) : undefined
    }
  }

  private async handleCheckoutComplete(checkout: any) {
    const { customer, subscription, metadata, order, trial_period_days } = checkout
    
    // Log the full checkout payload for debugging
    console.log('[Creem Webhook] Checkout complete payload:', {
      hasCustomer: !!customer,
      customerId: customer?.id,
      hasSubscription: !!subscription,
      subscriptionId: subscription?.id,
      subscriptionData: subscription,
      metadata: metadata,
      order: order,
      trial_period_days: trial_period_days
    })
    
    // Extract user ID from metadata or customer external ID
    const userId = metadata?.internal_customer_id || metadata?.userId || customer?.external_id
    const planId = metadata?.planId || this.getPlanFromProduct(order?.product)
    
    // Calculate trial end date if applicable
    let trialEnd = null
    if (trial_period_days && trial_period_days > 0) {
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + trial_period_days)
      trialEnd = trialEndDate.toISOString()
    }
    
    // IMPORTANT: Creem might send subscription ID in different fields
    const subscriptionId = subscription?.id || 
                          subscription?.subscription_id || 
                          checkout.subscription_id ||
                          order?.subscription_id
    
    if (!subscriptionId) {
      console.warn('[Creem Webhook] No subscription ID found in checkout.completed webhook!')
    }
    
    return {
      type: 'checkout_complete',
      userId: userId,
      customerId: customer?.id,
      subscriptionId: subscriptionId,
      planId: planId,
      trialEnd: trialEnd
    }
  }

  private async handleSubscriptionUpdate(subscription: any) {
    const { customer, status, metadata, current_period_end_date, canceled_at, product, cancel_at_period_end } = subscription
    
    const customerId = typeof customer === 'string' ? customer : customer?.id
    const userId = metadata?.internal_customer_id || metadata?.userId
    const planId = metadata?.planId || this.getPlanFromProduct(product?.id)
    
    // Map Creem status to our expected status
    let mappedStatus = status
    if (status === 'trialing') {
      mappedStatus = 'trialing'
    } else if (status === 'active' && cancel_at_period_end) {
      mappedStatus = 'active' // Still active but will cancel at period end
    }
    
    return {
      type: 'subscription_update',
      customerId: customerId,
      status: mappedStatus,
      userId: userId,
      planId: planId,
      currentPeriodEnd: current_period_end_date ? new Date(current_period_end_date) : undefined,
      cancelAtPeriodEnd: cancel_at_period_end || !!canceled_at
    }
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const { customerId, metadata } = subscription
    
    return {
      type: 'subscription_deleted',
      customerId: customerId,
      userId: metadata?.userId
    }
  }

  private async handlePaymentSuccess(subscription: any) {
    const { customer, id, metadata } = subscription
    
    const customerId = typeof customer === 'string' ? customer : customer?.id
    const userId = metadata?.internal_customer_id || metadata?.userId
    
    return {
      type: 'payment_success',
      customerId: customerId,
      subscriptionId: id,
      userId: userId
    }
  }

  private async handlePaymentFailed(transaction: any) {
    const { customerId, subscriptionId, metadata } = transaction
    
    return {
      type: 'payment_failed', 
      customerId: customerId,
      subscriptionId: subscriptionId,
      userId: metadata?.userId
    }
  }

  private async handleSubscriptionPaused(subscription: any) {
    const { id, customer, metadata } = subscription
    
    const customerId = typeof customer === 'string' ? customer : customer?.id
    const userId = metadata?.internal_customer_id || metadata?.userId
    
    return {
      type: 'subscription_paused',
      subscriptionId: id,
      customerId: customerId,
      userId: userId
    }
  }

  private async handleSubscriptionExpired(subscription: any) {
    const { customer, metadata } = subscription
    
    const customerId = typeof customer === 'string' ? customer : customer?.id
    const userId = metadata?.internal_customer_id || metadata?.userId
    
    return {
      type: 'subscription_deleted',
      customerId: customerId,
      userId: userId
    }
  }

  private async handleRefundCreated(refund: any) {
    const { customer, subscription, checkout } = refund
    
    return {
      type: 'refund_created',
      customerId: customer?.id,
      subscriptionId: subscription?.id,
      checkoutId: checkout?.id,
      amount: refund.refund_amount
    }
  }

  private async handleDisputeCreated(dispute: any) {
    const { customer, subscription } = dispute
    
    return {
      type: 'dispute_created',
      customerId: customer?.id,
      subscriptionId: subscription?.id,
      amount: dispute.amount
    }
  }

  private async handleSubscriptionTrialWillEnd(subscription: any) {
    const { customer, metadata, trial_end_date, product } = subscription
    
    const customerId = typeof customer === 'string' ? customer : customer?.id
    const userId = metadata?.internal_customer_id || metadata?.userId
    const planId = metadata?.planId || this.getPlanFromProduct(product?.id)
    
    return {
      type: 'subscription_trial_will_end',
      customerId: customerId,
      userId: userId,
      planId: planId,
      trialEndDate: trial_end_date ? new Date(trial_end_date) : undefined
    }
  }

  private async handleSubscriptionTrialEnded(subscription: any) {
    const { customer, metadata, id, product } = subscription
    
    const customerId = typeof customer === 'string' ? customer : customer?.id
    const userId = metadata?.internal_customer_id || metadata?.userId
    const planId = metadata?.planId || this.getPlanFromProduct(product?.id)
    
    return {
      type: 'subscription_trial_ended',
      customerId: customerId,
      userId: userId,
      subscriptionId: id,
      planId: planId
    }
  }

  /**
   * Helper to extract plan ID from product ID
   */
  private getPlanFromProduct(productId: string): string {
    if (!productId) return 'free'
    
    if (productId.includes('pro_plus') || productId.includes('proplus')) {
      return 'pro_plus'
    } else if (productId.includes('pro')) {
      return 'pro'
    }
    
    return 'free'
  }

  /**
   * Helper to format price for display
   */
  formatPrice(amountInCents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountInCents / 100)
  }

  /**
   * Check if we're in test mode
   */
  isTestMode(): boolean {
    return getCreemTestMode()
  }

  /**
   * Create or retrieve a customer
   */
  async createOrRetrieveCustomer(userId: string, email: string) {
    try {
      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      // TODO: Fix Creem SDK integration for customer management
      console.log(`[Creem] Would create or retrieve customer for user ${userId} (${email})`)
      
      // For now, return a placeholder customer
      return {
        success: true,
        customer: { 
          id: `cust_${userId}`, 
          email: email, 
          externalId: userId 
        }
      }
    } catch (error: any) {
      console.error('Creem customer error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create/retrieve customer'
      }
    }
  }

  /**
   * Upgrade subscription to a higher tier
   */
  async upgradeSubscription(subscriptionId: string, newPlanId: 'pro' | 'pro_plus') {
    try {
      if (typeof window !== 'undefined') {
        throw new Error('This method must be called from server-side')
      }

      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      // TODO: Fix Creem SDK integration for subscription upgrades
      console.log(`[Creem] Would upgrade subscription ${subscriptionId} to ${newPlanId}`)

      return {
        success: true,
        subscription: { id: subscriptionId, status: 'active', plan: newPlanId }
      }
    } catch (error: any) {
      console.error('Creem upgrade subscription error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upgrade subscription'
      }
    }
  }

  /**
   * Activate trial subscription (convert to paid immediately)
   * This is a workaround since Creem doesn't support ending trials early
   * We force an immediate charge by updating the subscription with proration
   */
  async activateTrialSubscription(subscriptionId: string) {
    try {
      if (typeof window !== 'undefined') {
        throw new Error('This method must be called from server-side')
      }

      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      console.log(`[Creem] Attempting to activate trial subscription ${subscriptionId}`)

      // First, get the current subscription to verify it's in trial
      const subResult = await this.getSubscription(subscriptionId)
      if (!subResult.success || !subResult.subscription) {
        throw new Error('Failed to retrieve subscription')
      }

      const subscription = subResult.subscription as any
      console.log('[Creem] Current subscription status:', subscription.status)

      if (subscription.status !== 'trialing') {
        return {
          success: false,
          error: 'Subscription is not in trial status'
        }
      }

      // WORKAROUND: Since we can't end trials early, we'll update the subscription
      // with immediate proration charge to trigger billing
      // This effectively converts the trial to paid by charging immediately
      const updateResult = await this.updateSubscription(subscriptionId, {
        items: [{
          productId: subscription.product?.id || subscription.product,
          quantity: 1
        }],
        updateBehavior: 'proration-charge-immediately' // Force immediate charge
      })

      if (!updateResult.success) {
        throw new Error('Failed to update subscription for activation')
      }

      console.log('[Creem] Trial activation completed with immediate charge')

      return {
        success: true,
        activated: true,
        subscription: updateResult.subscription,
        message: 'Trial activated with immediate billing'
      }
    } catch (error: any) {
      console.error('Creem activate trial error:', error)
      return {
        success: false,
        error: error.message || 'Failed to activate trial subscription'
      }
    }
  }

  /**
   * Validate a license key (for Pro+ features)
   */
  async validateLicense(licenseKey: string) {
    try {
      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      // TODO: Fix Creem SDK integration for license validation
      console.log(`[Creem] Would validate license ${licenseKey}`)
      
      // For now, return valid for any non-empty license key
      const isValid = licenseKey && licenseKey.length > 10

      return {
        success: true,
        valid: isValid,
        license: { key: licenseKey, valid: isValid }
      }
    } catch (error: any) {
      console.error('Creem validate license error:', error)
      return {
        success: false,
        error: error.message || 'Failed to validate license'
      }
    }
  }

  /**
   * Create products in Creem (run once during setup)
   * This should be run separately for test and production environments
   */
  async createProducts() {
    try {
      const CREEM_API_KEY = getCreemApiKey()
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      const testMode = getCreemTestMode()
      console.log('[Creem] Creating products in', testMode ? 'TEST' : 'PRODUCTION', 'mode')

      // Create Pro product
      const proProduct = await getCreemClient().createProduct({
        xApiKey: getCreemApiKey(),
        createProductRequestEntity: {
          name: 'CoverGen Pro',
          description: 'Professional plan with 120 covers per month and priority support',
          price: 900, // $9.00 in cents
          currency: 'USD',
          billingType: 'recurring',
          billingPeriod: 'monthly'
        }
      })

      // Create Pro+ product
      const proPlusProduct = await getCreemClient().createProduct({
        xApiKey: getCreemApiKey(),
        createProductRequestEntity: {
          name: 'CoverGen Pro+',
          description: 'Premium plan with 300 covers per month, commercial license, and dedicated support',
          price: 1900, // $19.00 in cents
          currency: 'USD',
          billingType: 'recurring',
          billingPeriod: 'monthly'
        }
      })

      console.log('[Creem] Products created:', {
        pro: proProduct.id,
        proPlus: proPlusProduct.id,
        testMode: testMode
      })

      return [
        { success: true, product: proProduct },
        { success: true, product: proPlusProduct }
      ]
    } catch (error: any) {
      console.error('Creem create products error:', error)
      return [{
        success: false,
        error: error.message || 'Failed to create products'
      }]
    }
  }

  /**
   * Helper method to setup test environment
   * Creates test products and returns their IDs
   */
  async setupTestEnvironment() {
    if (!getCreemTestMode()) {
      throw new Error('This method can only be run in test mode')
    }

    console.log('[Creem] Setting up test environment...')
    
    const products = await this.createProducts()
    const successfulProducts = products.filter(p => p.success && 'product' in p)
    
    if (successfulProducts.length === 2) {
      console.log('[Creem] Test environment setup complete. Product IDs:')
      const proProd = successfulProducts[0] as { success: boolean; product: any }
      const proPlusProd = successfulProducts[1] as { success: boolean; product: any }
      console.log('Pro:', proProd.product.id)
      console.log('Pro+:', proPlusProd.product.id)
      console.log('\nUpdate your .env file with these product IDs:')
      console.log(`CREEM_TEST_PRO_PRODUCT_ID=${proProd.product.id}`)
      console.log(`CREEM_TEST_PRO_PLUS_PRODUCT_ID=${proPlusProd.product.id}`)
    } else {
      console.error('[Creem] Failed to create all test products')
    }

    return products
  }
}

export const creemService = new CreemPaymentService()

// Export for debugging purposes
export { getCreemTestMode, getCreemApiKey }