import { NextRequest, NextResponse } from 'next/server'
import { validateSessionFromRequest } from '@/lib/bestauth'

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
    
    // This endpoint is just a debug endpoint to trigger client-side refresh
    // The actual refresh happens client-side via the subscription refresh trigger
    
    return NextResponse.json({
      success: true,
      message: 'Subscription refresh triggered',
      userId: session.data.user.id,
      email: session.data.user.email,
      instruction: 'The client should now refresh subscription data via the subscriptionRefreshTrigger'
    })
  } catch (error) {
    console.error('[Debug Refresh] Error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger refresh' },
      { status: 500 }
    )
  }
}