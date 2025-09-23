// BestAuth Subscription API - Get subscription details
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

// GET /api/bestauth/subscription - Get current subscription details
export async function GET(request: NextRequest) {
  try {
    const session = await validateSessionFromRequest(request)
    
    if (!session.success || !session.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.data.user.id
    
    // Get subscription with all computed fields
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
    
    if (!subscription) {
      // Create default free subscription if none exists
      await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId,
        tier: 'free',
        status: 'active'
      })
      
      // Try again
      const newSubscription = await bestAuthSubscriptionService.getUserSubscription(userId)
      
      return NextResponse.json({
        success: true,
        subscription: newSubscription
      })
    }
    
    // Get additional data
    const monthlyUsage = await bestAuthSubscriptionService.getUserUsageThisMonth(userId)
    const paymentHistory = await bestAuthSubscriptionService.getPaymentHistory(userId, 5)
    
    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        monthly_usage: monthlyUsage
      },
      payments: paymentHistory
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription details' },
      { status: 500 }
    )
  }
}