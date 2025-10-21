#!/usr/bin/env tsx
/**
 * Simple script to reset Jeff to free tier
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function main() {
  console.log('='.repeat(80))
  console.log('Resetting Jeff to Free Tier')
  console.log('='.repeat(80))
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  const userId = '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a'
  
  // 1. First check current subscription
  const { data: current } = await supabase
    .from('subscriptions_consolidated')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  console.log('\n📋 Current subscription:')
  console.log(JSON.stringify(current, null, 2))
  
  // 2. Reset subscription to free - only update fields that exist
  console.log('\n1. Resetting subscription to free...')
  const { data: sub, error: subError } = await supabase
    .from('subscriptions_consolidated')
    .update({
      tier: 'free',
      status: 'active',
      stripe_subscription_id: null,
      creem_subscription_id: null,
      stripe_customer_id: null,
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false
    })
    .eq('user_id', userId)
    .select()
    .single()
  
  if (subError) {
    console.error('❌ Failed to reset subscription:', subError)
    return
  }
  
  console.log('✅ Subscription reset to free')
  console.log(`   Tier: ${sub.tier}`)
  console.log(`   Status: ${sub.status}`)
  console.log(`   Subscription ID: ${sub.stripe_subscription_id || 'null'}`)
  
  // 2. Reset credits to 30 (free tier starting credits)
  console.log('\n2. Resetting credits...')
  const { data: usage, error: usageError } = await supabase
    .from('user_usage')
    .upsert({
      user_id: userId,
      credits_balance: 30,
      credits_used_this_month: 0,
      images_today: 0,
      videos_today: 0,
      images_this_month: 0,
      videos_this_month: 0,
      last_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()
  
  if (usageError) {
    console.error('❌ Failed to reset usage:', usageError)
    // Don't return, continue anyway
  } else {
    console.log('✅ Credits reset to 30')
    console.log(`   Balance: ${usage.credits_balance}`)
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ RESET COMPLETE')
  console.log('='.repeat(80))
  console.log('Jeff (jefflee2002@gmail.com) is now:')
  console.log('  - Tier: Free')
  console.log('  - Credits: 30')
  console.log('  - No subscription ID')
  console.log('\nReady to test Pro subscription checkout flow!')
}

main().catch(console.error)
