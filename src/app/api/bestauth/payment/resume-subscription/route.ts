import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService } from '@/services/payment/creem'

async function handler(req: AuthenticatedRequest) {
  try {
    const user = req.user!
    const { subscriptionId } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      )
    }

    // Get current subscription from BestAuth
    const subscription = await bestAuthSubscriptionService.getUserSubscription(user.id)
    
    if (!subscription || subscription.stripe_subscription_id !== subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Check if subscription is actually cancelled
    if (!subscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'Subscription is not cancelled' },
        { status: 400 }
      )
    }

    // Resume subscription via Creem
    const result = await creemService.resumeSubscription(subscriptionId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to resume subscription' },
        { status: 400 }
      )
    }

    // Update subscription status in BestAuth
    await bestAuthSubscriptionService.resumeSubscription(user.id)

    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully'
    })
  } catch (error: any) {
    console.error('[BestAuth] Resume subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resume subscription' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)