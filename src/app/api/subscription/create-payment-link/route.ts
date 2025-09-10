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

    // Create payment link using Creem service
    const result = await creemService.createPaymentLink({
      plan: plan as 'pro' | 'pro_plus',
      payment_method: 'creem', // Default to creem
      userId: authContext.userId,
      customerEmail: authContext.userEmail || '',
      customerName: authContext.userEmail?.split('@')[0] || '',
      metadata: {
        user_id: authContext.userId,
        plan: plan,
        email: authContext.userEmail || ''
      }
    })

    if (!result.success || !result.payment_link) {
      console.error('[CreatePaymentLink] Failed to create payment link:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to create payment link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payment_link: result.payment_link,
      expires_at: result.expires_at,
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
