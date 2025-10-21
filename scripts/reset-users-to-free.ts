#!/usr/bin/env npx tsx
/**
 * Reset test users to Free tier with 30 signup credits
 * Users: 994235892@qq.com, jefflee2002@gmail.com
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TEST_USERS = [
  '994235892@qq.com',
  'jefflee2002@gmail.com'
]

async function resetUserToFree(email: string) {
  console.log(`\n=== Resetting ${email} to Free tier ===`)
  
  // 1. Find BestAuth user ID
  const { data: user, error: userError } = await supabase
    .from('bestauth_users')
    .select('id')
    .eq('email', email)
    .single()
  
  if (userError || !user) {
    console.error(`❌ User not found: ${email}`)
    return
  }
  
  const userId = user.id
  console.log(`User ID: ${userId}`)
  
  // 2. Get Supabase user ID from mapping
  const { data: mapping } = await supabase
    .from('user_id_mapping')
    .select('supabase_user_id')
    .eq('bestauth_user_id', userId)
    .maybeSingle()
  
  const supabaseUserId = mapping?.supabase_user_id
  
  if (!supabaseUserId) {
    console.warn(`⚠️  No Supabase user mapping found for ${email}`)
  } else {
    console.log(`Supabase User ID: ${supabaseUserId}`)
  }
  
  // 3. Update bestauth_subscriptions to Free tier
  const { error: subError } = await supabase
    .from('bestauth_subscriptions')
    .upsert({
      user_id: userId,
      tier: 'free',
      status: 'active',
      points_balance: 30,
      points_lifetime_earned: 30,
      points_lifetime_spent: 0,
      stripe_subscription_id: null,
      stripe_customer_id: null,
      billing_cycle: null,
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
      previous_tier: null,
      metadata: {
        reset_at: new Date().toISOString(),
        reset_reason: 'Test reset to free tier with 30 signup credits'
      },
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
  
  if (subError) {
    console.error(`❌ Failed to update bestauth_subscriptions:`, subError)
    return
  }
  
  console.log('✅ Updated bestauth_subscriptions to Free tier')
  
  // 4. Update subscriptions_consolidated (if Supabase user exists)
  if (supabaseUserId) {
    const { error: consolidatedError } = await supabase
      .from('subscriptions_consolidated')
      .upsert({
        user_id: userId,
        tier: 'free',
        status: 'active',
        stripe_subscription_id: null,
        stripe_customer_id: null,
        billing_cycle: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        previous_tier: null,
        metadata: {
          reset_at: new Date().toISOString(),
          reset_reason: 'Test reset to free tier'
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
    
    if (consolidatedError) {
      console.warn(`⚠️  Failed to update subscriptions_consolidated:`, consolidatedError.message)
    } else {
      console.log('✅ Updated subscriptions_consolidated')
    }
  }
  
  // 5. Reset points_balances to 30 credits
  if (supabaseUserId) {
    const { error: pointsError } = await supabase
      .from('points_balances')
      .upsert({
        user_id: supabaseUserId,
        balance: 30,
        lifetime_earned: 30,
        lifetime_spent: 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
    
    if (pointsError) {
      console.warn(`⚠️  Failed to update points_balances:`, pointsError.message)
    } else {
      console.log('✅ Reset points_balances to 30 credits')
    }
  }
  
  // 6. Verify final state
  const { data: finalSub } = await supabase
    .from('bestauth_subscriptions')
    .select('tier, status, points_balance, points_lifetime_earned')
    .eq('user_id', userId)
    .single()
  
  console.log('\n=== FINAL STATE ===')
  console.log('Tier:', finalSub?.tier)
  console.log('Status:', finalSub?.status)
  console.log('Points Balance:', finalSub?.points_balance)
  console.log('Lifetime Earned:', finalSub?.points_lifetime_earned)
  
  if (supabaseUserId) {
    const { data: pointsBalance } = await supabase
      .from('points_balances')
      .select('balance, lifetime_earned, lifetime_spent')
      .eq('user_id', supabaseUserId)
      .maybeSingle()
    
    if (pointsBalance) {
      console.log('\n=== POINTS_BALANCES ===')
      console.log('Balance:', pointsBalance.balance)
      console.log('Lifetime Earned:', pointsBalance.lifetime_earned)
      console.log('Lifetime Spent:', pointsBalance.lifetime_spent)
    }
  }
  
  console.log(`\n✅ Successfully reset ${email} to Free tier with 30 credits\n`)
}

async function main() {
  console.log('🔄 Resetting test users to Free tier with 30 signup credits...\n')
  
  for (const email of TEST_USERS) {
    await resetUserToFree(email)
  }
  
  console.log('\n✅ All users reset successfully!')
}

main().catch(console.error)
