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