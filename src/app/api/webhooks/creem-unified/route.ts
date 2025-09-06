/**
 * Session-Aware Unified Creem Webhook Handler
 * Processes payment webhooks while maintaining user session context and validating against customer mappings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { creemService } from '@/services/payment/creem'
import { userSessionService } from '@/services/unified/UserSessionService'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const webhookId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  console.log(`[Webhook:${webhookId}] Session-aware unified Creem webhook received`)
  
  try {
    // Extract request details for security logging
    const body = await request.text()
    const signature = request.headers.get('creem-signature') || ''
    const userAgent = request.headers.get('user-agent') || ''
    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    console.log(`[Webhook:${webhookId}] Request details:`, {
      bodyLength: body.length,
      hasSignature: !!signature,
      userAgent,
      forwardedFor
    })

    // Enhanced webhook signature verification with timing attack protection
    const isValid = creemService.verifyWebhookSignature(body, signature)
    if (!isValid) {
      console.error(`[Webhook:${webhookId}] Invalid signature verification failed`)
      return NextResponse.json({ 
        error: 'Unauthorized webhook request',
        webhookId 
      }, { status: 401 })
    }

    const webhookData = JSON.parse(body)
    const eventType = webhookData.eventType || webhookData.type
    const eventId = webhookData.id
    const customerId = webhookData.data?.object?.customer || webhookData.object?.customer
    const subscriptionId = webhookData.data?.object?.id || webhookData.object?.id
    
    console.log(`[Webhook:${webhookId}] Processing event:`, {
      type: eventType,
      id: eventId,
      customerId,
      subscriptionId,
      hasMetadata: !!(webhookData.data?.object?.metadata || webhookData.object?.metadata)
    })

    // Create server-side Supabase client with service role
    const supabase = createClient()
    
    // Pre-validate customer mapping exists and is consistent
    const customerValidation = await validateCustomerMapping(supabase, customerId, webhookId)
    if (!customerValidation.isValid) {
      console.error(`[Webhook:${webhookId}] Customer validation failed:`, customerValidation.error)
      return NextResponse.json({ 
        error: 'Customer mapping validation failed',
        details: customerValidation.error,
        webhookId 
      }, { status: 400 })
    }

    // Process webhook using enhanced database function with session context
    const { data: result, error: dbError } = await supabase.rpc('handle_subscription_webhook', {
      p_webhook_data: webhookData
    })

    if (dbError) {
      console.error(`[Webhook:${webhookId}] Database processing error:`, dbError)
      return NextResponse.json({ 
        error: 'Database processing failed',
        code: 'DATABASE_ERROR',
        webhookId 
      }, { status: 500 })
    }

    if (!result?.success) {
      console.error(`[Webhook:${webhookId}] Webhook processing failed:`, result)
      return NextResponse.json({ 
        error: 'Webhook processing failed',
        code: 'PROCESSING_FAILED',
        details: result,
        webhookId 
      }, { status: 400 })
    }

    console.log(`[Webhook:${webhookId}] Database processing successful:`, {
      userId: result.user_id,
      customerId: result.customer_id,
      subscriptionId: result.subscription_id,
      eventType: result.event_type,
      mappingId: result.mapping_id
    })

    // Enhanced service notification with session context validation
    if (result.user_id) {
      try {
        // Validate that the user session context still exists and is valid
        const sessionValidation = await validateUserSessionContext(supabase, result.user_id, webhookId)
        
        const subscriptionUpdate = {
          type: mapEventType(result.event_type),
          userId: result.user_id,
          customerId: result.customer_id,
          subscriptionId: result.subscription_id,
          tier: extractTierFromWebhook(webhookData),
          status: webhookData.data?.object?.status || 'active',
          trialEndsAt: extractTrialEndFromWebhook(webhookData)
        }
        
        await userSessionService.handleSubscriptionUpdate(subscriptionUpdate)
        
        console.log(`[Webhook:${webhookId}] Service notification successful:`, {
          userId: result.user_id,
          sessionValid: sessionValidation.isValid,
          updateType: subscriptionUpdate.type
        })
        
      } catch (serviceError: any) {
        console.error(`[Webhook:${webhookId}] Service notification error:`, serviceError)
        // Log the error but don't fail the webhook - payment processing should continue
        console.warn(`[Webhook:${webhookId}] Continuing webhook processing despite service notification failure`)
      }
    }

    // Enhanced success logging with processing time
    const processingTime = Date.now() - startTime
    console.log(`[Webhook:${webhookId}] Processing completed successfully:`, {
      eventType,
      userId: result.user_id,
      processingTimeMs: processingTime,
      mappingId: result.mapping_id
    })

    return NextResponse.json({ 
      success: true,
      processed: result,
      webhookId,
      processingTimeMs: processingTime
    })

  } catch (error: any) {
    const processingTime = Date.now() - startTime
    console.error(`[Webhook:${webhookId}] Processing error:`, {
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime
    })
    
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      code: 'INTERNAL_ERROR',
      message: error.message,
      webhookId,
      processingTimeMs: processingTime
    }, { status: 500 })
  }
}

/**
 * Validate customer mapping exists and is consistent
 */
