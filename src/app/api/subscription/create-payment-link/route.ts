import { NextRequest, NextResponse } from 'next/server'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import { creemService } from '@/services/payment/creem'
import { getSubscriptionPlans, getPlanByType, PlanType } from '@/lib/subscription-plans'

export async function POST(req: NextRequest) {
  try {
    // Get auth context
    const authContext = await PaymentAuthWrapper.getAuthContext()
    
    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { plan } = body

    // Validate plan
    if (!plan || !['pro', 'pro_plus'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "pro" or "pro_plus"' },
        { status: 400 }
      )
    }

    // Get plan details
    const planDetails = getPlanByType(plan as PlanType)
    if (!planDetails) {
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 400 }
      )
    }

    // Create checkout session using Creem service
    const result = await creemService.createCheckoutSession({
      userId: authContext.userId,
      userEmail: authContext.userEmail || '',
      planId: plan as 'pro' | 'pro_plus',
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`
    })

    if (!result.success || !result.url) {
      console.error('[CreatePaymentLink] Failed to create checkout session:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payment_link: result.url,
      sessionId: result.sessionId,
      plan: planDetails
    })

  } catch (error) {
    console.error('[CreatePaymentLink] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    )
  }
}
