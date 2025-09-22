// BestAuth Subscription Cancel API
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

// POST /api/bestauth/subscription/cancel - Cancel subscription
export async function POST(request: NextRequest) {
  try {
    const session = await validateSession(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.userId
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
    if (subscription.status === 'cancelled' || 
        (subscription.status === 'active' && subscription.cancel_at_period_end)) {
      return NextResponse.json({
        success: false,
        message: 'Subscription is already cancelled',
        subscription
      })
    }
    
    // Cancel subscription
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
    const session = await validateSession(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.userId
    
    // Get current subscription
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    // Check if subscription is scheduled for cancellation
    if (!subscription.cancel_at_period_end) {
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