// BestAuth Subscription Activation API
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

// POST /api/bestauth/subscription/activate - Activate a trial subscription
export async function POST(request: NextRequest) {
  try {
    const session = await validateSession(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.userId
    
    // Get current subscription
    const currentSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    // Check if already on a paid plan
    if (currentSubscription.tier !== 'free' && currentSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'Already on a paid plan' },
        { status: 400 }
      )
    }
    
    // Check if user has payment method
    if (!currentSubscription.has_payment_method) {
      return NextResponse.json({
        success: false,
        needsPaymentMethod: true,
        error: 'Please add a payment method first',
        message: 'Payment method required to activate subscription'
      })
    }
    
    // If in trial, convert to active subscription
    if (currentSubscription.is_trialing) {
      // Update subscription status
      const updated = await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId,
        status: 'active',
        trialEndedAt: new Date()
      })
      
      return NextResponse.json({
        success: true,
        activated: true,
        message: 'Trial converted to active subscription',
        subscription: updated
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Cannot activate subscription',
      message: 'Subscription is not in trial status'
    })
  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json(
      { error: 'Failed to activate subscription' },
      { status: 500 }
    )
  }
}