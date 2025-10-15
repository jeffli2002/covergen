import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'

export async function GET(request: NextRequest) {
  try {
    // Check if userId is provided in query params (for internal API calls)
    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get('userId')
    
    let userId: string
    
    if (queryUserId) {
      // Use the provided userId
      userId = queryUserId
    } else {
      // Get auth context from headers
      const authContext = await PaymentAuthWrapper.getAuthContext()
      
      if (!authContext.isAuthenticated || !authContext.userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      userId = authContext.userId
    }

    // Import the service dynamically to avoid client-side imports
    const { bestAuthSubscriptionService } = await import('@/services/bestauth/BestAuthSubscriptionService')
    const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)

    if (!subscription) {
      // If no subscription found, return a default free subscription
      return NextResponse.json({
        user_id: userId,
        tier: 'free',
        status: 'active',
        can_generate: true,
        usage_today: 0,
        daily_limit: 3,
        monthly_limit: 10
      })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('[GetSubscription] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

