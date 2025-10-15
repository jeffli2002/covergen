import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'
import { SUBSCRIPTION_CONFIG } from '@/config/subscription'
import { Creem } from 'creem'

const getCreemApiKey = () => {
  return process.env.CREEM_SECRET_KEY || process.env.CREEM_API_KEY || ''
}

const getCreemTestMode = () => {
  return process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true' || 
         process.env.VERCEL_ENV === 'preview' || 
         process.env.NODE_ENV === 'development'
}

const creem = new Creem({
  serverIdx: getCreemTestMode() ? 1 : 0,
})

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { packId } = body

    if (!packId || typeof packId !== 'string') {
      return NextResponse.json(
        { error: 'packId is required' },
        { status: 400 }
      )
    }

    const pack = SUBSCRIPTION_CONFIG.pointsPacks.find((p) => p.id === packId)

    if (!pack) {
      return NextResponse.json(
        { error: 'Invalid points pack' },
        { status: 400 }
      )
    }

    const CREEM_API_KEY = getCreemApiKey()
    if (!CREEM_API_KEY) {
      throw new Error('Creem API key not configured')
    }

    const productId = process.env[`CREEM_POINTS_PACK_${pack.points}_ID`] || `points_pack_${pack.points}`

    const checkout = await creem.createCheckout({
      xApiKey: CREEM_API_KEY,
      createCheckoutRequest: {
        productId: productId,
        requestId: `points_${user.id}_${Date.now()}`,
        successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/account?purchase=success`,
        metadata: {
          type: 'points_pack',
          pack_id: packId,
          user_id: user.id,
          points: pack.points.toString(),
          bonus_points: pack.bonus.toString(),
        },
        customer: {
          email: user.email,
        },
      },
    })

    return NextResponse.json({
      sessionId: checkout.id,
      url: checkout.checkoutUrl,
    })
  } catch (error) {
    console.error('[Points Purchase API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)
