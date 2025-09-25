import { SUBSCRIPTION_PLANS } from '@/services/payment/creem'

type PlanId = 'free' | 'pro' | 'pro_plus'

interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  planId: PlanId
  successUrl: string
  cancelUrl: string
  currentPlan?: PlanId
}

export class BestAuthPaymentService {
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
        const apiUrl = `${baseUrl}/api/bestauth/payment/create-checkout`
        
        console.log('[BestAuthPaymentService] Creating checkout session')
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for BestAuth
          body: JSON.stringify({
            planId,
            successUrl,
            cancelUrl
          })
        })
        
        console.log('[BestAuthPaymentService] API response:', {
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

      // Server-side - this should not be called directly
      throw new Error('Server-side checkout creation not implemented')
    } catch (error: any) {
      console.error('[BestAuthPaymentService] Create checkout error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create checkout session'
      }
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
    try {
      const response = await fetch('/api/bestauth/payment/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for BestAuth
        body: JSON.stringify({
          subscriptionId,
          cancelAtPeriodEnd
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }

      return await response.json()
    } catch (error: any) {
      console.error('[BestAuthPaymentService] Cancel subscription error:', error)
      throw error
    }
  }

  async createPortalSession(returnUrl: string) {
    try {
      const response = await fetch('/api/payment/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for BestAuth
        body: JSON.stringify({ returnUrl })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create portal session')
      }

      return await response.json()
    } catch (error: any) {
      console.error('[BestAuthPaymentService] Create portal error:', error)
      throw error
    }
  }

  async upgradeSubscription(newPlanId: PlanId) {
    try {
      const response = await fetch('/api/payment/upgrade-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for BestAuth
        body: JSON.stringify({ newPlanId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upgrade subscription')
      }

      return await response.json()
    } catch (error: any) {
      console.error('[BestAuthPaymentService] Upgrade subscription error:', error)
      throw error
    }
  }

  async resumeSubscription(subscriptionId: string) {
    try {
      const response = await fetch('/api/bestauth/payment/resume-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for BestAuth
        body: JSON.stringify({ subscriptionId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to resume subscription')
      }

      return await response.json()
    } catch (error: any) {
      console.error('[BestAuthPaymentService] Resume subscription error:', error)
      throw error
    }
  }
}

export const bestAuthPaymentService = new BestAuthPaymentService()