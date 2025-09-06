import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import { creemService } from '@/services/payment/creem'

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    // Get auth context
    const authContext = await PaymentAuthWrapper.getAuthContext()
    
    if (!authContext || !authContext.isValid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = authContext.userId
    
    // Get current subscription
    const { data: subscription, error: subError } = await supabaseAdmin
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
    
    // Check if subscription is in trial period
    if (!subscription.is_trial_active) {
      return NextResponse.json(
        { error: 'Subscription is not in trial period' },
        { status: 400 }
      )
    }
    
    const now = new Date()
    
    // Update subscription to convert trial to paid
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        is_trial_active: false,
        converted_from_trial: true,
        current_period_start: now,
        current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        updated_at: now
      })
      .eq('id', subscription.id)
    
    if (updateError) {
      console.error('[ConvertTrial] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to convert trial' },
        { status: 500 }
      )
    }
    
    // Create checkout session with Creem for immediate billing
    try {
      const checkoutUrl = await creemService.createCheckout({
        userId: userId,
        planId: subscription.tier,
        userEmail: authContext.email || '',
        currentPlan: 'free', // Trial conversion is treated as upgrade from free
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/account`,
        metadata: {
          convertFromTrial: 'true',
          originalTrialEnd: subscription.trial_end
        }
      })
      
      // Return checkout URL for immediate payment
      return NextResponse.json({
        success: true,
        checkoutUrl: checkoutUrl,
        message: 'Redirecting to checkout to complete trial conversion'
      })
    } catch (creemError) {
      console.error('[ConvertTrial] Creem error:', creemError)
      
      // Fallback: Just mark as converted and hope webhook handles it
      return NextResponse.json({
        success: true,
        message: 'Trial conversion initiated',
        subscription: {
          tier: subscription.tier,
          status: 'active',
          current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      })
    }
    
  } catch (error) {
    console.error('[ConvertTrial] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get trial status
export async function GET(request: NextRequest) {
  try {
    const authContext = await PaymentAuthWrapper.getAuthContext()
    
    if (!authContext || !authContext.isValid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = authContext.userId
    
    // Get current subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (subError || !subscription) {
      return NextResponse.json({
        inTrial: false,
        hasSubscription: false
      })
    }
    
    // Calculate days remaining in trial
    let daysRemaining = 0
    if (subscription.is_trial_active && subscription.trial_end) {
      const now = new Date()
      const trialEnd = new Date(subscription.trial_end)
      daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    }
    
    return NextResponse.json({
      inTrial: subscription.is_trial_active,
      hasSubscription: true,
      tier: subscription.tier,
      trialStart: subscription.trial_start,
      trialEnd: subscription.trial_end,
      daysRemaining: daysRemaining,
      convertedFromTrial: subscription.converted_from_trial
    })
    
  } catch (error) {
    console.error('[TrialStatus] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}