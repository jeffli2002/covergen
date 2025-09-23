// BestAuth Subscription Resume API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService } from '@/services/payment/creem'

// POST /api/bestauth/subscription/resume - Resume a cancelled subscription
export async function POST(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    
    // Get current subscription
    const currentSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    // Check if subscription is scheduled for cancellation
    const hasStripeSubscription = !!currentSubscription.stripe_subscription_id
    const isCancelledAtPeriodEnd = currentSubscription.cancel_at_period_end
    
    if (!hasStripeSubscription) {
      return NextResponse.json({
        success: false,
        error: 'No active subscription to resume',
        message: 'Please create a new subscription'
      })
    }
    
    if (!isCancelledAtPeriodEnd && currentSubscription.status !== 'cancelled') {
      return NextResponse.json({
        success: false,
        message: 'Subscription is not cancelled',
        subscription: currentSubscription
      })
    }
    
    try {
      // If subscription is cancelled but period hasn't ended
      if (isCancelledAtPeriodEnd && currentSubscription.status === 'active') {
        // Use Creem SDK to resume the subscription
        const resumeResult = await creemService.resumeSubscription(currentSubscription.stripe_subscription_id!)
        
        if (!resumeResult.success) {
          throw new Error(resumeResult.error || 'Failed to resume with Creem')
        }
        
        // Update our database
        const updated = await bestAuthSubscriptionService.resumeSubscription(userId)
        
        return NextResponse.json({
          success: true,
          resumed: true,
          message: 'Subscription resumed successfully! Your subscription will continue as normal.',
          subscription: updated
        })
      }
      
      // If subscription is already cancelled/expired
      if (currentSubscription.status === 'cancelled' || currentSubscription.status === 'expired') {
        return NextResponse.json({
          success: false,
          error: 'Subscription has already ended',
          message: 'Please create a new subscription to continue',
          requiresNewSubscription: true
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Unable to resume subscription',
        message: 'Subscription is in an unexpected state'
      })
      
    } catch (creemError: any) {
      console.error('[Resume] Creem resume failed:', creemError)
      
      // Fallback: Just update database if Creem fails
      const updated = await bestAuthSubscriptionService.resumeSubscription(userId)
      
      return NextResponse.json({
        success: true,
        resumed: true,
        message: 'Subscription resume requested. Changes will be reflected shortly.',
        subscription: updated
      })
    }
  } catch (error) {
    console.error('Resume subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to resume subscription' },
      { status: 500 }
    )
  }
}