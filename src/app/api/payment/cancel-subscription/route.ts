import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { createClient } from '@supabase/supabase-js'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'

// Create service role Supabase client for database operations
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

async function handler(req: AuthenticatedRequest) {
  try {
    // Get user from BestAuth middleware
    const user = req.user!  // withAuth middleware ensures user is not null
    
    // Get the request body
    const { subscriptionId, cancelAtPeriodEnd = true } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
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

    // Cancel subscription via Creem
    const result = await creemService.cancelSubscription(subscriptionId, cancelAtPeriodEnd)

    if (!result.success) {
      throw new Error(result.error || 'Failed to cancel subscription')
    }

    // Update local database
    await supabaseAdmin
      .from('subscriptions')
      .update({
        cancel_at_period_end: cancelAtPeriodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    return NextResponse.json({
      success: true,
      subscription: result.subscription
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
// Export with auth middleware
export const POST = withAuth(handler)

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