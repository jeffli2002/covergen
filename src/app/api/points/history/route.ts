import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'
import { createPointsService } from '@/lib/services/points-service'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const supabase = getBestAuthSupabaseClient()
    if (!supabase) {
      console.error('[Points History API] Service role Supabase client unavailable')
      return NextResponse.json(
        { error: 'Unable to fetch points history' },
        { status: 500 }
      )
    }
    const pointsService = createPointsService(supabase)
    const transactions = await pointsService.getTransactionHistory(user.id, limit, offset)

    return NextResponse.json({
      transactions,
      limit,
      offset,
      count: transactions.length,
    })
  } catch (error) {
    console.error('[Points History API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points history' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
