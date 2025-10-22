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

// Configuration for checkout sessions
const CHECKOUT_CONFIG = {
  maxAttemptsPerHour: 5,
  sessionExpirationMinutes: 30,
  concurrentCheckMessage: 'You already have an active checkout session. Please complete it or wait for it to expire.',
  rateLimitMessage: 'Too many checkout attempts. Please try again in an hour.'
}

async function handler(req: AuthenticatedRequest) {
  try {
    console.log('Create checkout API called')
    
    // Get user from BestAuth middleware
    const user = req.user!  // withAuth middleware ensures user is not null
    console.log('Authenticated user:', user.email)
    
    // Get the request body
    const body = await req.json()
    console.log('Request body:', body)
    
    const { planId, billingCycle = 'yearly', successUrl, cancelUrl } = body

    if (!planId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Check if user can create checkout session (rate limiting and concurrent session check)
    console.log('Checking checkout session eligibility for user:', user.id)
    
    interface EligibilityResponse {
      allowed: boolean
      reason?: string
      active_session_id?: string
      attempts_remaining?: number
    }
    
    const { data: eligibility, error: eligibilityError } = await supabaseAdmin
      .rpc('can_create_checkout_session', {
        p_user_id: user.id,
        p_max_attempts: CHECKOUT_CONFIG.maxAttemptsPerHour,
        p_window_minutes: 60
      })
      .single() as { data: EligibilityResponse | null; error: any }

    if (eligibilityError) {
      console.error('Error checking checkout eligibility:', eligibilityError)
      return NextResponse.json(
        { error: 'Unable to process checkout request at this time' },
        { status: 500 }
      )
    }

    if (!eligibility || !eligibility.allowed) {
      console.warn('Checkout session creation denied:', eligibility?.reason)
      console.warn('User:', user.email, 'Active session:', eligibility?.active_session_id)
      
      // If there's an active session, return it instead of creating a new one
      if (eligibility?.active_session_id) {
        const { data: activeSession } = await supabaseAdmin
          .from('checkout_sessions')
          .select('session_id, plan_id, expires_at')
          .eq('id', eligibility.active_session_id)
          .single()

        if (activeSession && new Date(activeSession.expires_at) > new Date()) {
          console.log('Returning existing active session:', activeSession.session_id)
          return NextResponse.json({
            sessionId: activeSession.session_id,
            url: `https://app.creem.io/checkout/${activeSession.session_id}`,
            existingSession: true,
            message: 'Using existing checkout session'
          })
        }
      }

      return NextResponse.json(
        { 
          error: eligibility?.reason || 'Checkout session creation not allowed',
          attemptsRemaining: eligibility?.attempts_remaining || 0
        },
        { status: 429 } // Too Many Requests
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
      billingCycle: billingCycle as 'monthly' | 'yearly',
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

    // Record the checkout session in our database
    const sessionMetadata = {
      userEmail: user.email,
      planId: planId,
      currentPlan: subscription?.tier || 'free',
      createdAt: new Date().toISOString()
    }

    const { data: recordedSession, error: recordError } = await supabaseAdmin
      .rpc('record_checkout_session', {
        p_user_id: user.id,
        p_session_id: result.sessionId!,
        p_plan_id: planId,
        p_expires_minutes: CHECKOUT_CONFIG.sessionExpirationMinutes,
        p_metadata: sessionMetadata
      })

    if (recordError) {
      console.error('Error recording checkout session:', recordError)
      // Don't fail the request, just log the error
    } else {
      console.log('Recorded checkout session:', recordedSession)
    }

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