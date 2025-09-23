import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { db } from '@/lib/bestauth/db-wrapper'

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.data.user.id
    
    // Get current subscription data directly from database
    const subscription = await db.subscriptions.get(userId)
    
    // Get subscription status (computed fields)
    const status = await db.subscriptions.getStatus(userId)
    
    return NextResponse.json({
      userId,
      userEmail: session.data.user.email,
      rawSubscription: subscription,
      computedStatus: status,
      debug: {
        hasSubscription: !!subscription,
        tier: subscription?.tier,
        status: subscription?.status,
        stripeSubscriptionId: subscription?.stripe_subscription_id
      }
    })
  } catch (error) {
    console.error('Debug subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription debug info' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.data.user.id
    const body = await request.json()
    
    // Fix subscription tier if provided
    if (body.tier && ['free', 'pro', 'pro_plus'].includes(body.tier)) {
      const updated = await db.subscriptions.update(userId, {
        tier: body.tier,
        status: body.status || 'active'
      })
      
      if (updated) {
        return NextResponse.json({
          success: true,
          message: `Subscription tier updated to ${body.tier}`,
          subscription: updated
        })
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid tier provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Fix subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to fix subscription' },
      { status: 500 }
    )
  }
}