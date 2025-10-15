import { NextRequest, NextResponse } from 'next/server'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const usage = await bestAuthSubscriptionService.getUserUsageToday(userId)
    return NextResponse.json({ usage })
  } catch (error) {
    console.error('[GetUsageToday] Error:', error)
    return NextResponse.json(
      { usage: 0 },
      { status: 200 }
    )
  }
}

