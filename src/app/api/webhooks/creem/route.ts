import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { creemService, WebhookEvent } from '@/services/payment/creem'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { db } from '@/lib/bestauth/db-wrapper'
import { getSubscriptionConfig, calculateTrialEndDate } from '@/lib/subscription-config'
import { createPointsService } from '@/lib/services/points-service'
import { createClient } from '@/utils/supabase/server'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'
import { userSyncService } from '@/services/sync/UserSyncService'

// Disable body parsing to get raw body for signature verification
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type UserResolutionSource = 'payload' | 'email' | 'mapping' | 'sync'

interface ResolvedUser {
  userId: string
  source: UserResolutionSource
  supabaseUserId?: string | null
}

async function resolveUserId(possibleUserId?: string | null, email?: string | null): Promise<ResolvedUser | null> {
  const adminClient = getBestAuthSupabaseClient()

  // Step 1: trust payload when it already matches a BestAuth user
  if (possibleUserId) {
    try {
      const bestAuthUser = await db.users.findById(possibleUserId)
      if (bestAuthUser) {
        return { userId: bestAuthUser.id, source: 'payload' }
      }
    } catch (error) {
      console.error('[BestAuth Webhook] Error checking BestAuth user id from payload:', error)
    }
  }

  // Step 2: if payload looks like a Supabase user id, map/sync it into BestAuth
  if (possibleUserId && adminClient) {
    const mappedUser = await resolveSupabaseUserId(possibleUserId, adminClient, email)
    if (mappedUser) {
      return mappedUser
    }
  }

  // Step 3: resolve by email using existing BestAuth records
  if (email) {
    try {
      const bestAuthByEmail = await db.users.findByEmail(email)
      if (bestAuthByEmail) {
        let supabaseUserIdForMapping: string | null = null

        if (adminClient) {
          try {
            const { data: existingMapping, error: mappingError } = await adminClient
              .from('user_id_mapping')
              .select('supabase_user_id')
              .eq('bestauth_user_id', bestAuthByEmail.id)
              .maybeSingle()

            if (mappingError && mappingError.code !== 'PGRST116') {
              console.error('[BestAuth Webhook] Error checking mapping for BestAuth user resolved by email:', mappingError)
            }

            if (existingMapping?.supabase_user_id) {
              supabaseUserIdForMapping = existingMapping.supabase_user_id
            }
          } catch (mappingLookupError) {
            console.error('[BestAuth Webhook] Exception checking mapping for BestAuth user resolved by email:', mappingLookupError)
          }

          if (!supabaseUserIdForMapping) {
            const supabaseCandidates = await findSupabaseUserIdsByEmail(email, adminClient)
            supabaseUserIdForMapping = supabaseCandidates[0] || null
          }

          if (supabaseUserIdForMapping) {
            await ensureUserMappingExists(supabaseUserIdForMapping, bestAuthByEmail.id)
          }
        }

        return { userId: bestAuthByEmail.id, source: 'email', supabaseUserId: supabaseUserIdForMapping }
      }
    } catch (error) {
      console.error('[BestAuth Webhook] Error looking up BestAuth user by email:', error)
    }
  }

  // Step 4: resolve by Supabase email and create mapping as needed
  if (email && adminClient) {
    const supabaseUserIds = await findSupabaseUserIdsByEmail(email, adminClient)
    for (const supabaseUserId of supabaseUserIds) {
      const mappedUser = await resolveSupabaseUserId(supabaseUserId, adminClient, email)
      if (mappedUser) {
        return mappedUser.source === 'payload'
          ? { userId: mappedUser.userId, source: 'email', supabaseUserId: mappedUser.supabaseUserId }
          : mappedUser
      }
    }
  }

  console.error('[BestAuth Webhook] Unable to resolve user from webhook payload', {
    possibleUserId,
    email
  })

  return null
}

