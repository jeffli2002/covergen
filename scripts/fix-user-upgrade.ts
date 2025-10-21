#!/usr/bin/env tsx
/**
 * Fix user upgrade - set to Pro+ and sync tables
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const email = process.argv[2] || '994235892@qq.com'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('='.repeat(80))
  console.log(`Fixing ${email} - Setting to Pro+`)
  console.log('='.repeat(80))
  
  // Get user
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  console.log('\n✅ User found:', user.id)
  
  // Get current subscription
  const { data: current } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  console.log('\n📋 Current state:')
  console.log('  Tier:', current?.tier)
  console.log('  Stripe Sub ID:', current?.stripe_subscription_id)
  console.log('  Points:', current?.points_balance)
  
  // Update to Pro+ in bestauth_subscriptions
  console.log('\n1️⃣ Updating bestauth_subscriptions to Pro+...')
  const { data: updated, error: updateError } = await supabase
    .from('bestauth_subscriptions')
    .update({
      tier: 'pro_plus',
      previous_tier: 'pro',
      points_balance: 200, // Pro+ monthly allocation
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (updateError) {
    console.error('❌ Failed to update bestauth_subscriptions:', updateError)
    return
  }
  
  console.log('✅ Updated to Pro+')
  
  // Sync to subscriptions_consolidated
  console.log('\n2️⃣ Syncing to subscriptions_consolidated...')
  const { data: synced, error: syncError } = await supabase
    .from('subscriptions_consolidated')
    .upsert({
      user_id: updated.user_id,
      tier: updated.tier,
      status: updated.status,
      stripe_subscription_id: updated.stripe_subscription_id,
      stripe_customer_id: updated.stripe_customer_id,
      creem_subscription_id: updated.creem_subscription_id,
      current_period_start: updated.current_period_start,
      current_period_end: updated.current_period_end,
      cancel_at_period_end: updated.cancel_at_period_end,
      billing_cycle: updated.billing_cycle,
      previous_tier: updated.previous_tier,
      points_balance: updated.points_balance,
      metadata: updated.metadata,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()
  
  if (syncError) {
    console.error('❌ Failed to sync:', syncError)
    return
  }
  
  console.log('✅ Synced to subscriptions_consolidated')
  
  // Verify
  console.log('\n' + '='.repeat(80))
  console.log('✅ FIX COMPLETE')
  console.log('='.repeat(80))
  console.log('User:', email)
  console.log('Tier: Pro+')
  console.log('Credits: 200 (Pro+ monthly allocation)')
  console.log('\nPlease refresh the account page to see the changes.')
}

main().catch(console.error)
