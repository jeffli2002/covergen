#!/usr/bin/env tsx
/**
 * Test script to reproduce Jeff's Pro to Pro+ upgrade error
 * User: jefflee2002@gmail.com (Pro tier)
 * Action: Click "Upgrade to Pro+"
 * Expected: Successful upgrade with proration
 * Actual: "Failed to process upgrade" error
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
  console.log('Testing Pro to Pro+ Upgrade for jefflee2002@gmail.com')
  console.log('='.repeat(80))
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  // 1. Get user from BestAuth table
  const { data: bestAuthUsers, error: userError } = await supabase
    .from('bestauth_users')
    .select('*')
    .eq('email', 'jefflee2002@gmail.com')
    .single()
  
  if (userError || !bestAuthUsers) {
    console.error('❌ User not found in BestAuth:', userError)
    return
  }
  
  const targetUser = bestAuthUsers
  console.log('\n✅ User found:')
  console.log(`   ID: ${targetUser.id}`)
  console.log(`   Email: ${targetUser.email}`)
  
  // 2. Get subscription info
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', targetUser.id)
    .single()
    
  if (subError || !subscription) {
    console.error('❌ Subscription not found:', subError)
    return
  }
  
  console.log('\n✅ Current Subscription:')
  console.log(`   Tier: ${subscription.tier}`)
  console.log(`   Status: ${subscription.status}`)
  console.log(`   Billing Cycle: ${subscription.billing_cycle || 'N/A'}`)
  console.log(`   Stripe Subscription ID: ${subscription.stripe_subscription_id || 'MISSING!'}`)
  console.log(`   Stripe Customer ID: ${subscription.stripe_customer_id || 'N/A'}`)
  console.log(`   Trial: ${subscription.is_trialing}`)
  console.log(`   Payment Method: ${subscription.has_payment_method}`)
  
  // 3. Diagnose the issue
  console.log('\n' + '='.repeat(80))
  console.log('DIAGNOSIS')
  console.log('='.repeat(80))
  
  if (!subscription.stripe_subscription_id) {
    console.log('❌ PROBLEM FOUND: Missing stripe_subscription_id!')
    console.log('   The upgrade endpoint requires a valid Creem subscription ID')
    console.log('   This should start with "sub_" for Creem subscriptions')
    console.log('')
    console.log('   SOLUTION OPTIONS:')
    console.log('   1. User needs to go through checkout flow again to get Creem sub ID')
    console.log('   2. Manually set stripe_subscription_id from Creem dashboard')
    console.log('   3. Create new subscription with proper Creem integration')
  } else if (!subscription.stripe_subscription_id.startsWith('sub_')) {
    console.log('❌ PROBLEM FOUND: Invalid stripe_subscription_id format!')
    console.log(`   Current value: ${subscription.stripe_subscription_id}`)
    console.log('   Expected format: sub_XXXXXXXXXXXXX (Creem subscription ID)')
  } else {
    console.log('✅ Subscription ID looks valid')
    console.log(`   ID: ${subscription.stripe_subscription_id}`)
    
    // Test if we can upgrade
    console.log('\n📝 Upgrade Requirements Check:')
    console.log(`   ✅ Has stripe_subscription_id: ${!!subscription.stripe_subscription_id}`)
    console.log(`   ✅ Current tier is Pro: ${subscription.tier === 'pro'}`)
    console.log(`   ✅ Status is active: ${subscription.status === 'active'}`)
    console.log(`   ✅ Not trialing: ${!subscription.is_trialing}`)
    
    if (subscription.tier === 'pro' && subscription.status === 'active' && subscription.stripe_subscription_id) {
      console.log('\n✅ All requirements met for upgrade')
      console.log('   The upgrade should work. If it fails, check:')
      console.log('   - Creem API connectivity')
      console.log('   - Subscription exists in Creem dashboard')
      console.log('   - Product IDs are correct in env vars')
    }
  }
  
  // 4. Check product IDs
  console.log('\n' + '='.repeat(80))
  console.log('CREEM PRODUCT IDs')
  console.log('='.repeat(80))
  console.log(`Pro Monthly: ${process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY || 'MISSING'}`)
  console.log(`Pro Yearly: ${process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY || 'MISSING'}`)
  console.log(`Pro+ Monthly: ${process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY || 'MISSING'}`)
  console.log(`Pro+ Yearly: ${process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY || 'MISSING'}`)
  
  console.log('\n' + '='.repeat(80))
  console.log('TEST COMPLETE')
  console.log('='.repeat(80))
}

main().catch(console.error)
