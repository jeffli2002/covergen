import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { createClient } from '@supabase/supabase-js'

// Create service role Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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

    // Verify user is authenticated
    const authHeader = req.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('Token extracted:', token.substring(0, 20) + '...')
    
    // Verify the token and get user
    console.log('[DEBUG] Attempting to verify token with supabaseAdmin.auth.getUser')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    console.log('[DEBUG] Auth verification result:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: authError?.message,
      errorCode: authError?.code,
      errorStatus: authError?.status
    })
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      console.error('User data:', user)
      
      // TEMPORARY DEBUG BYPASS - Remove after fixing auth issue
      if (process.env.PAYMENT_DEBUG_MODE === 'true') {
        console.error('[DEBUG] PAYMENT_DEBUG_MODE enabled - bypassing auth check')
        // Try to extract user info from JWT token manually for debugging
        try {
          const [header, payload] = token.split('.')
          const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString())
          console.log('[DEBUG] Decoded JWT payload:', decodedPayload)
          
          // Create a mock user object for testing
          const mockUser = {
            id: decodedPayload.sub,
            email: decodedPayload.email || 'debug@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: decodedPayload.aud,
            created_at: new Date().toISOString()
          }
          
          console.log('[DEBUG] Using mock user:', mockUser)
          
          // Continue with mock user
          const userForCheckout = mockUser
          
          // Get current subscription
          const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userForCheckout.id)
            .single()

          // Create checkout session with Creem
          console.log('Creating Creem checkout session:', {
            userId: userForCheckout.id,
            planId,
            env: {
              hasApiKey: !!process.env.CREEM_SECRET_KEY,
              hasProPlanId: !!process.env.CREEM_PRO_PLAN_ID,
              hasProPlusPlanId: !!process.env.CREEM_PRO_PLUS_PLAN_ID
            }
          })
          
          const result = await creemService.createCheckoutSession({
            userId: userForCheckout.id,
            userEmail: userForCheckout.email!,
            planId: planId as 'pro' | 'pro_plus',
            successUrl,
            cancelUrl,
            currentPlan: subscription?.tier || 'free'
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
            userId: userForCheckout.id,
            email: userForCheckout.email
          })

          return NextResponse.json({
            sessionId: result.sessionId,
            url: result.url
          })
        } catch (decodeError) {
          console.error('[DEBUG] Failed to decode JWT:', decodeError)
        }
      }
      
      return NextResponse.json(
        { error: authError?.message || 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Get current subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Create checkout session with Creem
    console.log('Creating Creem checkout session:', {
      userId: user.id,
      planId,
      env: {
        hasApiKey: !!process.env.CREEM_SECRET_KEY,
        hasProPlanId: !!process.env.CREEM_PRO_PLAN_ID,
        hasProPlusPlanId: !!process.env.CREEM_PRO_PLUS_PLAN_ID
      }
    })
    
    const result = await creemService.createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      planId: planId as 'pro' | 'pro_plus',
      successUrl,
      cancelUrl,
      currentPlan: subscription?.tier || 'free'
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
      userId: user.id,
      email: user.email
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