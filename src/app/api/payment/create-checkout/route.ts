import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { createClient } from '@supabase/supabase-js'
import { TrialUpgradeService } from '@/services/payment/trial-upgrade'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'

// Create service role Supabase client for database operations
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

async function handler(req: AuthenticatedRequest) {
  try {
    console.log('Create checkout API called')
    
    // Get user from BestAuth middleware
    const user = req.user
    console.log('Authenticated user:', user.email)
    
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

    // Get current subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Check if this is a trial upgrade
    let isTrialUpgrade = false
    if (subscription && subscription.status === 'trialing') {
      const upgradeCheck = await TrialUpgradeService.canUpgradeDuringTrial({
        userId: user.id,
        fromTier: subscription.tier as 'free' | 'pro' | 'pro_plus',
        toTier: planId as 'pro' | 'pro_plus',
        isTrialActive: true,
        trialEndsAt: subscription.current_period_end ? new Date(subscription.current_period_end) : null
      })

      if (!upgradeCheck.success) {
        return NextResponse.json(
          { error: upgradeCheck.message },
          { status: 400 }
        )
      }

      isTrialUpgrade = !upgradeCheck.shouldCreateNewSubscription

      // If this is an upgrade during trial, update the subscription directly
      if (isTrialUpgrade) {
        const updateResult = await TrialUpgradeService.updateTrialUpgrade(
          user.id,
          planId as 'pro' | 'pro_plus',
          subscription.current_period_end ? new Date(subscription.current_period_end) : null
        )

        if (updateResult.success) {
          // Return success without creating a new checkout session
          return NextResponse.json({
            success: true,
            message: 'Trial upgraded successfully',
            isTrialUpgrade: true
          })
        } else {
          console.error('Failed to update trial:', updateResult.error)
          // Fall back to creating a new subscription
          isTrialUpgrade = false
        }
      }
    }

    // Create checkout session with Creem (only if not a trial upgrade)
    console.log('Creating Creem checkout session:', {
      userId: user.id,
      planId,
      isTrialUpgrade,
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

// Export with auth middleware
export const POST = withAuth(handler)

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