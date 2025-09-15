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
    
    console.log('[Activate] Trial activation requested but Creem API does not support early trial termination')
    
    // Since Creem SDK doesn't support ending trials early via API,
    // we cannot actually start billing immediately. The billing will start
    // at the original trial end date set by Creem.
    
    // Calculate when billing will actually start
    const trialEndDate = subscription.expires_at || subscription.trial_ends_at
    const billingStartDate = trialEndDate ? new Date(trialEndDate) : null
    const formattedDate = billingStartDate ? billingStartDate.toLocaleDateString() : 'your trial end date'
    
    // We should NOT update the local database as this would create inconsistency
    // with Creem's actual billing status. Instead, we'll wait for Creem's webhook
    // to update our database when the trial actually ends.
    
    console.log('[Activate] Informing user about billing start date:', formattedDate)
    
    return NextResponse.json({
      success: true,
      activated: false, // Not actually activated yet
      billingStartsAt: trialEndDate,
      message: `Thank you for confirming your ${subscription.tier === 'pro_plus' ? 'Pro+' : 'Pro'} subscription! Your payment method is confirmed and billing will automatically begin on ${formattedDate}. No further action needed.`,
      note: 'Due to payment provider limitations, we cannot end trials early. Your full trial period remains available.'
    })
  } catch (error) {
    console.error('[Activate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process activation request' },
      { status: 500 }
    )
  }
}