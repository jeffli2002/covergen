import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { creemService } from '@/services/payment/creem'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'

// Convert trial to paid subscription immediately
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
    
    const { userId, userEmail } = authContext
    
    // Get the subscription from database
    const supabase = await createClient()
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }
    
    // Check if user is on a trial
    if (subscription.status !== 'trialing') {
      return NextResponse.json(
        { 
          error: 'Subscription is not in trial period',
          status: subscription.status 
        },
        { status: 400 }
      )
    }
    
    // If no Stripe subscription ID yet (manual trial), create checkout session
    if (!subscription.stripe_subscription_id) {
      console.log('[Activate] Creating checkout session for manual trial')
      
      const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/account?activated=true`
      const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/account`
      
      const checkoutResult = await creemService.createCheckoutSession({
        userId,
        userEmail: userEmail || '',
        planId: subscription.tier as 'pro' | 'pro_plus',
        successUrl,
        cancelUrl,
        currentPlan: 'free' // Trial is treated as free for upgrade purposes
      })
      
      if (!checkoutResult.success) {
        return NextResponse.json(
          { error: checkoutResult.error || 'Failed to create checkout session' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        checkoutUrl: checkoutResult.url,
        message: 'Redirecting to payment page to activate subscription'
      })
    }
    
    // For Stripe trials, update the trial end to now to start billing immediately
    console.log('[Activate] Converting Stripe trial to active subscription')
    
    const result = await creemService.updateSubscription(
      subscription.stripe_subscription_id,
      {
        trial_end: 'now' // This tells Stripe to end the trial immediately
      }
    )
    
    if (!result.success) {
      console.error('[Activate] Failed to activate subscription:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to activate subscription' },
        { status: 500 }
      )
    }
    
    // Update local subscription record
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (updateError) {
      console.error('[Activate] Error updating subscription:', updateError)
    }
    
    // Clear trial data from auth.users if using legacy system
    const { error: rpcError } = await supabase.rpc('update_user_trial_status', {
      p_user_id: userId,
      p_trial_ends_at: null,
      p_subscription_tier: subscription.tier
    })
    
    if (rpcError && rpcError.code !== '42883') { // Ignore if function doesn't exist
      console.error('[Activate] Error clearing trial status:', rpcError)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Trial converted to paid subscription successfully',
      subscription: {
        tier: subscription.tier,
        status: 'active'
      }
    })
    
  } catch (error) {
    console.error('[Activate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to activate subscription' },
      { status: 500 }
    )
  }
}