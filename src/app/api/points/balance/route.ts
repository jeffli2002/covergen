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
    
    // Gracefully handle points table not existing yet
    try {
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
    } catch (pointsError: any) {
      console.warn('[Points Balance API] Points table may not exist yet:', pointsError.message)
      // Return default balance if points system not set up
      return NextResponse.json({
        balance: 0,
        lifetime_earned: 0,
        lifetime_spent: 0,
        tier: 'free',
      })
    }
  } catch (error) {
    console.error('[Points Balance API] Error:', error)
    // Return default balance instead of error to prevent UI blocking
    return NextResponse.json({
      balance: 0,
      lifetime_earned: 0,
      lifetime_spent: 0,
      tier: 'free',
    })
  }
}

export const GET = withAuth(handler)
