// BestAuth Subscription Status API
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.data.userId
    
    // Get subscription status
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!subscription) {
      // Create default free subscription if none exists
      await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId,
        tier: 'free',
        status: 'active'
      })
      
      // Try again
      const newSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
      return NextResponse.json(newSubscription)
    }
    
    // Add additional computed fields for compatibility with existing code
    const response = {
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
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}