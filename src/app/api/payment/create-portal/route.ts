import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { validateSessionFromRequest } from '@/lib/bestauth/request-utils'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { authConfig } from '@/config/auth.config'

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const { returnUrl } = await req.json()

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Missing return URL' },
        { status: 400 }
      )
    }

    let userId: string | null = null
    let stripeCustomerId: string | null = null

    if (authConfig.USE_BESTAUTH) {
      // Use BestAuth for authentication
      const session = await validateSessionFromRequest(req)
      
      if (!session.success || !session.data) {
        console.error('[Create Portal] BestAuth validation failed:', session.error)
        return NextResponse.json(
          { error: 'Auth session missing!' },
          { status: 401 }
        )
      }
      
      userId = session.data.user.id
      console.log('[Create Portal] BestAuth user:', session.data.user.email)
      
      // Get user's subscription from BestAuth
      const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
      
      if (!subscription || !subscription.stripe_customer_id) {
        console.error('[Create Portal] No Stripe customer ID found for user:', userId)
        
        // For now, return a helpful message instead of error
        // TODO: Implement proper Stripe customer portal integration
        return NextResponse.json({
          url: null,
          message: 'Billing portal is being set up. Please check back later or contact support.',
          needsSetup: true
        })
      }
      
      stripeCustomerId = subscription.stripe_customer_id
    } else {
      // Fallback to Supabase auth (legacy)
      const authHeader = req.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Import Supabase client only if needed
      const { createClient } = await import('@supabase/supabase-js')
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

      const token = authHeader.substring(7)
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Invalid authentication' },
          { status: 401 }
        )
      }

      // Get user's subscription with customer ID
      const { data: subscription, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      if (subError || !subscription?.stripe_customer_id) {
        return NextResponse.json(
          { error: 'No billing information found' },
          { status: 404 }
        )
      }
      
      stripeCustomerId = subscription.stripe_customer_id
    }

    // Create portal session
    const result = await creemService.createPortalSession({
      customerId: stripeCustomerId!,
      returnUrl
    })

    if (!result.success) {
      console.error('[Create Portal] Portal creation failed:', result.error)
      // For now, return a helpful message for portal integration issues
      return NextResponse.json({
        url: null,
        message: 'Billing management is currently being upgraded. Please contact support for assistance.',
        error: result.error
      })
    }

    return NextResponse.json({
      url: result.url
    })
  } catch (error: any) {
    console.error('Create portal error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
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