async function validateCustomerMapping(supabase: any, customerId: string, webhookId: string) {
  try {
    if (!customerId) {
      return {
        isValid: false,
        error: 'Missing customer ID in webhook data'
      }
    }

    const { data: mapping, error } = await supabase
      .from('customer_mapping')
      .select('user_id, email, subscription_status, created_from_session_id')
      .eq('creem_customer_id', customerId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return {
          isValid: false,
          error: `No customer mapping found for customer ID: ${customerId}`
        }
      }
      return {
        isValid: false,
        error: `Database error: ${error.message}`
      }
    }

    console.log(`[Webhook:${webhookId}] Customer mapping validated:`, {
      customerId,
      userId: mapping.user_id,
      email: mapping.email,
      hasSessionId: !!mapping.created_from_session_id
    })

    return {
      isValid: true,
      mapping
    }
  } catch (error: any) {
    return {
      isValid: false,
      error: `Validation error: ${error.message}`
    }
  }
}

/**
 * Validate user session context for real-time state sync
 */
async function validateUserSessionContext(supabase: any, userId: string, webhookId: string) {
  try {
    // Check if user profile exists and is recent
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('id', userId)
      .single()

    const isValid = !!profile && !error
    
    console.log(`[Webhook:${webhookId}] User session context validation:`, {
      userId,
      profileExists: !!profile,
      lastUpdated: profile?.updated_at,
      isValid
    })

    return { isValid, profile }
  } catch (error: any) {
    console.error(`[Webhook:${webhookId}] Session validation error:`, error)
    return { isValid: false, error: error.message }
  }
}

/**
 * Extract trial end date from webhook data with multiple fallbacks
 */
function extractTrialEndFromWebhook(webhookData: any): Date | undefined {
  const trialEnd = webhookData.data?.object?.trial_end || 
                   webhookData.object?.trial_end ||
                   webhookData.data?.object?.current_period_end ||
                   webhookData.object?.current_period_end

  if (!trialEnd) return undefined

  // Handle both timestamp and ISO string formats
  if (typeof trialEnd === 'number') {
    return new Date(trialEnd * 1000)
  }
  
  if (typeof trialEnd === 'string') {
    return new Date(trialEnd)
  }

  return undefined
}

/**
 * Map Creem webhook event types to our internal types
 */
function mapEventType(eventType: string): 'subscription_created' | 'subscription_updated' | 'subscription_canceled' | 'payment_succeeded' | 'payment_failed' {
  switch (eventType) {
    case 'checkout.completed':
      return 'subscription_created'
    case 'subscription.active':
    case 'subscription.update':
    case 'subscription.paid':
      return 'subscription_updated'
    case 'subscription.canceled':
    case 'subscription.expired':
      return 'subscription_canceled'
    case 'subscription.paid':
      return 'payment_succeeded'
    case 'payment.failed':
      return 'payment_failed'
    default:
      return 'subscription_updated'
  }
}

/**
 * Extract subscription tier from webhook data
 */
function extractTierFromWebhook(webhookData: any): 'pro' | 'pro_plus' {
  const product = webhookData.data?.object?.product || ''
  const metadata = webhookData.data?.object?.metadata || {}
  
  // Check metadata first (most reliable)
  if (metadata.planId) {
    return metadata.planId === 'pro_plus' ? 'pro_plus' : 'pro'
  }
  
  // Fallback to product ID pattern matching
  if (product.includes('pro_plus') || product.includes('proplus')) {
    return 'pro_plus'
  }
  
  return 'pro' // Default to pro
}

// Support only POST method
export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint - POST only' }, { status: 405 })
}