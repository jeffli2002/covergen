import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/bestauth/db-wrapper'

export const dynamic = 'force-dynamic'

/**
 * Debug endpoint to check subscription status directly from database
 * Use this to verify if webhooks are updating the database
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    if (!userId && !email) {
      return NextResponse.json({ 
        error: 'Provide userId or email as query param',
        example: '/api/debug/check-subscription?email=994235892@qq.com'
      }, { status: 400 })
    }

    let subscription = null
    let user = null

    // Find by email first
    if (email) {
      // Use BestAuth users API
      const foundUser = await db.users.findByEmail(email)
      
      if (foundUser) {
        user = foundUser
        subscription = await db.subscriptions.findByUserId(foundUser.id)
      }
    } else if (userId) {
      const foundUser = await db.users.findById(userId)
      user = foundUser || { id: userId }
      subscription = await db.subscriptions.findByUserId(userId)
    }

    if (!subscription) {
      return NextResponse.json({
        found: false,
        user,
        message: 'No subscription found in database',
        suggestion: 'This means webhook has not updated the database yet. Check Creem dashboard for webhook delivery status.'
      })
    }

    // Get subscription status
    const status = await db.subscriptions.getStatus(user.id)

    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        email: user.email || email
      },
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        stripe_subscription_id: subscription.stripe_subscription_id,
        stripe_customer_id: subscription.stripe_customer_id,
        created_at: subscription.created_at,
        updated_at: subscription.updated_at,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        billing_cycle: subscription.billing_cycle,
        cancel_at_period_end: subscription.cancel_at_period_end
      },
      computed_status: status,
      diagnosis: {
        has_stripe_subscription: !!subscription.stripe_subscription_id,
        has_stripe_customer: !!subscription.stripe_customer_id,
        is_active: subscription.status === 'active',
        is_paid_tier: subscription.tier !== 'free',
        last_updated: subscription.updated_at
      }
    })
  } catch (error: any) {
    console.error('[Debug] Error checking subscription:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
