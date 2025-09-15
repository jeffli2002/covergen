import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const { subscriptionId } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      )
    }

    // Verify user is authenticated
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Verify user owns this subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Resume subscription via Creem
    const result = await creemService.resumeSubscription(subscriptionId)

    if (!result.success) {
      throw new Error(result.error || 'Failed to resume subscription')
    }

    // Update local database
    const { error: updateError } = await (supabase as any)
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)
    
    if (updateError) {
      console.error('Failed to update subscription in database:', updateError)
    }

    return NextResponse.json({
      success: true,
      subscription: result.subscription
    })
  } catch (error: any) {
    console.error('Resume subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resume subscription' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}