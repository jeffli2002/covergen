import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client for webhook processing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-creem-signature') || ''
  
  // Verify webhook signature
  if (!creemService.verifyWebhookSignature(body, signature)) {
    console.error('[Webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event
  try {
    event = JSON.parse(body)
  } catch (error) {
    console.error('[Webhook] Invalid JSON:', error)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  console.log('[Webhook] Processing event:', {
    type: event.eventType || event.type,
    id: event.id,
    metadata: event.object?.metadata || event.metadata
  })

  try {
    const result = await creemService.handleWebhookEvent(event)
    
    // Handle checkout completion with trial
    if (result && 'type' in result && result.type === 'checkout_complete' && 'userId' in result && result.userId) {
      const { userId, customerId, subscriptionId, planId, isTrialCheckout, trialDays } = result as any
      
      // Calculate trial dates if applicable
      let trialStart = null
      let trialEnd = null
      let isTrialActive = false
      let currentPeriodStart = new Date()
      let currentPeriodEnd = new Date()
      
      if (isTrialCheckout && trialDays > 0) {
        trialStart = new Date()
        trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + trialDays)
        isTrialActive = true
        
        // During trial, the actual subscription starts after trial ends
        currentPeriodStart = new Date(trialEnd)
        currentPeriodEnd = new Date(trialEnd)
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      } else {
        // Regular subscription without trial
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      }
      
      // Update or create subscription record
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      const subscriptionData = {
        user_id: userId,
        tier: planId,
        status: 'active',
        stripe_customer_id: customerId, // Using stripe fields for Creem data
        stripe_subscription_id: subscriptionId,
        trial_start: trialStart,
        trial_end: trialEnd,
        is_trial_active: isTrialActive,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: false,
        updated_at: new Date()
      }
      
      if (existingSub) {
        await supabaseAdmin
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', existingSub.id)
      } else {
        await supabaseAdmin
          .from('subscriptions')
          .insert(subscriptionData)
      }
      
      console.log('[Webhook] Subscription created/updated:', {
        userId,
        planId,
        isTrialActive,
        trialEnd
      })
    }
    
    // Handle subscription updates (including trial conversions)
    if (result && 'type' in result && result.type === 'subscription_update' && 'customerId' in result && result.customerId) {
      const { customerId, status, planId, currentPeriodEnd } = result as any
      
      // Find subscription by customer ID
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single()
      
      if (subscription) {
        const updateData: any = {
          status: status,
          updated_at: new Date()
        }
        
        // Check if trial is ending
        if (subscription.is_trial_active && subscription.trial_end) {
          const now = new Date()
          const trialEndDate = new Date(subscription.trial_end)
          
          if (now >= trialEndDate) {
            // Trial has ended, convert to paid subscription
            updateData.is_trial_active = false
            updateData.converted_from_trial = true
            updateData.current_period_start = now
            updateData.current_period_end = currentPeriodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            
            console.log('[Webhook] Trial converted to paid subscription:', {
              userId: subscription.user_id,
              planId: subscription.tier
            })
          }
        }
        
        if (currentPeriodEnd) {
          updateData.current_period_end = currentPeriodEnd
        }
        
        if (planId) {
          updateData.tier = planId
        }
        
        await supabaseAdmin
          .from('subscriptions')
          .update(updateData)
          .eq('id', subscription.id)
      }
    }
    
    // Handle subscription cancellation
    if (result.type === 'subscription_deleted' && result.customerId) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancel_at_period_end: true,
          updated_at: new Date()
        })
        .eq('stripe_customer_id', result.customerId)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Also handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Webhook endpoint active' })
}