async function resolveSupabaseUserId(supabaseUserId: string, adminClient: SupabaseClient | null, email?: string | null): Promise<ResolvedUser | null> {
  if (!supabaseUserId) {
    return null
  }

  try {
    const existingMapping = await userSyncService.getUserMapping(supabaseUserId)
    if (existingMapping) {
      console.log(`[BestAuth Webhook] Found BestAuth user ${existingMapping} mapped to Supabase user ${supabaseUserId}`)
      return { userId: existingMapping, source: 'mapping', supabaseUserId }
    }
  } catch (error) {
    console.error('[BestAuth Webhook] Error retrieving Supabase→BestAuth user mapping:', error)
  }

  // Check if BestAuth already has this Supabase user mapped via supabase_id column
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('bestauth_users')
        .select('id')
        .eq('supabase_id', supabaseUserId)
        .maybeSingle()

      if (data?.id) {
        console.log(`[BestAuth Webhook] Found BestAuth user ${data.id} via supabase_id lookup for Supabase user ${supabaseUserId}`)
        await ensureUserMappingExists(supabaseUserId, data.id)
        return { userId: data.id, source: 'mapping', supabaseUserId }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('[BestAuth Webhook] Error querying bestauth_users by supabase_id:', error)
      }
    } catch (error) {
      console.error('[BestAuth Webhook] Exception querying bestauth_users by supabase_id:', error)
    }
  }

  // Ensure Supabase user exists before attempting to sync or create
  let supabaseUser: any | null = null

  if (adminClient) {
    try {
      const { data, error } = await adminClient.auth.admin.getUserById(supabaseUserId)
      if (error?.status === 404 || !data?.user) {
        console.warn(`[BestAuth Webhook] Supabase user ${supabaseUserId} not found while resolving webhook user`)
        return null
      }
      supabaseUser = data.user
    } catch (error) {
      console.error('[BestAuth Webhook] Error fetching Supabase user while resolving webhook user:', error)
    }
  }

  try {
    const syncResult = await userSyncService.syncUser(supabaseUserId)
    if (syncResult.success && syncResult.userId) {
      console.log(`[BestAuth Webhook] Synced Supabase user ${supabaseUserId} -> BestAuth user ${syncResult.userId}`)
      return { userId: syncResult.userId, source: 'sync', supabaseUserId }
    }
    console.error('[BestAuth Webhook] Failed to sync Supabase user into BestAuth:', syncResult.error)
  } catch (error) {
    console.error('[BestAuth Webhook] Exception while syncing Supabase user into BestAuth:', error)
  }

  // Final fallback: create a BestAuth user directly from Supabase profile data
  if (adminClient && email) {
    const createdUserId = await createBestAuthUserFromSupabase(adminClient, supabaseUserId, email, supabaseUser)
    if (createdUserId) {
      return { userId: createdUserId, source: 'sync', supabaseUserId }
    }
  }

  return null
}

async function findSupabaseUserIdsByEmail(email: string, adminClient: SupabaseClient | null): Promise<string[]> {
  if (!adminClient) {
    return []
  }

  const normalizedEmail = email.toLowerCase()
  const perPage = 200
  const maxPages = 5
  const matchedIds: string[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
      if (error) {
        console.error('[BestAuth Webhook] Error listing Supabase users while resolving email:', error)
        break
      }

      const users = data?.users || []
      for (const user of users) {
        if (user.email?.toLowerCase() === normalizedEmail) {
          matchedIds.push(user.id)
        }
      }

      if (users.length < perPage) {
        break
      }
    } catch (error) {
      console.error('[BestAuth Webhook] Exception while listing Supabase users for email resolution:', error)
      break
    }
  }

  if (!matchedIds.length) {
    console.warn(`[BestAuth Webhook] No Supabase auth users found for email ${email}`)
  }

  return matchedIds
}

async function ensureUserMappingExists(supabaseUserId: string, bestAuthUserId: string) {
  try {
    const existing = await userSyncService.getUserMapping(supabaseUserId)
    if (existing && existing !== bestAuthUserId) {
      console.warn(`[BestAuth Webhook] Supabase user ${supabaseUserId} already mapped to BestAuth user ${existing}, keeping existing mapping`)
      return
    }

    if (!existing) {
      await userSyncService.createUserMapping(supabaseUserId, bestAuthUserId)
      console.log(`[BestAuth Webhook] Created user mapping ${supabaseUserId} -> ${bestAuthUserId}`)
    }
  } catch (error) {
    console.error('[BestAuth Webhook] Error ensuring user mapping exists:', error)
  }
}

