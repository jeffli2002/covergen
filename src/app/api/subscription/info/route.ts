import { NextRequest, NextResponse } from 'next/server'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import { createClient } from '@/lib/supabase/server'
import { getSubscriptionPlans, getPlanByType } from '@/lib/subscription-plans'

export async function GET(req: NextRequest) {
  try {
    // Get auth context
    const authContext = await PaymentAuthWrapper.getAuthContext()
    
    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get subscription from database
    const supabase = await createClient()
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', authContext.userId)
      .single()

    if (error || !subscription) {
      // Return default free subscription if none exists
      return NextResponse.json({
        tier: 'free',
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false,
        stripe_subscription_id: null
      })
    }

    // Map subscription data to expected format
    const subscriptionInfo = {
      tier: subscription.stripe_price_id?.includes('pro_plus') ? 'pro_plus' : 
            subscription.stripe_price_id?.includes('pro') ? 'pro' : 'free',
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      stripe_subscription_id: subscription.stripe_subscription_id
    }

    return NextResponse.json(subscriptionInfo)

  } catch (error) {
    console.error('[GetSubscriptionInfo] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription info' },
      { status: 500 }
    )
  }
}