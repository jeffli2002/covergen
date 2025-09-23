// BestAuth Update Payment Method API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { creemService } from '@/services/payment/creem'

// POST /api/bestauth/subscription/update-payment - Update payment method
export async function POST(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    const userEmail = session.data.user.email
    
    // Get current subscription
    const currentSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    // Check if user has a Stripe customer ID
    const stripeCustomerId = currentSubscription.stripe_customer_id
    
    if (!stripeCustomerId) {
      return NextResponse.json({
        success: false,
        error: 'No payment account found',
        message: 'Please create a subscription first'
      })
    }
    
    try {
      // Create a portal session for payment method update
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
      const locale = request.headers.get('x-locale') || 'en'
      const returnUrl = `${origin}/${locale}/account`
      
      const portalResult = await creemService.createPortalSession({
        customerId: stripeCustomerId,
        returnUrl: returnUrl
      })
      
      if (!portalResult.success || !portalResult.url) {
        throw new Error(portalResult.error || 'Failed to create portal session')
      }
      
      return NextResponse.json({
        success: true,
        portalUrl: portalResult.url,
        message: 'Redirecting to payment portal...'
      })
      
    } catch (portalError: any) {
      console.error('[Update Payment] Portal creation failed:', portalError)
      
      // Fallback: Create checkout session for adding payment method
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
      const locale = request.headers.get('x-locale') || 'en'
      
      // If user is on a paid plan, create a setup session
      if (currentSubscription.tier !== 'free') {
        return NextResponse.json({
          success: false,
          error: 'Payment method update temporarily unavailable',
          message: 'Please contact support to update your payment method',
          supportEmail: 'support@covergen.pro'
        })
      }
      
      // For free users, direct to upgrade flow
      return NextResponse.json({
        success: false,
        needsUpgrade: true,
        message: 'Please upgrade to a paid plan to add a payment method'
      })
    }
  } catch (error) {
    console.error('Update payment error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    )
  }
}

// GET /api/bestauth/subscription/update-payment - Check payment method status
export async function GET(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    
    // Get current subscription
    const currentSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!currentSubscription) {
      return NextResponse.json({
        success: true,
        hasPaymentMethod: false,
        requiresPaymentMethod: false
      })
    }
    
    return NextResponse.json({
      success: true,
      hasPaymentMethod: currentSubscription.has_payment_method,
      requiresPaymentMethod: currentSubscription.requires_payment_setup,
      tier: currentSubscription.tier,
      status: currentSubscription.status
    })
  } catch (error) {
    console.error('Check payment method error:', error)
    return NextResponse.json(
      { error: 'Failed to check payment method' },
      { status: 500 }
    )
  }
}