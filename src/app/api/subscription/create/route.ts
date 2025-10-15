import { NextRequest, NextResponse } from 'next/server'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tier, status } = body

    if (!userId || !tier || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const subscription = await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId,
      tier,
      status
    })

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('[CreateSubscription] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

