import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService, SUBSCRIPTION_PLANS } from '@/services/payment/creem'

async function handler(req: AuthenticatedRequest) {
  try {
    const user = req.user!
    const { subscriptionId, newPlanId } = await req.json()

    if (!subscriptionId || !newPlanId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate plan ID
    if (newPlanId !== 'pro' && newPlanId !== 'pro_plus') {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
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

    // Check if this is actually an upgrade
    const currentTier = subscription.tier
    if (currentTier === newPlanId) {
      return NextResponse.json(
        { error: 'Already on the selected plan' },
        { status: 400 }
      )
    }

    // Validate upgrade path
    if (currentTier === 'pro_plus' && newPlanId === 'pro') {
      return NextResponse.json(
        { error: 'Downgrade not supported via this endpoint' },
        { status: 400 }
      )
    }

    // Upgrade subscription via Creem
    const newProductId = newPlanId === 'pro' ? process.env.CREEM_PRO_PLAN_ID! : process.env.CREEM_PRO_PLUS_PLAN_ID!
    const result = await creemService.updateSubscription(subscriptionId, {
      items: [{ productId: newProductId, quantity: 1 }],
      updateBehavior: 'proration-charge-immediately'
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to upgrade subscription' },
        { status: 400 }
      )
    }

    // Update subscription in BestAuth (webhook will handle the full update)
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: user.id,
      tier: newPlanId,
      status: 'active'
    })

    return NextResponse.json({
      success: true,
      message: `Subscription upgraded to ${SUBSCRIPTION_PLANS[newPlanId as keyof typeof SUBSCRIPTION_PLANS].name}`,
      subscription: result.subscription
    })
  } catch (error: any) {
    console.error('[BestAuth] Upgrade subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)