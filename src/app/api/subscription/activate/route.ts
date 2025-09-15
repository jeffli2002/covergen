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
    
    // Check if user has payment method on file
    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No payment method on file. Please add a payment method first.' },
        { status: 400 }
      )
    }
    
    console.log('[Activate] Activating trial subscription for user:', userId)
    
    // For trial activation, we simply convert the trial to active status
    // The subscription is already set up with Stripe, we just need to mark it as active
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
    
    return NextResponse.json({
      success: true,
      activated: true,
      message: `Successfully activated ${subscription.tier === 'pro_plus' ? 'Pro+' : 'Pro'} subscription!`
    })
  } catch (error) {
    console.error('[Activate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to activate subscription' },
      { status: 500 }
    )
  }
}