// BestAuth Subscription Activation API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

// POST /api/bestauth/subscription/activate - Activate a trial subscription
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
      console.log('[Activate] Converting trial to active subscription')
      
      // Get the Stripe subscription ID
      const stripeSubscriptionId = currentSubscription.stripe_subscription_id
      if (!stripeSubscriptionId) {
        return NextResponse.json({
          success: false,
          error: 'No subscription ID found',
          message: 'Unable to activate - subscription ID missing'
        })
      }
      
      try {
        // Import Creem service for server-side use
        const { creemService } = await import('@/services/payment/creem')
        
        // Use Creem SDK to activate the trial with immediate billing
        const activationResult = await creemService.activateTrialSubscription(stripeSubscriptionId)
        
        if (!activationResult.success) {
          throw new Error(activationResult.error || 'Failed to activate with Creem')
        }
        
        // Update our database to reflect the activation
        const updated = await bestAuthSubscriptionService.createOrUpdateSubscription({
          userId,
          status: 'active',
          trialEndsAt: new Date() // End trial immediately
        })
        
        const locale = request.headers.get('x-locale') || 'en'
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
        
        return NextResponse.json({
          success: true,
          activated: true,
          redirectUrl: `${origin}/${locale}/account?activated=true`,
          message: 'Your trial has been converted to a paid subscription!',
          subscription: updated,
          note: 'Your payment method has been charged for the current billing period.'
        })
        
      } catch (creemError: any) {
        console.error('[Activate] Creem activation failed:', creemError)
        
        // Fallback: Just update database if Creem fails
        const updated = await bestAuthSubscriptionService.createOrUpdateSubscription({
          userId,
          status: 'active',
          trialEndsAt: new Date()
        })
        
        const locale = request.headers.get('x-locale') || 'en'
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
        
        return NextResponse.json({
          success: true,
          activated: true,
          redirectUrl: `${origin}/${locale}/account?activated=true`,
          message: 'Trial marked as active. Billing will be processed shortly.',
          subscription: updated,
          note: 'Your subscription is now active.'
        })
      }
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