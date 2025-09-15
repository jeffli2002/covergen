import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { creemService } from '@/services/payment/creem'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'

export async function POST(req: NextRequest) {
  try {
    // Get auth context using PaymentAuthWrapper
    const authContext = await PaymentAuthWrapper.getAuthContext()
    
    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { userId } = authContext
    
    // Get current subscription
    const supabase = await createClient()
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions_consolidated')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }
    
    // Check if user is on trial
    if (subscription.status !== 'trialing') {
      return NextResponse.json(
        { error: 'Not a trial subscription' },
        { status: 400 }
      )
    }
    
    console.log('[Activate] Checking trial activation for user:', userId)
    console.log('[Activate] Subscription details:', {
      hasStripeCustomerId: !!subscription.stripe_customer_id,
      hasStripeSubscriptionId: !!subscription.stripe_subscription_id,
      trialEndsAt: subscription.expires_at
    })
    
    // Check if user has both customer ID and subscription ID (indicates valid payment method)
    if (!subscription.stripe_customer_id || !subscription.stripe_subscription_id) {
      console.log('[Activate] No payment method on file, need to redirect to add payment')
      return NextResponse.json(
        { 
          success: false,
          needsPaymentMethod: true,
          error: 'No payment method on file. Please add a payment method to activate your subscription.' 
        },
        { status: 400 }
      )
    }
    
    // IMPORTANT: Don't update local database directly
    // Creem will handle the trial-to-paid conversion and send webhooks
    
    // Since Creem SDK doesn't support ending trials early yet,
    // we return a success response with information about automatic activation
    const trialEndDate = subscription.expires_at ? new Date(subscription.expires_at) : null
    const daysRemaining = trialEndDate ? Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
    
    return NextResponse.json({
      success: true,
      activated: false, // Not immediately activated
      autoActivates: true,
      trialEndsAt: subscription.expires_at,
      daysRemaining: daysRemaining,
      message: `Your subscription will automatically activate when your trial ends in ${daysRemaining} days. You won't need to take any action!`
    })
  } catch (error) {
    console.error('[Activate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process activation request' },
      { status: 500 }
    )
  }
}