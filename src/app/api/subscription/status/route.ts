import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'

export async function GET(req: NextRequest) {
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
    
    // Get the subscription from database
    const supabase = createClient()
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (subError || !subscription) {
      // No subscription found - user is on free tier
      return NextResponse.json({
        status: 'free',
        plan: 'free',
        isActive: false,
        canUpgrade: true
      })
    }
    
    // Determine if subscription is active
    const isActive = ['trialing', 'active'].includes(subscription.status)
    const isTrialing = subscription.status === 'trialing'
    
    // Calculate days remaining for trial
    let trialDaysRemaining = null
    if (isTrialing && subscription.trial_end) {
      const trialEndDate = new Date(subscription.trial_end)
      const now = new Date()
      const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      trialDaysRemaining = daysRemaining
    }
    
    // Return subscription status
    return NextResponse.json({
      status: subscription.status,
      plan: subscription.plan_id,
      isActive,
      isTrialing,
      trialDaysRemaining,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
      canUpgrade: subscription.plan_id !== 'pro-plus',
      canDowngrade: subscription.plan_id !== 'pro',
      stripeSubscriptionId: subscription.stripe_subscription_id
    })
  } catch (error) {
    console.error('[Status] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}