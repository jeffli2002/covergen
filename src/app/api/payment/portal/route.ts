/**
 * Session-Aware Customer Portal API Route
 * Validates OAuth session and customer mapping before providing portal access
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { creemService } from '@/services/payment/creem'

export async function POST(request: NextRequest) {
  console.log('[API] Session-aware customer portal request received')
  
  try {
    // Parse request body
    const { returnUrl } = await request.json()

    if (!returnUrl) {
      return NextResponse.json({
        error: 'Missing return URL',
        code: 'MISSING_RETURN_URL'
      }, { status: 400 })
    }

    // Extract and validate auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'Authorization required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Create a simple admin client for server operations
    // This avoids conflicts with the browser's OAuth session client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    )
    
    // Verify session and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('[API] Auth verification failed:', authError)
      return NextResponse.json({
        error: 'Invalid or expired session',
        code: 'SESSION_INVALID',
        requiresReauth: true
      }, { status: 401 })
    }

    // Check if token is near expiry
    if (isTokenNearExpiry(token)) {
      console.warn('[API] Token near expiry for portal access:', user.email)
      return NextResponse.json({
        error: 'Session expires soon, please refresh',
        code: 'SESSION_EXPIRING',
        requiresRefresh: true
      }, { status: 401 })
    }

    console.log('[API] Authenticated user for portal access:', {
      email: user.email,
      id: user.id
    })

    // Get customer mapping with session context validation
    const customerMapping = await getCustomerMappingWithValidation(supabase, user.id)
    
    if (!customerMapping.isValid || !customerMapping.data) {
      console.error('[API] Customer mapping validation failed:', customerMapping.error)
      return NextResponse.json({
        error: customerMapping.error || 'No billing information found',
        code: 'NO_CUSTOMER_MAPPING',
        details: 'Please complete a payment first to access customer portal'
      }, { status: 404 })
    }

    const { creem_customer_id: customerId, subscription_status, email } = customerMapping.data

    // Validate customer has active or past subscription
    if (!['active', 'trialing', 'past_due', 'canceled'].includes(subscription_status)) {
      return NextResponse.json({
        error: 'No subscription found for portal access',
        code: 'NO_SUBSCRIPTION'
      }, { status: 403 })
    }

    console.log('[API] Customer validation successful:', {
      customerId,
      subscriptionStatus: subscription_status,
      email
    })

    // Create portal session with enhanced context
    const portalResult = await creemService.createPortalSession({
      customerId,
      returnUrl: `${returnUrl}?portal_return=true&user_id=${user.id}`
    })

    if (!portalResult.success) {
      console.error('[API] Portal session creation failed:', portalResult.error)
      return NextResponse.json({
        error: portalResult.error || 'Failed to create customer portal session',
        code: 'PORTAL_CREATION_FAILED'
      }, { status: 500 })
    }

    // Log portal access for security monitoring
    await logPortalAccess(supabase, user.id, customerId, request)

    console.log('[API] Customer portal session created successfully:', {
      userId: user.id,
      customerId,
      hasPortalUrl: !!portalResult.url
    })

    return NextResponse.json({
      success: true,
      url: portalResult.url,
      context: {
        userId: user.id,
        customerId,
        subscriptionStatus: subscription_status
      }
    })

  } catch (error: any) {
    console.error('[API] Customer portal error:', error)
    
    const errorCode = categorizePortalError(error)
    const statusCode = getStatusCodeForError(errorCode)

    return NextResponse.json({
      error: 'Customer portal access failed',
      code: errorCode,
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: statusCode })
  }
}

/**
 * Get customer mapping with comprehensive validation
 */
async function getCustomerMappingWithValidation(supabase: any, userId: string) {
  try {
    // Query customer mapping with related subscription data
    const { data: mapping, error } = await supabase
      .from('customer_mapping')
      .select(`
        *,
        subscriptions:subscriptions!customer_mapping_id(
          status,
          stripe_subscription_id,
          current_period_end
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return {
          isValid: false,
          error: 'No customer mapping found. Please complete a payment first.'
        }
      }
      return {
        isValid: false,
        error: `Database error: ${error.message}`
      }
    }

    // Validate customer ID exists and is not temporary
    if (!mapping.creem_customer_id || mapping.creem_customer_id.startsWith('pending_') || mapping.creem_customer_id.startsWith('temp_')) {
      return {
        isValid: false,
        error: 'Customer mapping is incomplete. Please complete a payment first.'
      }
    }

    // Additional validation for subscription status
    const hasValidStatus = ['active', 'trialing', 'past_due', 'canceled'].includes(mapping.subscription_status)
    if (!hasValidStatus) {
      return {
        isValid: false,
        error: 'No valid subscription found for portal access.'
      }
    }

    return {
      isValid: true,
      data: mapping
    }
  } catch (error: any) {
    return {
      isValid: false,
      error: `Validation error: ${error.message}`
    }
  }
}

/**
 * Log portal access for security monitoring
 */
async function logPortalAccess(supabase: any, userId: string, customerId: string, request: NextRequest) {
  try {
    const logData = {
      user_id: userId,
      customer_id: customerId,
      action: 'portal_access',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || '',
      timestamp: new Date().toISOString()
    }

    // Store in audit log table if it exists, otherwise just log to console
    console.log('[API] Portal access logged:', logData)
    
    // Optional: Store in database audit log
    // await supabase.from('audit_logs').insert([logData])
    
  } catch (error) {
    console.error('[API] Failed to log portal access:', error)
    // Don't fail the request if logging fails
  }
}

/**
 * Check if token is near expiry (within 5 minutes)
 */
function isTokenNearExpiry(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiryTime = payload.exp * 1000
    const currentTime = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    return (expiryTime - currentTime) < fiveMinutes
  } catch (error) {
    console.error('[API] Token expiry check failed:', error)
    return true
  }
}

/**
 * Categorize portal-specific errors
 */
function categorizePortalError(error: any): string {
  const message = error.message?.toLowerCase() || ''
  
  if (message.includes('authentication') || message.includes('unauthorized')) {
    return 'AUTH_ERROR'
  }
  if (message.includes('customer') || message.includes('mapping')) {
    return 'CUSTOMER_ERROR'
  }
  if (message.includes('subscription')) {
    return 'SUBSCRIPTION_ERROR'
  }
  if (message.includes('portal')) {
    return 'PORTAL_ERROR'
  }
  if (message.includes('creem') || message.includes('payment')) {
    return 'PAYMENT_SERVICE_ERROR'
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
    case 'CUSTOMER_ERROR':
    case 'SUBSCRIPTION_ERROR':
      return 404
    case 'PORTAL_ERROR':
    case 'PAYMENT_SERVICE_ERROR':
      return 503
    default:
      return 500
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Customer portal endpoint - POST only' 
  }, { status: 405 })
}