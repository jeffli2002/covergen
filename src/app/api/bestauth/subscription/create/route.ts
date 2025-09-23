// BestAuth Subscription Create API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService } from '@/services/payment/creem'
import { getSubscriptionConfig, isTrialEnabled } from '@/lib/subscription-config'

// POST /api/bestauth/subscription/create - Create new subscription (checkout or trial)
export async function POST(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    const userEmail = session.data.user.email
    const body = await request.json()
    const { 
      planId, 
      startTrial = false,
      paymentMethodId = null,
      successUrl,
      cancelUrl 
    } = body
    
    // Validate plan
    if (!planId || !['pro', 'pro_plus'].includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }
    
    // Get current subscription
    const currentSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    // Check if already has active subscription
    if (currentSubscription && currentSubscription.tier !== 'free' && currentSubscription.status === 'active') {
      return NextResponse.json({
        success: false,
        error: 'Already has active subscription',
        message: 'Please cancel or upgrade your current subscription first',
        subscription: currentSubscription
      })
    }
    
    const config = getSubscriptionConfig()
    const trialEnabled = isTrialEnabled()
    
    // Handle trial start request
    if (startTrial && trialEnabled) {
      // Check if user already had a trial
      if (currentSubscription?.metadata?.had_trial) {
        return NextResponse.json({
          success: false,
          error: 'Trial already used',
          message: 'You have already used your free trial',
          requiresPayment: true
        })
      }
      
      // Start trial without payment method
      const trial = await bestAuthSubscriptionService.startTrial(userId, planId, config.trialDays)
      
      return NextResponse.json({
        success: true,
        trial: true,
        message: `Started ${config.trialDays}-day free trial for ${planId === 'pro' ? 'Pro' : 'Pro+'} plan`,
        subscription: trial,
        trialEndsAt: trial.trial_ends_at
      })
    }
    
    // Create checkout session for paid subscription
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
    const locale = request.headers.get('x-locale') || 'en'
    
    const checkoutResult = await creemService.createCheckoutSession({
      userId,
      userEmail,
      planId: planId as 'pro' | 'pro_plus',
      successUrl: successUrl || `${origin}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${origin}/${locale}/payment/cancel`,
      currentPlan: currentSubscription?.tier || 'free'
    })
    
    if (!checkoutResult.success || !checkoutResult.url) {
      throw new Error(checkoutResult.error || 'Failed to create checkout session')
    }
    
    // If payment method was provided, we could process it here
    // For now, we'll redirect to checkout
    
    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutResult.url,
      sessionId: checkoutResult.sessionId,
      message: 'Redirecting to checkout...'
    })
    
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}