async function createBestAuthUserFromSupabase(
  adminClient: SupabaseClient,
  supabaseUserId: string,
  email: string,
  supabaseUser?: any
): Promise<string | null> {
  const profile = supabaseUser || null

  const basePayload: Record<string, any> = {
    email,
    supabase_id: supabaseUserId,
    email_verified: !!profile?.email_confirmed_at,
    name: profile?.user_metadata?.full_name || profile?.user_metadata?.name || null,
    avatar_url: profile?.user_metadata?.avatar_url || profile?.user_metadata?.picture || null,
    metadata: {
      ...(profile?.user_metadata || {}),
      source: 'creem-webhook',
      synced_at: new Date().toISOString()
    }
  }

  try {
    const { data, error } = await adminClient
      .from('bestauth_users')
      .insert(basePayload)
      .select('id')
      .single()

    if (data?.id) {
      await ensureUserMappingExists(supabaseUserId, data.id)
      console.log(`[BestAuth Webhook] Created new BestAuth user ${data.id} for Supabase user ${supabaseUserId}`)
      return data.id
    }

    if (error && error.code !== '23505') {
      console.error('[BestAuth Webhook] Error inserting BestAuth user from Supabase profile:', error)
      return null
    }
  } catch (error) {
    console.error('[BestAuth Webhook] Exception inserting BestAuth user from Supabase profile:', error)
  }

  // If insert failed due to duplicate constraint, try to reuse existing record by email
  try {
    const { data: existing, error: fetchError } = await adminClient
      .from('bestauth_users')
      .select('id, supabase_id')
      .eq('email', email)
      .maybeSingle()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[BestAuth Webhook] Error fetching existing BestAuth user after insert conflict:', fetchError)
    }

    if (existing?.id) {
      if (!existing.supabase_id) {
        const { error: updateError } = await adminClient
          .from('bestauth_users')
          .update({ supabase_id: supabaseUserId })
          .eq('id', existing.id)

        if (updateError) {
          console.error('[BestAuth Webhook] Failed to backfill supabase_id on existing BestAuth user:', updateError)
        }
      }

      await ensureUserMappingExists(supabaseUserId, existing.id)
      console.log(`[BestAuth Webhook] Reused existing BestAuth user ${existing.id} for Supabase user ${supabaseUserId}`)
      return existing.id
    }
  } catch (error) {
    console.error('[BestAuth Webhook] Exception reusing existing BestAuth user after insert conflict:', error)
  }

  console.error('[BestAuth Webhook] Unable to create or reuse BestAuth user for Supabase user', {
    supabaseUserId,
    email
  })

  return null
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text()
    const signature =
      req.headers.get('creem-signature') ||
      req.headers.get('x-creem-signature') ||
      ''

    console.log('[BestAuth Webhook] === WEBHOOK REQUEST START ===')
    console.log('[BestAuth Webhook] Timestamp:', new Date().toISOString())
    console.log('[BestAuth Webhook] Headers:', {
      'creem-signature': req.headers.get('creem-signature') ? 'present' : 'missing',
      'x-creem-signature': req.headers.get('x-creem-signature') ? 'present' : 'missing',
      'content-type': req.headers.get('content-type'),
      'user-agent': req.headers.get('user-agent')
    })

    // Verify webhook signature
    if (process.env.CREEM_WEBHOOK_SECRET) {
      console.log('[BestAuth Webhook] Using secret prefix:', process.env.CREEM_WEBHOOK_SECRET.slice(0, 6), 'len:', process.env.CREEM_WEBHOOK_SECRET.length)
      console.log('[BestAuth Webhook] Raw request for signature check:', rawBody)
      const verification = creemService.verifyWebhookSignature(rawBody, signature)
      if (!verification.valid) {
        console.error('[BestAuth Webhook] Invalid webhook signature')
        console.error('Expected header: creem-signature')
        console.error('Received signature:', signature ? 'present' : 'missing')
        console.error('[BestAuth Webhook] Signature mismatch details:', {
          signaturePreview: signature ? signature.substring(0, 32) + '...' : 'none',
          payloadSha256: crypto.createHash('sha256').update(rawBody).digest('hex'),
          reason: verification.reason,
          normalizedSignature: verification.normalizedSignature?.substring(0, 64),
          expectedHexPreview: verification.expectedHex?.substring(0, 32),
          providedHexPreview: verification.providedHex?.substring(0, 32)
        })
        const debugInfo = {
          error: 'Invalid signature',
          reason: verification.reason,
          signature: verification.rawSignature,
          normalizedSignature: verification.normalizedSignature,
          expectedHexPreview: verification.expectedHex?.substring(0, 64),
          providedHexPreview: verification.providedHex?.substring(0, 64)
        }
        return NextResponse.json(debugInfo, { status: 401 })
      }
      console.log('[BestAuth Webhook] Signature verified successfully')
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[BestAuth Webhook] CREEM_WEBHOOK_SECRET not configured - webhook verification disabled')
    }

    // Parse the webhook event
    const event = JSON.parse(rawBody)
    const eventType = event.eventType || event.type
    console.log(`[BestAuth Webhook] Received event: ${eventType}`, event.id)
    console.log('[BestAuth Webhook] Full event payload:', JSON.stringify(event, null, 2))

    // Handle the webhook event
    const result = await creemService.handleWebhookEvent(event)

    // Check if result has a type property
    if (!result || typeof result !== 'object' || !('type' in result)) {
      console.log('[BestAuth Webhook] Event processed successfully')
      return NextResponse.json({ received: true })
    }

    // Process the result based on event type
    switch ((result as any).type) {
      case 'checkout_complete':
        await handleCheckoutComplete(result)
        break

      case 'subscription_created':
        await handleSubscriptionCreated(result)
        break

      case 'subscription_update':
        await handleSubscriptionUpdate(result)
        break

      case 'subscription_trial_will_end':
        await handleSubscriptionTrialWillEnd(result)
        break

      case 'subscription_trial_ended':
        await handleSubscriptionTrialEnded(result)
        break

      case 'subscription_deleted':
        await handleSubscriptionDeleted(result)
        break

      case 'payment_success':
        await handlePaymentSuccess(result)
        break

      case 'payment_failed':
        await handlePaymentFailed(result)
        break

      case 'subscription_paused':
        await handleSubscriptionPaused(result)
        break

      case 'refund_created':
        await handleRefundCreated(result)
        break

      case 'one_time_payment_success':
        await handleOneTimePaymentSuccess(result)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const serialized = serializeError(error)
    console.error('[BestAuth Webhook] Error processing webhook:', serialized)
    const message =
      typeof serialized === 'object' && serialized !== null && 'message' in serialized
        ? (serialized as any).message
        : typeof error === 'string'
          ? error
          : 'Unexpected error'
    return NextResponse.json(
      { error: 'Webhook processing failed', message, details: serialized },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(data: any) {
  console.log('[BestAuth Webhook] ===  CHECKOUT COMPLETE HANDLER START ===')
  console.log('[BestAuth Webhook] Raw data received:', JSON.stringify(data, null, 2))
  
  const { userId, customerId, subscriptionId, planId, trialEnd, billingCycle, paymentIntentId, customerEmail } = data

  console.log('[BestAuth Webhook] Extracted checkout complete data:', { 
    userId, 
    customerId, 
    subscriptionId, 
    planId, 
    hasSubscriptionId: !!subscriptionId,
    billingCycle,
    trialEnd,
    hasUserId: !!userId,
    hasPlanId: !!planId,
    customerEmail
  })

  const resolvedUser = await resolveUserId(userId, customerEmail)
  let actualUserId = resolvedUser?.userId || null
  let resolvedSupabaseUserId = resolvedUser?.supabaseUserId || null
  let userResolutionStrategy: UserResolutionSource | 'customer_lookup' | null = resolvedUser?.source || null

  if (!actualUserId && customerId) {
    try {
      const existingSubscription = await db.subscriptions.findByCustomerId(customerId)
      if (existingSubscription?.user_id) {
        actualUserId = existingSubscription.user_id
        userResolutionStrategy = 'customer_lookup'
        console.log(
          `[BestAuth Webhook] Resolved user via existing subscription customerId ${customerId} -> ${actualUserId}`
        )
      }
    } catch (lookupError) {
      console.error('[BestAuth Webhook] Failed to resolve user by customerId lookup:', lookupError)
    }
  }

  if (!resolvedSupabaseUserId && actualUserId) {
    try {
      const adminClient = getBestAuthSupabaseClient()
      if (adminClient) {
        const { data: mapping, error: mappingError } = await adminClient
          .from('user_id_mapping')
          .select('supabase_user_id')
          .eq('bestauth_user_id', actualUserId)
          .maybeSingle()

        if (mappingError && mappingError.code !== 'PGRST116') {
          console.error('[BestAuth Webhook] Error fetching Supabase mapping for resolved user:', mappingError)
        }

        if (mapping?.supabase_user_id) {
          resolvedSupabaseUserId = mapping.supabase_user_id
        }
      }
    } catch (mappingLookupError) {
      console.error('[BestAuth Webhook] Exception determining Supabase user id for resolved user:', mappingLookupError)
    }
  }

  if (!actualUserId || !planId) {
    console.error('[BestAuth Webhook] Missing required data for checkout complete:', { actualUserId, planId, customerEmail, originalUserId: userId })
    throw new Error('Missing required user ID or plan ID')
  }

  try {
    // Get subscription configuration
    const config = getSubscriptionConfig()
    
    // Check if this is a trial subscription
    let isTrialSubscription = false
    let trialEndsAt: string | null = null
    
    if (trialEnd && new Date(trialEnd) > new Date()) {
      isTrialSubscription = true
      trialEndsAt = new Date(trialEnd).toISOString()
      console.log('[BestAuth Webhook] Checkout complete with trial ending at:', trialEndsAt)
    } else if (subscriptionId) {
      console.log('[BestAuth Webhook] Checkout complete without trial info, waiting for subscription.created webhook')
    }

    const cycle = billingCycle || 'monthly'
    
    // Create or update subscription in BestAuth (this will grant points automatically)
    const result = await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: actualUserId,  // Use the verified actual user ID
      tier: planId,
      status: isTrialSubscription ? 'trialing' : 'active',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      trialEndsAt: isTrialSubscription ? new Date(trialEndsAt!) : undefined,
      currentPeriodStart: new Date(),
      currentPeriodEnd: isTrialSubscription ? new Date(trialEndsAt!) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      billingCycle: cycle,
      metadata: {
        checkout_completed_at: new Date().toISOString(),
        initial_plan: planId,
        billing_cycle: cycle,
        original_payload_user_id: userId,  // Preserve original payload id for debugging
        original_userId: userId,
        resolved_supabase_user_id: resolvedSupabaseUserId,
        customer_email: customerEmail,
        user_resolution_strategy: userResolutionStrategy
      }
    })
    
    console.log(`[BestAuth Webhook] Successfully activated ${planId} ${isTrialSubscription ? 'TRIAL' : 'PAID'} subscription for user ${actualUserId}`)
    console.log(`[BestAuth Webhook] Original userId from webhook: ${userId}, Actual userId: ${actualUserId}`)
    console.log(`[BestAuth Webhook] Points granted via subscription creation`)
    if (isTrialSubscription) {
      console.log(`[BestAuth Webhook] Trial ends at: ${trialEndsAt}`)
    }
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleCheckoutComplete:', error)
    throw error
  }
}

