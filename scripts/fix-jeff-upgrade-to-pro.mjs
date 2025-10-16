#!/usr/bin/env node

/**
 * Manually upgrade user 994235892@qq.com to Pro
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const email = '994235892@qq.com'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log(`\n🔧 Upgrading ${email} to Pro...\n`)

// 1. Find user
const { data: user, error: userError } = await supabase
  .from('bestauth_users')
  .select('id, email')
  .eq('email', email)
  .single()

if (userError || !user) {
  console.error('❌ User not found:', userError?.message)
  process.exit(1)
}

console.log('✅ User found:', user.id)

// 2. Get current subscription
const { data: currentSub, error: subError } = await supabase
  .from('bestauth_subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .single()

if (subError) {
  console.error('❌ Error fetching subscription:', subError.message)
  process.exit(1)
}

console.log('📋 Current tier:', currentSub.tier)

// 3. Update to Pro
const upgradeEntry = {
  from_tier: currentSub.tier,
  to_tier: 'pro',
  upgraded_at: new Date().toISOString(),
  upgrade_type: 'manual_fix',
  source: 'webhook_failure_recovery'
}

const existingHistory = currentSub.upgrade_history || []
const newHistory = [...existingHistory, upgradeEntry]

const { data: updated, error: updateError } = await supabase
  .from('bestauth_subscriptions')
  .update({
    tier: 'pro',
    previous_tier: currentSub.tier,
    status: 'active',
    billing_cycle: 'monthly',
    upgrade_history: newHistory,
    metadata: {
      ...currentSub.metadata,
      manual_upgrade_at: new Date().toISOString(),
      manual_upgrade_reason: 'Webhook failed to process upgrade'
    },
    updated_at: new Date().toISOString()
  })
  .eq('user_id', user.id)
  .select()
  .single()

if (updateError) {
  console.error('❌ Error updating subscription:', updateError.message)
  process.exit(1)
}

console.log('\n✅ Successfully upgraded to Pro!')
console.log('   New tier:', updated.tier)
console.log('   Previous tier:', updated.previous_tier)
console.log('   Billing cycle:', updated.billing_cycle)
console.log('\n📈 Upgrade history:')
updated.upgrade_history.forEach((h, i) => {
  console.log(`   ${i + 1}. ${h.from_tier} → ${h.to_tier} (${h.source})`)
})

// 4. Grant Pro monthly credits (500 points)
console.log('\n💎 Granting Pro monthly credits...')

const { data: balance, error: balanceError } = await supabase
  .from('points_balance')
  .select('*')
  .eq('user_id', user.id)
  .single()

if (balanceError && balanceError.code !== 'PGRST116') {
  console.error('❌ Error checking points balance:', balanceError.message)
} else if (!balance) {
  // Create initial balance
  const { error: createError } = await supabase
    .from('points_balance')
    .insert({
      user_id: user.id,
      balance: 500,
      lifetime_earned: 500,
      lifetime_spent: 0
    })
  
  if (createError) {
    console.error('❌ Error creating points balance:', createError.message)
  } else {
    console.log('✅ Created points balance with 500 credits')
  }
} else {
  // Add credits
  const { error: addError } = await supabase
    .from('points_balance')
    .update({
      balance: balance.balance + 500,
      lifetime_earned: balance.lifetime_earned + 500,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
  
  if (addError) {
    console.error('❌ Error adding points:', addError.message)
  } else {
    console.log(`✅ Added 500 credits (new balance: ${balance.balance + 500})`)
  }
}

// 5. Record transaction
const { error: txError } = await supabase
  .from('points_transactions')
  .insert({
    user_id: user.id,
    amount: 500,
    transaction_type: 'subscription_grant',
    description: 'Pro monthly subscription: 500 credits (manual recovery)',
    subscription_id: updated.id,
    metadata: {
      tier: 'pro',
      cycle: 'monthly',
      source: 'manual_webhook_recovery'
    }
  })

if (txError) {
  console.error('❌ Error recording transaction:', txError.message)
} else {
  console.log('✅ Recorded points transaction')
}

console.log('\n✅ Upgrade complete! User should see Pro plan on next page refresh.\n')
