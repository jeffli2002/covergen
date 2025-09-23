// BestAuth Subscription Downgrade API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService, CREEM_PRODUCTS } from '@/services/payment/creem'

// POST /api/bestauth/subscription/downgrade - Downgrade subscription (Pro+ to Pro)
export async function POST(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    const body = await request.json()
    const { targetTier, immediateDowngrade = false } = body
    
    // Validate target tier
    if (!targetTier || targetTier !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid target tier for downgrade' },
        { status: 400 }
      )
    }
    
    // Get current subscription
    const currentSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    // Validate downgrade path
    if (currentSubscription.tier !== 'pro_plus') {
      return NextResponse.json(
        { error: 'Can only downgrade from Pro+ plan' },
        { status: 400 }
      )
    }
    
    if (currentSubscription.tier === targetTier) {
      return NextResponse.json(
        { error: 'Already on the Pro plan' },
        { status: 400 }
      )
    }
    
    // Check if subscription has Stripe ID
    const stripeSubscriptionId = currentSubscription.stripe_subscription_id
    if (!stripeSubscriptionId) {
      return NextResponse.json({
        success: false,
        error: 'No payment provider subscription found',
        message: 'Unable to process downgrade'
      })
    }
    
    try {
      // Import Creem service for server-side use
      const productId = CREEM_PRODUCTS.pro
      
      if (!productId) {
        throw new Error('Pro plan product ID not configured')
      }
      
      // Use Creem SDK to update subscription
      const updateResult = await creemService.updateSubscription(stripeSubscriptionId, {
        items: [{
          productId: productId,
          quantity: 1
        }],
        updateBehavior: immediateDowngrade ? 'proration-charge' : 'proration-none'
      })
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update subscription with Creem')
      }
      
      // Update our database
      const updated = await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId,
        tier: targetTier,
        metadata: {
          downgraded_from: 'pro_plus',
          downgraded_at: new Date().toISOString(),
          immediate_downgrade: immediateDowngrade
        }
      })
      
      return NextResponse.json({
        success: true,
        downgraded: true,
        message: immediateDowngrade 
          ? 'Successfully downgraded to Pro plan with immediate effect'
          : 'Downgrade scheduled for the end of current billing period',
        subscription: updated,
        note: immediateDowngrade
          ? 'You will receive a prorated credit for the unused Pro+ time'
          : 'You will continue to have Pro+ benefits until the end of the current billing period'
      })
      
    } catch (creemError: any) {
      console.error('[Downgrade] Creem downgrade failed:', creemError)
      
      // Fallback: Schedule downgrade at period end
      const updated = await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId,
        metadata: {
          scheduled_downgrade_to: targetTier,
          scheduled_downgrade_at: currentSubscription.next_billing_date
        }
      })
      
      return NextResponse.json({
        success: true,
        downgraded: false,
        scheduled: true,
        message: 'Downgrade scheduled for the end of current billing period',
        subscription: updated,
        effective_date: currentSubscription.next_billing_date
      })
    }
  } catch (error) {
    console.error('Downgrade error:', error)
    return NextResponse.json(
      { error: 'Failed to process downgrade' },
      { status: 500 }
    )
  }
}