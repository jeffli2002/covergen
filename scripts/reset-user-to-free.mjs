#!/usr/bin/env node

/**
 * Reset a user's subscription back to the free tier with 30 credits.
 *
 * Steps:
 *   1. Resolve Supabase auth user (and ensure email_confirmed_at is set).
 *   2. Resolve BestAuth user.
 *   3. Update bestauth_subscriptions to free tier with metadata + history.
 *   4. Upsert subscriptions_consolidated mirror with 30-credit balance.
 *   5. Record a manual adjustment transaction for any delta.
 *
 * Usage:
 *   node scripts/reset-user-to-free.mjs user@example.com
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const TARGET_BALANCE = 30
const TARGET_TIER = 'free'

const email = process.argv[2]

if (!email) {
  console.error('Usage: node scripts/reset-user-to-free.mjs user@example.com')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const nowIso = () => new Date().toISOString()

function buildHistoryEntry(previousTier) {
  return {
    from_tier: previousTier,
    to_tier: TARGET_TIER,
    changed_at: nowIso(),
    change_type: 'manual_reset',
    source: 'reset-user-to-free-script',
  }
}

async function getAuthUser(emailAddress) {
  try {
    let page = 1
    const perPage = 200

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) {
        throw error
      }

      const found = data?.users?.find((user) => user.email?.toLowerCase() === emailAddress.toLowerCase())
      if (found) {
        return found
      }

      if (!data?.users?.length || data.users.length < perPage) {
        break
      }

      page += 1
    }
  } catch (error) {
    throw new Error(`Failed to load Supabase auth user: ${error.message ?? error}`)
  }

  return null
}

async function ensureAuthUserConfirmed(user) {
  if (!user) {
    throw new Error('Supabase auth user not found')
  }

  if (user.email_confirmed_at || user.confirmed_at) {
    console.log('✓ Supabase email already confirmed')
    return
  }

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirmed_at: nowIso(),
  })

  if (error) {
    throw new Error(`Failed to confirm Supabase email: ${error.message}`)
  }

  console.log('✓ Supabase email marked as confirmed at', data?.user?.email_confirmed_at ?? data?.user?.confirmed_at)
}

async function getBestAuthUser(emailAddress) {
  const { data, error } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .eq('email', emailAddress)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load BestAuth user: ${error.message}`)
  }

  return data ?? null
}

async function upsertUserMapping(bestAuthUserId, supabaseUserId) {
  try {
    const { error } = await supabase
      .from('user_id_mapping')
      .upsert(
        {
          bestauth_user_id: bestAuthUserId,
          supabase_user_id: supabaseUserId,
          updated_at: nowIso(),
        },
        {
          onConflict: 'bestauth_user_id',
        }
      )

    if (error) {
      throw error
    }

    console.log('✓ Ensured user_id_mapping entry exists')
  } catch (mappingError) {
    console.warn(
      '[Reset Script] Skipping user_id_mapping upsert:',
      mappingError?.message ?? mappingError
    )
  }
}

async function updateBestAuthSubscription(bestAuthUserId, supabaseUserId) {
  const { data: existing, error: existingError } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', bestAuthUserId)
    .maybeSingle()

  if (existingError) {
    throw new Error(`Failed to load BestAuth subscription: ${existingError.message}`)
  }

  const upgradeHistory = Array.isArray(existing?.upgrade_history)
    ? [...existing.upgrade_history, buildHistoryEntry(existing.tier)]
    : [buildHistoryEntry(existing?.tier ?? null)]

  const metadata = {
    ...(existing?.metadata ?? {}),
    manual_reset_at: nowIso(),
    manual_reset_reason: 'reset_to_free_with_30_credits',
    supabase_user_id: supabaseUserId,
    resolved_supabase_user_id: supabaseUserId,
    original_userId: supabaseUserId,
  }

  const { error: upsertError } = await supabase
    .from('bestauth_subscriptions')
    .upsert(
      {
        user_id: bestAuthUserId,
        tier: TARGET_TIER,
        status: 'active',
        billing_cycle: null,
        cancel_at_period_end: false,
        cancelled_at: null,
        previous_tier: existing?.tier ?? null,
        upgrade_history: upgradeHistory,
        metadata,
        points_balance: TARGET_BALANCE,
        points_lifetime_earned: Math.max(
          TARGET_BALANCE,
          existing?.points_lifetime_earned ?? 0,
          existing?.points_lifetime_spent ?? 0
        ),
        points_lifetime_spent: existing?.points_lifetime_spent ?? 0,
        updated_at: nowIso(),
      },
      { onConflict: 'user_id' }
    )

  if (upsertError) {
    throw new Error(`Failed to update BestAuth subscription: ${upsertError.message}`)
  }

  return existing?.tier ?? null
}

async function updateSupabaseSubscription(supabaseUserId, previousTier) {
  const { data: existing, error: existingError } = await supabase
    .from('subscriptions_consolidated')
    .select('*')
    .eq('user_id', supabaseUserId)
    .maybeSingle()

  if (existingError) {
    throw new Error(`Failed to load Supabase subscription: ${existingError.message}`)
  }

  const newLifetimeEarned = Math.max(
    TARGET_BALANCE,
    existing?.points_lifetime_earned ?? 0,
    existing?.points_lifetime_spent ?? 0
  )

  const metadata = {
    ...(existing?.metadata ?? {}),
    supabase_user_id: supabaseUserId,
    resolved_supabase_user_id: supabaseUserId,
  }

  const { data: upserted, error: upsertError } = await supabase
    .from('subscriptions_consolidated')
    .upsert(
      {
        user_id: supabaseUserId,
        tier: TARGET_TIER,
        status: 'active',
        billing_cycle: null,
        points_balance: TARGET_BALANCE,
        points_lifetime_earned: newLifetimeEarned,
        points_lifetime_spent: existing?.points_lifetime_spent ?? 0,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        canceled_at: null,
        expires_at: null,
        next_billing_date: null,
        previous_tier: previousTier ?? existing?.previous_tier ?? existing?.tier ?? null,
        trial_started_at: null,
        trial_ended_at: null,
        trial_days: null,
        paid_started_at: null,
        metadata,
        updated_at: nowIso(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .maybeSingle()

  if (upsertError) {
    throw new Error(`Failed to upsert Supabase subscription: ${upsertError.message}`)
  }

  return {
    previousBalance: existing?.points_balance ?? 0,
    updated: upserted,
  }
}

async function recordAdjustmentTransaction(supabaseUserId, delta) {
  if (delta === 0) {
    return
  }

  const { error } = await supabase.from('points_transactions').insert({
    user_id: supabaseUserId,
    amount: delta,
    transaction_type: 'manual_adjustment',
    description: `Manual reset to ${TARGET_BALANCE} credits`,
    metadata: {
      source: 'reset-user-to-free-script',
      target_balance: TARGET_BALANCE,
      adjustment: delta,
    },
    created_at: nowIso(),
  })

  if (error) {
    throw new Error(`Failed to insert adjustment transaction: ${error.message}`)
  }
}

async function main() {
  console.log('='.repeat(64))
  console.log(`Resetting user ${email} to free tier with ${TARGET_BALANCE} credits`)
  console.log('='.repeat(64))

  const authUser = await getAuthUser(email)
  if (!authUser) {
    throw new Error(`No Supabase auth user found for ${email}`)
  }
  console.log(`✓ Supabase user id: ${authUser.id}`)

  await ensureAuthUserConfirmed(authUser)

  const bestAuthUser = await getBestAuthUser(email)
  if (!bestAuthUser) {
    throw new Error(`No BestAuth user found for ${email}`)
  }
  console.log(`✓ BestAuth user id: ${bestAuthUser.id}`)

  await upsertUserMapping(bestAuthUser.id, authUser.id)

  const previousTier = await updateBestAuthSubscription(bestAuthUser.id, authUser.id)
  console.log(`✓ BestAuth subscription set to free (previous: ${previousTier ?? 'unknown'})`)

  const { previousBalance } = await updateSupabaseSubscription(authUser.id, previousTier)
  console.log(`✓ Supabase consolidated subscription updated (previous balance: ${previousBalance})`)

  const delta = TARGET_BALANCE - previousBalance
  await recordAdjustmentTransaction(authUser.id, delta)
  if (delta !== 0) {
    console.log(`✓ Recorded manual adjustment transaction for delta ${delta}`)
  } else {
    console.log('ℹ️  No adjustment transaction recorded (already at target balance)')
  }

  console.log('\n✅ Reset complete!')
}

main().catch((error) => {
  console.error('\n❌ Reset failed:', error)
  process.exit(1)
})
