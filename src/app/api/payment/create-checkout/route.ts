import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { getUserSubscription } from '@/services/payment/database-helper'

export async function POST(req: NextRequest) {
  try {
    console.log('Create checkout API called')
    
    // Verify environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    // Get the request body
    const body = await req.json()
    console.log('Request body:', body)
    
    const { planId, successUrl, cancelUrl } = body

    if (!planId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Extract auth token from request
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Get the authenticated user from the token
    const { getUserFromRequest } = await import('@/lib/supabase-server')
    const { user, error } = await getUserFromRequest(req)
    
    console.log('[DEBUG] Auth validation result:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error
    })
    
    if (error || !user || !user.id || !user.email) {
      console.error('Auth validation failed:', error)
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }
    
    const userId = user.id
    const email = user.email

    // Get current subscription using the database helper (no new clients)
    const subscription = await getUserSubscription(userId)
    const currentPlan = subscription?.tier || 'free'

    // Create checkout session with Creem
    console.log('Creating Creem checkout session:', {
      userId,
      planId,
      env: {
        hasApiKey: !!process.env.CREEM_SECRET_KEY,
        hasProPlanId: !!process.env.CREEM_PRO_PLAN_ID,
        hasProPlusPlanId: !!process.env.CREEM_PRO_PLUS_PLAN_ID
      }
    })
    
    const result = await creemService.createCheckoutSession({
      userId,
      userEmail: email,
      planId: planId as 'pro' | 'pro_plus',
      successUrl,
      cancelUrl,
      currentPlan
    })

    console.log('Creem checkout result:', {
      success: result.success,
      hasUrl: !!result.url,
      url: result.url?.substring(0, 50) + '...',
      error: result.error
    })

    if (!result.success) {
      console.error('Creem checkout error:', result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    console.log('Created Creem checkout session:', {
      sessionId: result.sessionId,
      planId,
      userId,
      email
    })

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url
    })
  } catch (error: any) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}