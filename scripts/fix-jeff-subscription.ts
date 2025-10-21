#!/usr/bin/env tsx
/**
 * Fix Jeff's subscription - set him to Pro tier for testing
 * After this, the Pro → Pro+ upgrade should work
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function main() {
  console.log('='.repeat(80))
  console.log('Fixing Jeff\'s Subscription - Set to Pro Tier')
  console.log('='.repeat(80))
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  // 1. Get user
  const { data: user, error: userError } = await supabase
    .from('bestauth_users')
    .select('*')
    .eq('email', 'jefflee2002@gmail.com')
    .single()
  
  if (userError || !user) {
    console.error('❌ User not found:', userError)
    return
  }
  
  console.log(`\n✅ Found user: ${user.email} (${user.id})`)
  
  // 2. First, get current subscription to see what fields exist
  const { data: currentSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  console.log('\n📋 Current subscription fields:')
  console.log(JSON.stringify(currentSub, null, 2))
  
  // 3. Update subscription_consolidated table - minimal fields only
  const { data: subscription, error: updateError } = await supabase
    .from('subscriptions_consolidated')
    .update({
      tier: 'pro',
      stripe_subscription_id: 'sub_test_jeff_pro_monthly_001'
    })
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (updateError) {
    console.error('❌ Failed to update subscription:', updateError)
    return
  }
  
  console.log('\n✅ Subscription updated successfully!')
  console.log(`   Tier: ${subscription.tier}`)
  console.log(`   Status: ${subscription.status}`)
  console.log(`   Billing Cycle: ${subscription.billing_cycle}`)
  console.log(`   Stripe Sub ID: ${subscription.stripe_subscription_id}`)
  console.log(`   Stripe Customer ID: ${subscription.stripe_customer_id}`)
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ FIX COMPLETE')
  console.log('='.repeat(80))
  console.log('Jeff can now test the Pro → Pro+ upgrade flow')
  console.log('NOTE: This uses a test subscription ID. For real upgrades,')
  console.log('      Jeff would need to go through the checkout flow.')
}

main().catch(console.error)
