// BestAuth Subscription Cancel API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

// POST /api/bestauth/subscription/cancel - Cancel subscription
export async function POST(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    const { cancelAtPeriodEnd = true } = await request.json()
    
    // Get current subscription
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    // Check if already on free plan
    if (subscription.tier === 'free') {
      return NextResponse.json(
        { error: 'Cannot cancel free plan' },
        { status: 400 }
      )
    }
    
    // Check if already cancelled
    if (subscription.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        message: 'Subscription is already cancelled',
        subscription
      })
    }
    
    // Check if subscription has Stripe ID for Creem cancellation
    const stripeSubscriptionId = subscription.stripe_subscription_id
    
    if (stripeSubscriptionId) {
      try {
        // Import Creem service for server-side use
        const { creemService } = await import('@/services/payment/creem')
        
        console.log('[Cancel] Attempting to cancel via Creem:', {
          stripeSubscriptionId,
          cancelAtPeriodEnd,
          hasCreemService: !!creemService
        })
        
        // Cancel via Creem SDK
        const cancelResult = await creemService.cancelSubscription(stripeSubscriptionId, cancelAtPeriodEnd)
        
        console.log('[Cancel] Creem cancelResult:', cancelResult)
        
        if (!cancelResult.success) {
          throw new Error(cancelResult.error || 'Failed to cancel with Creem')
        }
      } catch (creemError: any) {
        console.error('[Cancel] Creem cancellation failed:', {
          error: creemError.message,
          stack: creemError.stack,
          details: creemError
        })
        // Return error to client instead of continuing
        return NextResponse.json(
          { 
            error: `Failed to cancel subscription: ${creemError.message || 'Unknown Creem error'}`,
            details: process.env.NODE_ENV === 'development' ? creemError.toString() : undefined
          },
          { status: 500 }
        )
      }
    }
    
    // Cancel subscription in database
    const updated = await bestAuthSubscriptionService.cancelSubscription(userId, cancelAtPeriodEnd)
    
    return NextResponse.json({
      success: true,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be cancelled at the end of the current period'
        : 'Subscription cancelled immediately',
      subscription: updated
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/bestauth/subscription/cancel - Resume cancelled subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    
    // Get current subscription
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    // Check if subscription is scheduled for cancellation
    if (subscription.status !== 'cancelled') {
      return NextResponse.json({
        success: false,
        message: 'Subscription is not scheduled for cancellation',
        subscription
      })
    }
    
    // Resume subscription
    const updated = await bestAuthSubscriptionService.resumeSubscription(userId)
    
    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully',
      subscription: updated
    })
  } catch (error) {
    console.error('Resume subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to resume subscription' },
      { status: 500 }
    )
  }
}