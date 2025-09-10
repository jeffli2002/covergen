import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'

export async function GET(request: NextRequest) {
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
    const supabase = createClient()
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', authContext.userId)
      .single()

    if (error || !subscription) {
      // If no subscription found, return a default free subscription
      return NextResponse.json({
        subscription: {
          user_id: authContext.userId,
          plan: 'free',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: null,
          cancel_at_period_end: false,
          stripe_customer_id: null,
          stripe_subscription_id: null
        }
      })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('[GetSubscription] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