async function handleSubscriptionCreated(data: any) {
  const { subscriptionId, customerId, userId, status, planId, trialStart, trialEnd, currentPeriodStart, currentPeriodEnd } = data

  if (!subscriptionId || !customerId) {
    console.error('[BestAuth Webhook] Missing subscription ID or customer ID')
    return
  }

  try {
    // Update subscription with full details
    const subscriptionData: any = {
      userId: userId || customerId, // Fallback to customerId if no userId
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      status: status || 'active',
      tier: planId
    }

    // Add trial dates if this is a trial subscription
    if (status === 'trialing' && trialEnd) {
      subscriptionData.trialEndsAt = trialEnd
      subscriptionData.metadata = {
        trial_started_at: trialStart?.toISOString(),
        trial_period_days: Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    // Add period dates
    if (currentPeriodStart) {
      subscriptionData.currentPeriodStart = currentPeriodStart
    }
    if (currentPeriodEnd) {
      subscriptionData.currentPeriodEnd = currentPeriodEnd
    }

    await bestAuthSubscriptionService.createOrUpdateSubscription(subscriptionData)

    console.log(`[BestAuth Webhook] Created/Updated subscription ${subscriptionId} for customer ${customerId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionCreated:', error)
    throw error
  }
}

async function handleSubscriptionUpdate(data: any) {
  const { customerId, status, userId, planId, currentPeriodEnd, cancelAtPeriodEnd, billingInterval, priceId } = data

  try {
    // Find user by customer ID if userId not provided
    let actualUserId = userId
    let currentSubscription = null
    
    if (!actualUserId && customerId) {
      const subscription = await db.subscriptions.findByCustomerId(customerId)
      if (subscription) {
        actualUserId = subscription.user_id
        currentSubscription = subscription
      }
    } else if (actualUserId) {
      currentSubscription = await db.subscriptions.findByUserId(actualUserId)
    }

    if (!actualUserId) {
      console.error('[BestAuth Webhook] Could not find user for customer:', customerId)
      return
    }

    console.log('[BestAuth Webhook] Processing subscription update:', {
      userId: actualUserId,
      oldTier: currentSubscription?.tier,
      newTier: planId,
      status,
      billingInterval
    })

    // Update subscription status
    const updateData: any = {
      userId: actualUserId,
      status: status,
      currentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: cancelAtPeriodEnd
    }

    // Detect tier change (upgrade/downgrade from Creem webhook)
    if (planId && currentSubscription && planId !== currentSubscription.tier) {
      console.log(`[BestAuth Webhook] Tier change detected: ${currentSubscription.tier} → ${planId}`)
      
      updateData.tier = planId
      updateData.previousTier = currentSubscription.tier
      
      // Add to upgrade history
      const existingHistory = currentSubscription.upgrade_history || []
      const upgradeHistoryEntry = {
        from_tier: currentSubscription.tier,
        to_tier: planId,
        upgraded_at: new Date().toISOString(),
        upgrade_type: 'webhook_sync',
        source: 'creem_webhook'
      }
      updateData.upgradeHistory = [...existingHistory, upgradeHistoryEntry]
    } else if (planId) {
      updateData.tier = planId
    }
    
    // Sync billing cycle from Creem
    if (billingInterval) {
      updateData.billingCycle = billingInterval === 'year' ? 'yearly' : 'monthly'
    }
    
    // Sync Stripe price ID
    if (priceId) {
      updateData.stripePriceId = priceId
    }

    // Handle status transitions
    if (status === 'active' && cancelAtPeriodEnd) {
      // Subscription is active but will cancel at period end
      updateData.metadata = {
        ...updateData.metadata,
        scheduled_cancellation: true
      }
    }

    await bestAuthSubscriptionService.createOrUpdateSubscription(updateData)

    console.log(`[BestAuth Webhook] Updated subscription for user ${actualUserId}`, {
      tier: updateData.tier,
      previousTier: updateData.previousTier,
      billingCycle: updateData.billingCycle
    })
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionUpdate:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(data: any) {
  const { customerId, subscriptionId } = data

  try {
    // Find user by customer ID
    const subscription = await db.subscriptions.findByCustomerId(customerId)
    if (!subscription) {
      console.error('[BestAuth Webhook] Could not find subscription for customer:', customerId)
      return
    }

    // Update subscription to cancelled
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: subscription.user_id,
      status: 'cancelled',
      cancelledAt: new Date()
    })

    console.log(`[BestAuth Webhook] Marked subscription as cancelled for customer ${customerId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionDeleted:', error)
    throw error
  }
}

async function handlePaymentSuccess(data: any) {
  const { paymentIntentId, amount, currency, customerId, invoiceId, currentPeriodStart } = data

  if (!customerId || !amount) {
    console.error('[BestAuth Webhook] Missing payment data')
    return
  }

  try {
    // Find user by customer ID
    const subscription = await db.subscriptions.findByCustomerId(customerId)
    if (!subscription) {
      console.error('[BestAuth Webhook] Could not find subscription for customer:', customerId)
      return
    }

    // Record payment
    await bestAuthSubscriptionService.recordPayment({
      userId: subscription.user_id,
      stripePaymentIntentId: paymentIntentId,
      stripeInvoiceId: invoiceId,
      amount: amount,
      currency: currency || 'usd',
      status: 'succeeded',
      description: `Payment for ${subscription.tier} subscription`
    })

    console.log(`[BestAuth Webhook] Recorded payment of ${amount/100} ${currency} for customer ${customerId}`)
    
    // Check if this is a renewal (not the first payment)
    const isRenewal = subscription.paid_started_at && 
                     subscription.status === 'active' &&
                     currentPeriodStart && 
                     new Date(currentPeriodStart) > new Date(subscription.current_period_start || 0)
    
    if (isRenewal) {
      console.log(`[BestAuth Webhook] Detected renewal for customer ${customerId}`)
      
      // Get existing renewal count from metadata
      const renewalCount = (subscription.metadata?.renewal_count || 0) + 1
      
      // Update subscription with renewal tracking
      await bestAuthSubscriptionService.createOrUpdateSubscription({
        userId: subscription.user_id,
        lastRenewedAt: new Date(),
        metadata: {
          ...subscription.metadata,
          renewal_count: renewalCount,
          last_renewal_amount: amount,
          last_renewal_date: new Date().toISOString()
        }
      })
      
      console.log(`[BestAuth Webhook] Renewal #${renewalCount} tracked for customer ${customerId}`)
    } else {
      console.log(`[BestAuth Webhook] First payment or non-renewal for customer ${customerId}`)
    }
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handlePaymentSuccess:', error)
    throw error
  }
}

async function handlePaymentFailed(data: any) {
  const { paymentIntentId, customerId, error: paymentError } = data

  try {
    // Find user by customer ID
    const subscription = await db.subscriptions.findByCustomerId(customerId)
    if (!subscription) {
      console.error('[BestAuth Webhook] Could not find subscription for customer:', customerId)
      return
    }

    // Update subscription to past_due if payment failed
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: subscription.user_id,
      status: 'past_due',
      metadata: {
        last_payment_error: paymentError,
        last_payment_failed_at: new Date().toISOString()
      }
    })

    console.log(`[BestAuth Webhook] Payment failed for customer ${customerId}, subscription marked as past_due`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handlePaymentFailed:', error)
    throw error
  }
}

async function handleSubscriptionPaused(data: any) {
  const { customerId } = data

  try {
    // Find user by customer ID
    const subscription = await db.subscriptions.findByCustomerId(customerId)
    if (!subscription) {
      console.error('[BestAuth Webhook] Could not find subscription for customer:', customerId)
      return
    }

    // Update subscription status to paused
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: subscription.user_id,
      status: 'paused'
    })

    console.log(`[BestAuth Webhook] Subscription paused for customer ${customerId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionPaused:', error)
    throw error
  }
}

async function handleSubscriptionTrialWillEnd(data: any) {
  const { customerId, trialEnd } = data

  try {
    // Find user by customer ID
    const subscription = await db.subscriptions.findByCustomerId(customerId)
    if (!subscription) {
      console.error('[BestAuth Webhook] Could not find subscription for customer:', customerId)
      return
    }

    // Update metadata with trial ending soon flag
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: subscription.user_id,
      metadata: {
        trial_ending_soon: true,
        trial_end_notification_sent: new Date().toISOString()
      }
    })

    console.log(`[BestAuth Webhook] Trial ending soon notification for customer ${customerId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionTrialWillEnd:', error)
    throw error
  }
}

async function handleSubscriptionTrialEnded(data: any) {
  const { customerId, status } = data

  try {
    // Find user by customer ID
    const subscription = await db.subscriptions.findByCustomerId(customerId)
    if (!subscription) {
      console.error('[BestAuth Webhook] Could not find subscription for customer:', customerId)
      return
    }

    // Update subscription - trial has ended
    await bestAuthSubscriptionService.createOrUpdateSubscription({
      userId: subscription.user_id,
      status: status || 'active', // Usually becomes active if payment method exists
      trialEndsAt: undefined, // Clear trial end date
      metadata: {
        trial_ended_at: new Date().toISOString()
      }
    })

    console.log(`[BestAuth Webhook] Trial ended for customer ${customerId}, status: ${status}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleSubscriptionTrialEnded:', error)
    throw error
  }
}

async function handleRefundCreated(data: any) {
  const { refundId, paymentIntentId, amount, currency, customerId, reason } = data

  try {
    // Find user by customer ID
    const subscription = await db.subscriptions.findByCustomerId(customerId)
    if (!subscription) {
      console.error('[BestAuth Webhook] Could not find subscription for customer:', customerId)
      return
    }

    // Record refund as negative payment
    await bestAuthSubscriptionService.recordPayment({
      userId: subscription.user_id,
      stripePaymentIntentId: paymentIntentId,
      amount: -amount, // Negative amount for refund
      currency: currency || 'usd',
      status: 'refunded',
      description: `Refund for payment ${paymentIntentId}`,
      metadata: {
        refund_id: refundId,
        refund_reason: reason
      }
    })

    console.log(`[BestAuth Webhook] Recorded refund of ${amount/100} ${currency} for customer ${customerId}`)
  } catch (error) {
    console.error('[BestAuth Webhook] Error in handleRefundCreated:', error)
    throw error
  }
}

async function handleOneTimePaymentSuccess(data: any) {
  const { metadata, paymentId, amount } = data

  if (!metadata || metadata.type !== 'points_pack') {
    console.log('[BestAuth Webhook] Not a points pack purchase, skipping')
    return
  }

  const { pack_id, user_id, points, bonus_points } = metadata

  if (!pack_id || !user_id || !points) {
    console.error('[BestAuth Webhook] Missing required metadata for points pack:', metadata)
    return
  }

  try {
    const supabase = await createClient()
    const pointsService = createPointsService(supabase)
    
    await pointsService.purchasePointsPack(
      user_id,
      pack_id,
      paymentId
    )

    console.log(
      `[BestAuth Webhook] Successfully granted ${points} points (+ ${bonus_points || 0} bonus) to user ${user_id}`
    )
  } catch (error) {
    console.error('[BestAuth Webhook] Error granting points pack:', error)
    throw error
  }
}

// Helper function to create admin Supabase client (no longer needed for BestAuth)
function createAdminSupabaseClient() {
  throw new Error('This webhook handler uses BestAuth - Supabase client not needed')
}
type SerializedError = Record<string, unknown>

function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: serializeUnknownCause((error as { cause?: unknown }).cause),
    }
  }

  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.parse(JSON.stringify(error)) as SerializedError
    } catch {
      return Object.entries(error as Record<string, unknown>).reduce<SerializedError>((acc, [key, value]) => {
        acc[key] = typeof value === 'object' && value !== null ? '[object]' : String(value)
        return acc
      }, {})
    }
  }

  return { value: String(error) }
}

function serializeUnknownCause(cause: unknown): unknown {
  if (!cause) {
    return cause
  }

  if (cause instanceof Error) {
    return serializeError(cause)
  }

  if (typeof cause === 'object') {
    return serializeError(cause)
  }

  return cause
}
