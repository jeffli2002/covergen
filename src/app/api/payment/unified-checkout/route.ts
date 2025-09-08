/**
 * Session-Aware Unified Checkout API Route
 * Maintains OAuth session continuity throughout payment flow with proper error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { userSessionService } from '@/services/unified/UserSessionService'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  console.log('[API] Session-aware unified checkout request received')
  
  try {
    // Parse request body
    const { planId, successUrl, cancelUrl } = await request.json()
    
    if (!planId || !['pro', 'pro_plus'].includes(planId)) {
      return NextResponse.json({ 
        error: 'Invalid plan ID',
        code: 'INVALID_PLAN'
      }, { status: 400 })
    }

    // Extract and validate auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authorization required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Create Supabase client with service role for server operations
    const supabase = createClient()
    
    // Verify session and get user with enhanced error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('[API] Auth verification failed:', authError)
      return NextResponse.json({ 
        error: 'Invalid or expired session',
        code: 'SESSION_INVALID',
        requiresReauth: true
      }, { status: 401 })
    }

    // Check if token is near expiry (within 5 minutes)
    if (isTokenNearExpiry(token)) {
      console.warn('[API] Token near expiry for user:', user.email)
      return NextResponse.json({
        error: 'Session expires soon, please refresh',
        code: 'SESSION_EXPIRING',
        requiresRefresh: true
      }, { status: 401 })
    }

    console.log('[API] Authenticated user verified:', {
      email: user.email,
      id: user.id,
      provider: user.app_metadata?.provider
    })

    // Get existing customer mapping to preserve context
    const existingMapping = await getExistingCustomerMapping(supabase, user.id)
    
    // Determine current subscription tier
    const currentTier = existingMapping?.subscription_tier || 'free'
    console.log('[API] Current subscription tier:', currentTier)

    // Create checkout session using the server-side Creem service
    const { creemService, CREEM_PRODUCTS } = await import('@/services/payment/creem')
    
    // Debug log environment and product IDs
    console.log('[API] Creem Product Configuration:', {
      planId,
      CREEM_PRODUCTS,
      envVars: {
        CREEM_PRO_PLAN_ID: process.env.CREEM_PRO_PLAN_ID,
        CREEM_PRO_PLUS_PLAN_ID: process.env.CREEM_PRO_PLUS_PLAN_ID,
      },
      resolvedProductId: CREEM_PRODUCTS[planId as keyof typeof CREEM_PRODUCTS]
    })
    
    const checkoutResult = await creemService.createCheckoutSession({
      userId: user.id,
      userEmail: user.email || '',
      planId: planId as 'pro' | 'pro_plus',
      successUrl: successUrl || `${request.nextUrl.origin}/payment/success?plan=${planId}&session=${user.id}`,
      cancelUrl: cancelUrl || `${request.nextUrl.origin}/payment/cancel?plan=${planId}`,
      currentPlan: currentTier
    })

    if (!checkoutResult.success) {
      console.error('[API] Checkout creation failed:', checkoutResult.error)
      return NextResponse.json({ 
        error: checkoutResult.error || 'Failed to create checkout session',
        code: 'CHECKOUT_FAILED'
      }, { status: 500 })
    }

    console.log('[API] Checkout session created:', {
      sessionId: checkoutResult.sessionId,
      hasUrl: !!checkoutResult.url
    })

    // Create or update customer mapping with session context preservation
    const sessionContext = {
      checkout_session_id: checkoutResult.sessionId,
      access_token_prefix: token.substring(0, 10),
      created_at: new Date().toISOString(),
      request_origin: request.nextUrl.origin,
      user_agent: request.headers.get('user-agent') || '',
      intended_tier: planId,
      current_tier: currentTier
    }

    const { data: mappingResult, error: mappingError } = await supabase.rpc(
      'upsert_customer_mapping',
      {
        p_user_id: user.id,
        p_email: user.email,
        p_creem_customer_id: existingMapping?.creem_customer_id || `pending_${user.id}_${Date.now()}`,
        p_creem_subscription_id: existingMapping?.creem_subscription_id || null,
        p_subscription_tier: planId,
        p_subscription_status: 'incomplete',
        p_provider: user.app_metadata?.provider || 'google',
        p_session_context: sessionContext
      }
    )

    if (mappingError) {
      console.error('[API] Customer mapping error:', mappingError)
      // This is critical for session continuity, so we should warn but not fail
      console.warn('[API] Continuing with checkout despite mapping error')
    } else {
      console.log('[API] Customer mapping updated successfully:', mappingResult)
    }

    // Log successful checkout initiation for monitoring
    console.log('[API] Checkout session ready:', {
      userId: user.id,
      email: user.email,
      planId,
      sessionId: checkoutResult.sessionId,
      mappingId: mappingResult
    })

    return NextResponse.json({
      success: true,
      sessionId: checkoutResult.sessionId,
      url: checkoutResult.url,
      context: {
        userId: user.id,
        planId,
        currentTier
      }
    })

  } catch (error: any) {
    console.error('[API] Checkout error:', error)
    
    // Categorize errors for better client handling
    const errorCode = categorizeError(error)
    const statusCode = getStatusCodeForError(errorCode)

    return NextResponse.json({ 
      error: 'Checkout session creation failed',
      code: errorCode,
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: statusCode })
  }
}

/**
 * Check if token is near expiry (within 5 minutes)
 */
function isTokenNearExpiry(token: string): boolean {
  try {
    // Decode JWT token to check expiry
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiryTime = payload.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    return (expiryTime - currentTime) < fiveMinutes
  } catch (error) {
    console.error('[API] Token expiry check failed:', error)
    return true // Assume expiry if we can't parse
  }
}

/**
 * Get existing customer mapping for session continuity
 */
async function getExistingCustomerMapping(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('customer_mapping')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[API] Error fetching customer mapping:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('[API] Customer mapping query failed:', error)
    return null
  }
}

/**
 * Categorize errors for better client handling
 */
function categorizeError(error: any): string {
  const message = error.message?.toLowerCase() || ''
  
  if (message.includes('authentication') || message.includes('unauthorized')) {
    return 'AUTH_ERROR'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'NETWORK_ERROR'
  }
  if (message.includes('creem') || message.includes('payment')) {
    return 'PAYMENT_SERVICE_ERROR'
  }
  if (message.includes('database') || message.includes('supabase')) {
    return 'DATABASE_ERROR'
  }
  
  return 'INTERNAL_ERROR'
}

/**
 * Get appropriate HTTP status code for error category
 */
function getStatusCodeForError(errorCode: string): number {
  switch (errorCode) {
    case 'AUTH_ERROR':
      return 401
    case 'NETWORK_ERROR':
      return 502
    case 'PAYMENT_SERVICE_ERROR':
      return 503
    case 'DATABASE_ERROR':
      return 500
    default:
      return 500
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Unified checkout endpoint - POST only' 
  }, { status: 405 })
}