// BestAuth Usage Tracking API
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

// GET /api/bestauth/subscription/usage - Get usage data
export async function GET(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    
    // Get usage data
    const [usageToday, usageThisMonth, subscription] = await Promise.all([
      bestAuthSubscriptionService.getUserUsageToday(userId),
      bestAuthSubscriptionService.getUserUsageThisMonth(userId),
      bestAuthSubscriptionService.getUserSubscription(userId)
    ])
    
    const limits = subscription ? {
      daily: subscription.daily_limit,
      monthly: subscription.monthly_limit
    } : {
      daily: 3,
      monthly: 90
    }
    
    return NextResponse.json({
      usage: {
        today: usageToday,
        thisMonth: usageThisMonth
      },
      limits,
      canGenerate: usageToday < limits.daily && usageThisMonth < limits.monthly,
      subscription: {
        tier: subscription?.tier || 'free',
        status: subscription?.status || 'active',
        isTrialing: subscription?.is_trialing || false
      }
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { error: 'Failed to get usage data' },
      { status: 500 }
    )
  }
}

// POST /api/bestauth/subscription/usage - Increment usage
export async function POST(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    const { amount = 1 } = await request.json()
    
    // Check if user can generate first
    const canGenerate = await bestAuthSubscriptionService.canUserGenerate(userId)
    
    if (!canGenerate) {
      const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          limits: {
            daily: subscription?.daily_limit || 3,
            monthly: subscription?.monthly_limit || 90
          },
          usage: {
            today: subscription?.usage_today || 0
          }
        },
        { status: 429 }
      )
    }
    
    // Increment usage
    const result = await bestAuthSubscriptionService.incrementUsage(userId, amount)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to increment usage' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      newCount: result.newCount
    })
  } catch (error) {
    console.error('Usage increment error:', error)
    return NextResponse.json(
      { error: 'Failed to update usage' },
      { status: 500 }
    )
  }
}