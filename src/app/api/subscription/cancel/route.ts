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
    
    const { userId, userEmail } = authContext
    
    // Get the subscription from database
    const supabase = createClient()
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }
    
    // Check if already cancelled
    if (subscription.cancel_at_period_end) {
      return NextResponse.json(
        { 
          message: 'Subscription is already scheduled for cancellation',
          cancelAt: subscription.current_period_end 
        },
        { status: 200 }
      )
    }
    
    // Check if user is on a trial
    const isTrialing = subscription.status === 'trialing'
    
    // Cancel the subscription at period end with Creem
    const result = await creemService.cancelSubscription(
      subscription.stripe_subscription_id,
      true // Always cancel at period end
    )
    
    if (!result.success) {
      console.error('[Cancel] Failed to cancel subscription:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to cancel subscription' },
        { status: 500 }
      )
    }
    
    // Update local subscription record
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (updateError) {
      console.error('[Cancel] Error updating subscription:', updateError)
    }
    
    // Return success with cancellation details
    return NextResponse.json({
      success: true,
      message: isTrialing 
        ? 'Trial cancelled. You will not be charged when the trial ends.'
        : 'Subscription cancelled. You will continue to have access until the end of your current billing period.',
      cancelAt: subscription.current_period_end,
      isTrialing
    })
  } catch (error) {
    console.error('[Cancel] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
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
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }
    
    // Check if subscription is set to cancel
    if (!subscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      )
    }
    
    // Resume the subscription with Creem
    const result = await creemService.resumeSubscription(
      subscription.stripe_subscription_id
    )
    
    if (!result.success) {
      console.error('[Resume] Failed to resume subscription:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to resume subscription' },
        { status: 500 }
      )
    }
    
    // Update local subscription record
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (updateError) {
      console.error('[Resume] Error updating subscription:', updateError)
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully'
    })
  } catch (error) {
    console.error('[Resume] Error:', error)
    return NextResponse.json(
      { error: 'Failed to resume subscription' },
      { status: 500 }
    )
  }
}