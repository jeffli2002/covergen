import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { createClient } from '@supabase/supabase-js'

// Create service role Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const { subscriptionId, newPlanId } = await req.json()

    if (!subscriptionId || !newPlanId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate plan ID
    if (newPlanId !== 'pro' && newPlanId !== 'pro_plus') {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
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
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Verify user owns this subscription
    const { data: subscription } = await supabaseAdmin
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

    // Check if it's actually an upgrade
    const currentTier = subscription.tier
    if (currentTier === 'pro_plus' && newPlanId === 'pro') {
      return NextResponse.json(
        { error: 'Cannot downgrade subscription. Please cancel and resubscribe.' },
        { status: 400 }
      )
    }

    if (currentTier === newPlanId) {
      return NextResponse.json(
        { error: 'Already on this plan' },
        { status: 400 }
      )
    }

    // Upgrade subscription via Creem
    const result = await creemService.upgradeSubscription(subscriptionId, newPlanId)

    if (!result.success) {
      throw new Error(result.error || 'Failed to upgrade subscription')
    }

    // Update local database
    const planLimits = {
      pro: 120,
      pro_plus: 300
    }

    await supabaseAdmin
      .from('subscriptions')
      .update({
        tier: newPlanId,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: newPlanId,
        quota_limit: planLimits[newPlanId as keyof typeof planLimits],
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      subscription: result.subscription
    })
  } catch (error: any) {
    console.error('Upgrade subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upgrade subscription' },
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