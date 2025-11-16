import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'
import { db } from '@/lib/bestauth/db-wrapper'

// Configuration for checkout sessions
const CHECKOUT_CONFIG = {
  maxAttemptsPerHour: 5,
  sessionExpirationMinutes: 30,
  concurrentCheckMessage: 'You already have an active checkout session. Please complete it or wait for it to expire.',
  rateLimitMessage: 'Too many checkout attempts. Please try again in an hour.'
}

async function handler(req: AuthenticatedRequest) {
  try {
    console.log('[BestAuth] Create checkout API called')
    
    // Get user from BestAuth middleware
    const user = req.user!  // withAuth middleware ensures user is not null
    console.log('[BestAuth] Authenticated user:', user.email)
    
    // Get the request body
    const body = await req.json()
    console.log('[BestAuth] Request body:', body)
    
    const { planId, successUrl, cancelUrl } = body
    const billingCycle = body.billingCycle || body.billing || 'monthly'

    if (!planId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // For BestAuth, we'll skip the complex rate limiting for now
    // TODO: Implement BestAuth checkout session tracking
    
    // Get current subscription from BestAuth
    const subscription = await db.subscriptions.findByUserId(user.id)
    console.log('[BestAuth] Current subscription:', subscription)

    // PREVENT DUPLICATE SUBSCRIPTION: Check if user is trying to buy the same plan
    if (subscription && subscription.tier !== 'free' && subscription.status === 'active') {
      // Extract billing cycle from body or URL params
      const billingCycle = body.billingCycle || body.billing || 'monthly'
      
      // Check if trying to purchase the exact same plan + billing cycle
      if (subscription.tier === planId && subscription.billing_cycle === billingCycle) {
        console.warn('[BestAuth] ⚠️ Duplicate subscription attempt prevented:', {
          userId: user.id,
          currentPlan: subscription.tier,
          currentBillingCycle: subscription.billing_cycle,
          attemptedPlan: planId,
          attemptedBillingCycle: billingCycle
        })
        return NextResponse.json(
          { 
            error: 'You already have an active subscription for this plan',
            details: `You are already subscribed to ${planId} ${billingCycle}. To change your plan, please use the upgrade option.`,
            currentPlan: subscription.tier,
            currentBillingCycle: subscription.billing_cycle
          },
          { status: 400 }
        )
      }
      
      // POLICY: Allow tier UPGRADES with any billing cycle change
      // Block only: DOWNGRADES with billing cycle change
      const isTierChange = subscription.tier !== planId
      const isBillingCycleChange = subscription.billing_cycle !== billingCycle
      const isTierUpgrade = 
        (subscription.tier === 'free' && ['pro', 'pro_plus'].includes(planId)) ||
        (subscription.tier === 'pro' && planId === 'pro_plus')
      const isTierDowngrade = 
        (subscription.tier === 'pro' && planId === 'free') ||
        (subscription.tier === 'pro_plus' && ['pro', 'free'].includes(planId))
      
      // Block: Downgrade + billing cycle change simultaneously
      if (isTierDowngrade && isBillingCycleChange) {
        console.warn('[BestAuth] Downgrade with billing cycle change blocked:', {
          userId: user.id,
          currentPlan: subscription.tier,
          currentBillingCycle: subscription.billing_cycle,
          attemptedPlan: planId,
          attemptedBillingCycle: billingCycle
        })
        return NextResponse.json(
          { 
            error: 'Cannot downgrade and change billing cycle at once',
            details: `Please downgrade first (${subscription.tier} → ${planId}), then change billing cycle if needed.`,
            currentPlan: subscription.tier,
            currentBillingCycle: subscription.billing_cycle,
            suggestion: 'Please contact support for downgrades.'
          },
          { status: 400 }
        )
      }
      
      // Warn if attempting to downgrade (not supported via checkout)
      if (subscription.tier === 'pro_plus' && planId === 'pro') {
        console.warn('[BestAuth] Downgrade attempt via checkout:', {
          userId: user.id,
          currentPlan: subscription.tier,
          attemptedPlan: planId
        })
        return NextResponse.json(
          { 
            error: 'Downgrade not supported via checkout',
            details: 'Please contact support to downgrade your plan.',
            currentPlan: subscription.tier
          },
          { status: 400 }
        )
      }
    }

    // Create checkout session with Creem
    console.log('[BestAuth] Creating Creem checkout session:', {
      userId: user.id,
      planId,
      env: {
        hasApiKey: !!process.env.CREEM_SECRET_KEY,
        hasProPlanId: !!process.env.CREEM_PRO_PLAN_ID,
        hasProPlusPlanId: !!process.env.CREEM_PRO_PLUS_PLAN_ID
      }
    })
    
    const result = await creemService.createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      planId: planId as 'pro' | 'pro_plus',
      billingCycle,
      successUrl,
      cancelUrl,
      currentPlan: subscription?.tier || 'free'
    })

    console.log('[BestAuth] Creem checkout result:', {
      success: result.success,
      hasUrl: !!result.url,
      url: result.url?.substring(0, 50) + '...',
      error: result.error
    })

    if (!result.success) {
      console.error('[BestAuth] Creem checkout error:', result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    console.log('[BestAuth] Created Creem checkout session:', {
      sessionId: result.sessionId,
      planId,
      userId: user.id,
      email: user.email
    })

    // TODO: Record checkout session in BestAuth tables
    // For now, we'll just return the session

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url
    })
  } catch (error: any) {
    console.error('[BestAuth] Create checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// Export with auth middleware
export const POST = withAuth(handler)

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}