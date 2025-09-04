import { Creem } from 'creem'

// Creem Test Mode Configuration
const CREEM_TEST_MODE = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
const CREEM_API_KEY = process.env.CREEM_SECRET_KEY || ''
const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET || ''

console.log('[Creem Init] Configuration:', {
  testMode: CREEM_TEST_MODE,
  hasApiKey: !!CREEM_API_KEY,
  apiKeyPrefix: CREEM_API_KEY.substring(0, 10) + '...',
  nodeEnv: process.env.NODE_ENV
})

// Initialize Creem SDK with test mode support
const creemClient = new Creem({
  serverIdx: CREEM_TEST_MODE ? 1 : 0, // 0: production, 1: test-mode
})

// Test card numbers for Creem
export const CREEM_TEST_CARDS = {
  success: '4242424242424242', // Successful payment
  decline: '4000000000000002', // Card declined
  insufficient: '4000000000009995', // Insufficient funds
  expired: '4000000000000069', // Expired card
  processing_error: '4000000000000119', // Processing error
  threeDSecure: '4000000000003220', // 3D Secure required
}

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: '', // No Creem price ID for free tier
    credits: 0,
    features: [
      '10 covers per month',
      'No watermark',
      'Basic platform sizes',
      'Email support'
    ]
  },
  pro: {
    id: 'pro', 
    name: 'Pro',
    price: 900, // $9.00 in cents
    priceId: CREEM_TEST_MODE ? 'price_test_pro_900' : 'price_pro_900',
    credits: 100,
    features: [
      '120 covers per month',
      'No watermark',
      'All platform sizes',
      'Priority support',
      'Batch generation',
      '24-hour download history'
    ]
  },
  pro_plus: {
    id: 'pro_plus',
    name: 'Pro+', 
    price: 1900, // $19.00 in cents
    priceId: CREEM_TEST_MODE ? 'price_test_proplus_1900' : 'price_proplus_1900',
    credits: 500,
    features: [
      '300 covers per month',
      'No watermark',
      'Commercial license',
      'Custom brand templates',
      'API access',
      'Dedicated support',
      '7-day cloud gallery'
    ]
  }
}

// Product IDs for subscription tiers (to be created in Creem dashboard)
export const CREEM_PRODUCTS = {
  pro: process.env.CREEM_PRO_PLAN_ID || (CREEM_TEST_MODE ? 'prod_test_pro' : 'prod_pro'),
  pro_plus: process.env.CREEM_PRO_PLUS_PLAN_ID || (CREEM_TEST_MODE ? 'prod_test_proplus' : 'prod_proplus'),
}

