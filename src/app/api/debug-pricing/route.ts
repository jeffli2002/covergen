// Debug Pricing Section Data API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

export async function GET(request: NextRequest) {
  try {
    console.log('[Debug Pricing] Starting debug check')
    
    // Validate session
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({
        error: 'Unauthorized',
        authenticated: false
      }, { status: 401 })
    }
    
    const userId = session.data.user.id
    const userEmail = session.data.user.email
    
    console.log('[Debug Pricing] User:', { userId, userEmail })
    
    // Get subscription data
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    console.log('[Debug Pricing] Raw subscription:', subscription)
    
    // Format response same as subscription status API
    const response = subscription ? {
      ...subscription,
      // Compatibility fields
      plan: subscription.tier,
      isTrialing: subscription.is_trialing,
      trialDaysRemaining: subscription.trial_days_remaining,
      hasPaymentMethod: subscription.has_payment_method,
      requiresPaymentSetup: subscription.requires_payment_setup,
      canGenerate: subscription.can_generate,
      usageToday: subscription.usage_today,
      usageLimit: {
        daily: subscription.daily_limit,
        monthly: subscription.monthly_limit
      }
    } : null
    
    return NextResponse.json({
      debug: 'pricing_data',
      user: {
        id: userId,
        email: userEmail
      },
      subscriptionRaw: subscription,
      subscriptionFormatted: response,
      expectedForPricing: {
        plan: response?.plan,
        isTrialing: response?.isTrialing,
        status: response?.status,
        tier: response?.tier
      }
    })
  } catch (error) {
    console.error('[Debug Pricing] Error:', error)
    return NextResponse.json({
      error: 'Failed to debug pricing data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}