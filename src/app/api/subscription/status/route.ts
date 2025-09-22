import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import { authConfig } from '@/config/auth.config'

export async function GET(req: NextRequest) {
  // Route to BestAuth if enabled
  if (authConfig.USE_BESTAUTH) {
    const bestAuthModule = await import('@/app/api/bestauth/subscription/status/route')
    return bestAuthModule.GET(req)
  }
  
  // Otherwise use Supabase implementation
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
    const supabase = await createClient()
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions_consolidated')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (subError || !subscription) {
      // No subscription found - user is on free tier
      return NextResponse.json({
        status: 'free',
        plan: 'free',
        isActive: false,
        canUpgrade: true,
        isTrialing: false,
        requiresPaymentSetup: false,
        hasPaymentMethod: false
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
    
    // Check if user has payment method
    const hasPaymentMethod = !!subscription.stripe_subscription_id && !!subscription.stripe_customer_id
    const requiresPaymentSetup = isTrialing && !hasPaymentMethod
    
    // Determine upgrade/downgrade capabilities
    const plan = subscription.tier || subscription.plan_id || 'free'
    const canUpgrade = plan !== 'pro-plus' && plan !== 'pro_plus'
    const canDowngrade = plan !== 'pro'
    
    // Return subscription status
    return NextResponse.json({
      status: subscription.status,
      plan: plan,
      isActive,
      isTrialing,
      trialDaysRemaining,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
      canUpgrade,
      canDowngrade,
      stripeSubscriptionId: subscription.stripe_subscription_id,
      requiresPaymentSetup,
      hasPaymentMethod,
      isManualTrial: requiresPaymentSetup,
      trialEndsAt: subscription.expires_at || subscription.trial_ends_at
    })
  } catch (error) {
    console.error('[Status] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}