// Price IDs for subscription tiers (to be created in Creem dashboard)
export const CREEM_PRICES = {
  pro: CREEM_TEST_MODE ? 'price_test_pro_900' : 'price_pro_900',
  pro_plus: CREEM_TEST_MODE ? 'price_test_proplus_1900' : 'price_proplus_1900',
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
        
        // Get auth token
        const authService = (await import('@/services/authService')).default
        const session = authService.getCurrentSession()
        const authToken = session?.access_token
        
        if (!authToken) {
          throw new Error('Authentication required')
        }
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            planId,
            successUrl,
            cancelUrl
          })
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
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      const productId = CREEM_PRODUCTS[planId as keyof typeof CREEM_PRODUCTS]
      
      console.log('[Creem] Creating checkout with:', {
        productId,
        planId,
        userEmail,
        apiKey: CREEM_API_KEY ? 'Present' : 'Missing',
        apiKeyLength: CREEM_API_KEY.length,
        testMode: CREEM_TEST_MODE
      })
      
      let checkout
      try {
        // Create checkout session with Creem SDK
        checkout = await creemClient.createCheckout({
          xApiKey: CREEM_API_KEY,
          createCheckoutRequest: {
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
            },
          }
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

      console.log('[Creem] Checkout response:', checkout)

      // Check if we have a valid checkout response
      if (!checkout || !checkout.id) {
        console.error('Invalid checkout response:', checkout)
        throw new Error('Invalid checkout response from Creem')
      }

      // Handle different response structures
      const checkoutId = checkout.id
      const checkoutUrl = checkout.checkoutUrl || checkout.url || `https://app.creem.io/checkout/${checkoutId}`
      
      console.log('[Creem] Checkout created:', {
        id: checkoutId,
        url: checkoutUrl,
        hasUrl: !!checkoutUrl
      })
      
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
        const authService = (await import('@/services/authService')).default
        const session = authService.getCurrentSession()
        const authToken = session?.access_token
        
        if (!authToken) {
          throw new Error('Authentication required')
        }

        const response = await fetch('/api/payment/create-portal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            returnUrl
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create portal session')
        }

        const data = await response.json()
        return {
          success: true,
          url: data.url
        }
      }
      
      // Server-side implementation
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      // Generate customer portal links
      const result = await creemClient.generateCustomerLinks({
        customerId: customerId,
        xApiKey: CREEM_API_KEY,
        generateCustomerLinks: {
          returnUrl: returnUrl
        }
      })

      return {
        success: true,
        url: result.data.portalUrl
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

      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      const result = await creemClient.cancelSubscription({
        subscriptionId: subscriptionId,
        xApiKey: CREEM_API_KEY,
        cancelSubscription: {
          cancelAtPeriodEnd: cancelAtPeriodEnd
        }
      })

      return {
        success: true,
        subscription: result.data
      }
    } catch (error: any) {
      console.error('Creem cancel subscription error:', error)
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

      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      // Update subscription to not cancel at period end
      const result = await creemClient.updateSubscription({
        subscriptionId: subscriptionId,
        xApiKey: CREEM_API_KEY,
        updateSubscription: {
          cancelAtPeriodEnd: false
        }
      })

      return {
        success: true,
        subscription: result.data
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
   * Get subscription details
   * Note: This should be called from server-side only or through an API endpoint
   */
  async getSubscription(subscriptionId: string) {
    try {
      // This method should only be called from server-side
      if (typeof window !== 'undefined') {
        throw new Error('This method must be called from server-side')
      }

      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      const result = await creemClient.retrieveSubscription({
        subscriptionId: subscriptionId,
        xApiKey: CREEM_API_KEY,
      })

      return {
        success: true,
        subscription: result.data
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
    // In test mode, skip signature verification if no webhook secret
    if (CREEM_TEST_MODE && !CREEM_WEBHOOK_SECRET) {
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
      
      case 'subscription.active':
      case 'subscription.update':
        return this.handleSubscriptionUpdate(eventData)
      
      case 'subscription.canceled':
        return this.handleSubscriptionDeleted(eventData)
      
      case 'subscription.paid':
        return this.handlePaymentSuccess(eventData)
      
      case 'subscription.expired':
        return this.handleSubscriptionExpired(eventData)
      
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

  private async handleCheckoutComplete(checkout: any) {
    const { customer, subscription, metadata, order } = checkout
    
    // Extract user ID from metadata or customer external ID
    const userId = metadata?.internal_customer_id || metadata?.userId || customer?.external_id
    const planId = metadata?.planId || this.getPlanFromProduct(order?.product)
    
    return {
      type: 'checkout_complete',
      userId: userId,
      customerId: customer?.id,
      subscriptionId: subscription?.id,
      planId: planId
    }
  }

  private async handleSubscriptionUpdate(subscription: any) {
    const { customer, status, metadata, current_period_end_date, canceled_at, product } = subscription
    
    const customerId = typeof customer === 'string' ? customer : customer?.id
    const userId = metadata?.internal_customer_id || metadata?.userId
    const planId = metadata?.planId || this.getPlanFromProduct(product?.id)
    
    return {
      type: 'subscription_update',
      customerId: customerId,
      status,
      userId: userId,
      planId: planId,
      currentPeriodEnd: current_period_end_date ? new Date(current_period_end_date) : undefined,
      cancelAtPeriodEnd: !!canceled_at
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
    return CREEM_TEST_MODE
  }

  /**
   * Create or retrieve a customer
   */
  async createOrRetrieveCustomer(userId: string, email: string) {
    try {
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      // Try to retrieve existing customer by external ID
      try {
        const result = await creemClient.retrieveCustomer({
          customerId: userId, // Using userId as external ID
          xApiKey: CREEM_API_KEY,
        })
        return {
          success: true,
          customer: result.data
        }
      } catch (error) {
        // Customer doesn't exist, create new one
        const createResult = await creemClient.createCustomer({
          xApiKey: CREEM_API_KEY,
          createCustomer: {
            email: email,
            externalId: userId,
            metadata: {
              userId: userId
            }
          }
        })
        return {
          success: true,
          customer: createResult.data
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

      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      const newPriceId = CREEM_PRICES[newPlanId as keyof typeof CREEM_PRICES]
      
      const result = await creemClient.upgradeSubscription({
        subscriptionId: subscriptionId,
        xApiKey: CREEM_API_KEY,
        upgradeSubscription: {
          priceId: newPriceId,
          prorationBehavior: 'create_prorations' // Prorate the upgrade
        }
      })

      return {
        success: true,
        subscription: result.data
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
   * Validate a license key (for Pro+ API access)
   */
  async validateLicense(licenseKey: string) {
    try {
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      const result = await creemClient.validateLicense({
        xApiKey: CREEM_API_KEY,
        validateLicense: {
          licenseKey: licenseKey
        }
      })

      return {
        success: true,
        valid: result.data.valid,
        license: result.data
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
   */
  async createProducts() {
    try {
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured')
      }

      const products = [
        {
          id: CREEM_PRODUCTS.pro,
          name: 'CoverGen Pro',
          description: 'Professional cover generation with 120 covers per month',
          prices: [{
            id: CREEM_PRICES.pro,
            amount: 900,
            currency: 'USD',
            interval: 'month'
          }],
          metadata: {
            tier: 'pro',
            credits: '120',
            features: JSON.stringify(SUBSCRIPTION_PLANS.pro.features)
          }
        },
        {
          id: CREEM_PRODUCTS.pro_plus,
          name: 'CoverGen Pro+',
          description: 'Advanced cover generation with 300 covers per month and API access',
          prices: [{
            id: CREEM_PRICES.pro_plus,
            amount: 1900,
            currency: 'USD',
            interval: 'month'
          }],
          metadata: {
            tier: 'pro_plus',
            credits: '300',
            features: JSON.stringify(SUBSCRIPTION_PLANS.pro_plus.features)
          }
        }
      ]

      const results = []
      for (const product of products) {
        try {
          const result = await creemClient.createProduct({
            xApiKey: CREEM_API_KEY,
            createProduct: {
              name: product.name,
              description: product.description,
              metadata: product.metadata,
              active: true
            }
          })
          results.push({ success: true, product: result.data })
        } catch (error: any) {
          console.error(`Failed to create product ${product.name}:`, error)
          results.push({ success: false, error: error.message })
        }
      }

      return results
    } catch (error: any) {
      console.error('Creem create products error:', error)
      return [{
        success: false,
        error: error.message || 'Failed to create products'
      }]
    }
  }
}

export const creemService = new CreemPaymentService()