import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService } from '@/services/payment/creem'

async function handler(req: AuthenticatedRequest) {
  try {
    const user = req.user!
    const { subscriptionId, cancelAtPeriodEnd = true } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      )
    }

    // Get current subscription
    const subscription = await bestAuthSubscriptionService.getUserSubscription(user.id)
    
    if (!subscription || subscription.stripe_subscription_id !== subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Cancel with Creem
    const result = await creemService.cancelSubscription(subscriptionId, cancelAtPeriodEnd)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Update subscription status in BestAuth
    await bestAuthSubscriptionService.cancelSubscription(user.id, cancelAtPeriodEnd)

    return NextResponse.json({
      success: true,
      message: cancelAtPeriodEnd ? 
        'Subscription will be cancelled at the end of the billing period' : 
        'Subscription cancelled immediately'
    })
  } catch (error: any) {
    console.error('[BestAuth] Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)