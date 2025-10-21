#!/usr/bin/env tsx
/**
 * Diagnose discrepancy for 994235892@qq.com
 * Shows Pro in DB but Pro+ in account page
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const TEST_EMAIL = '994235892@qq.com'

async function diagnose() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  console.log('='.repeat(80))
  console.log('SUBSCRIPTION DISCREPANCY DIAGNOSIS')
  console.log('='.repeat(80))
  console.log(`User: ${TEST_EMAIL}\n`)
  
  // 1. Get BestAuth user
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('*')
    .eq('email', TEST_EMAIL)
    .single()
  
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  console.log(`✅ BestAuth User ID: ${user.id}\n`)
  
  // 2. Check subscriptions_consolidated
  console.log('Table: subscriptions_consolidated')
  const { data: consolidatedSub } = await supabase
    .from('subscriptions_consolidated')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  
  if (consolidatedSub) {
    console.log('✅ Found subscription:')
    console.log(`   Tier: ${consolidatedSub.tier}`)
    console.log(`   Status: ${consolidatedSub.status}`)
    console.log(`   Billing Cycle: ${consolidatedSub.billing_cycle}`)
    console.log(`   Points Balance: ${consolidatedSub.points_balance}`)
    console.log(`   Stripe Sub ID: ${consolidatedSub.stripe_subscription_id}`)
  } else {
    console.log('❌ No subscription found\n')
  }
  
  // 3. Check bestauth_subscriptions (the source table)
  console.log('\nTable: bestauth_subscriptions')
  const { data: bestAuthSub } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  
  if (bestAuthSub) {
    console.log('✅ Found subscription:')
    console.log(`   Tier: ${bestAuthSub.tier}`)
    console.log(`   Status: ${bestAuthSub.status}`)
    console.log(`   Billing Cycle: ${bestAuthSub.billing_cycle}`)
    console.log(`   Stripe Sub ID: ${bestAuthSub.stripe_subscription_id}`)
    console.log(`   Metadata:`, JSON.stringify(bestAuthSub.metadata, null, 2))
  } else {
    console.log('❌ No subscription found\n')
  }
  
  // 4. Check what the account API would return
  console.log('\nSimulating Account API call...')
  const accountApiUrl = `http://localhost:3001/api/bestauth/account`
  
  try {
    // We can't make the API call without auth, but we can check the logic
    console.log('Account API uses:')
    console.log('  1. bestauth_subscriptions table (if exists)')
    console.log('  2. Falls back to subscriptions_consolidated')
    console.log('  3. Returns subscription.tier field')
  } catch (error) {
    console.log('Could not simulate API call (requires authentication)')
  }
  
  // 5. Check if there's a mismatch
  console.log('\n' + '='.repeat(80))
  console.log('DISCREPANCY ANALYSIS')
  console.log('='.repeat(80))
  
  if (consolidatedSub && bestAuthSub) {
    if (consolidatedSub.tier !== bestAuthSub.tier) {
      console.log('❌ MISMATCH FOUND!')
      console.log(`   subscriptions_consolidated: ${consolidatedSub.tier}`)
      console.log(`   bestauth_subscriptions: ${bestAuthSub.tier}`)
      console.log('')
      console.log('ROOT CAUSE: Tables are out of sync')
      console.log('FIX: Update subscriptions_consolidated to match bestauth_subscriptions')
    } else {
      console.log('✅ Both tables match')
      console.log(`   Both show: ${consolidatedSub.tier}`)
      console.log('')
      console.log('If account page shows different tier, check:')
      console.log('  1. Frontend caching')
      console.log('  2. Account API response transformation')
    }
  } else if (bestAuthSub && !consolidatedSub) {
    console.log('⚠️  ISSUE: bestauth_subscriptions exists but subscriptions_consolidated is missing')
    console.log('FIX: Run sync script to populate subscriptions_consolidated')
  } else if (!bestAuthSub && consolidatedSub) {
    console.log('⚠️  ISSUE: subscriptions_consolidated exists but bestauth_subscriptions is missing')
    console.log('This should not happen - consolidated is a view/copy of bestauth_subscriptions')
  }
  
  // 6. Show the fix
  if (consolidatedSub && bestAuthSub && consolidatedSub.tier !== bestAuthSub.tier) {
    console.log('\n' + '='.repeat(80))
    console.log('RECOMMENDED FIX')
    console.log('='.repeat(80))
    console.log('Run this SQL to sync the tables:')
    console.log('')
    console.log(`UPDATE subscriptions_consolidated`)
    console.log(`SET tier = '${bestAuthSub.tier}'`)
    console.log(`WHERE user_id = '${user.id}';`)
    console.log('')
    console.log('OR use the sync script:')
    console.log('npx tsx scripts/sync-user-to-consolidated.ts')
  }
}

diagnose().catch(console.error)
