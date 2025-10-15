import { NextRequest, NextResponse } from 'next/server'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const result = await bestAuthSubscriptionService.incrementUsage(userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[IncrementUsage] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to increment usage' },
      { status: 500 }
    )
  }
}

