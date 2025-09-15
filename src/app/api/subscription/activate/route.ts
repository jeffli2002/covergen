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
    
    console.log('[Activate] Proceeding with immediate trial activation')
    
    // Since Creem SDK doesn't support ending trials early via API,
    // we'll update our local database to reflect immediate activation.
    // The actual billing will still start when Creem processes it.
    const { error: updateError } = await supabase
      .from('subscriptions_consolidated')
      .update({
        status: 'active',
        trial_ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (updateError) {
      console.error('[Activate] Error updating subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to activate subscription' },
        { status: 500 }
      )
    }
    
    // Clear trial info from auth.users
    const { error: rpcError } = await supabase.rpc('update_user_trial_status', {
      p_user_id: userId,
      p_trial_ends_at: null,
      p_subscription_tier: subscription.tier
    })
    
    if (rpcError) {
      console.error('[Activate] Error clearing trial status:', rpcError)
    }
    
    console.log('[Activate] Successfully activated subscription for user:', userId)
    
    return NextResponse.json({
      success: true,
      activated: true,
      autoActivates: false,
      message: `Your ${subscription.tier === 'pro_plus' ? 'Pro+' : 'Pro'} subscription is now active! Billing will begin shortly.`
    })
  } catch (error) {
    console.error('[Activate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process activation request' },
      { status: 500 }
    )
  }
}