import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'
import { createPointsService } from '@/lib/services/points-service'
import { createClient } from '@/utils/supabase/server'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const pointsService = createPointsService(supabase)
    const balance = await pointsService.getBalance(user.id)

    if (!balance) {
      return NextResponse.json({
        balance: 0,
        lifetime_earned: 0,
        lifetime_spent: 0,
        tier: 'free',
      })
    }

    return NextResponse.json(balance)
  } catch (error) {
    console.error('[Points Balance API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points balance' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
