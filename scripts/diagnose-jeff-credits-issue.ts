#!/usr/bin/env tsx
/**
 * Comprehensive diagnosis of Jeff's credit deduction issue
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const TEST_EMAIL = 'jefflee2002@gmail.com'

async function diagnose() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  console.log('='.repeat(80))
  console.log('COMPREHENSIVE DIAGNOSIS: jefflee2002@gmail.com')
  console.log('='.repeat(80))
  
  // 1. Check BestAuth user
  console.log('\n1. BestAuth User:')
  const { data: bestAuthUser } = await supabase
    .from('bestauth_users')
    .select('*')
    .eq('email', TEST_EMAIL)
    .maybeSingle()
  
  if (!bestAuthUser) {
    console.log('❌ No BestAuth user found')
    return
  }
  
  console.log(`✅ ID: ${bestAuthUser.id}`)
  console.log(`   Email: ${bestAuthUser.email}`)
  
  // 2. Check Supabase auth user
  console.log('\n2. Supabase Auth User:')
  const { data: authData } = await supabase.auth.admin.listUsers()
  const supabaseUser = authData?.users.find(u => u.email === TEST_EMAIL)
  
  if (supabaseUser) {
    console.log(`✅ ID: ${supabaseUser.id}`)
    console.log(`   Email: ${supabaseUser.email}`)
  } else {
    console.log('❌ No Supabase auth user')
  }
  
  // 3. Check user_id_mapping
  console.log('\n3. User ID Mapping:')
  const { data: mapping } = await supabase
    .from('user_id_mapping')
    .select('*')
    .eq('bestauth_user_id', bestAuthUser.id)
    .maybeSingle()
  
  if (mapping) {
    console.log(`✅ Mapping exists:`)
    console.log(`   BestAuth ID: ${mapping.bestauth_user_id}`)
    console.log(`   Supabase ID: ${mapping.supabase_user_id}`)
    console.log(`   Status: ${mapping.sync_status}`)
  } else {
    console.log('❌ NO MAPPING FOUND - THIS IS A CRITICAL ISSUE!')
  }
  
  // 4. Check subscription
  console.log('\n4. Subscription:')
  const { data: subscription } = await supabase
    .from('subscriptions_consolidated')
    .select('*')
    .eq('user_id', bestAuthUser.id)
    .maybeSingle()
  
  if (subscription) {
    console.log(`✅ Subscription found:`)
    console.log(`   User ID: ${subscription.user_id}`)
    console.log(`   Tier: ${subscription.tier}`)
    console.log(`   Status: ${subscription.status}`)
    console.log(`   Credits Balance: ${subscription.points_balance}`)
  } else {
    console.log('❌ No subscription found')
  }
  
  // 5. Check points_balances table directly
  console.log('\n5. Points Balance (BestAuth ID):')
  const { data: balanceBestAuth } = await supabase
    .from('points_balances')
    .select('*')
    .eq('user_id', bestAuthUser.id)
    .maybeSingle()
  
  if (balanceBestAuth) {
    console.log(`✅ Balance found for BestAuth ID:`)
    console.log(`   Balance: ${balanceBestAuth.balance}`)
    console.log(`   Lifetime Earned: ${balanceBestAuth.lifetime_earned}`)
    console.log(`   Lifetime Spent: ${balanceBestAuth.lifetime_spent}`)
  } else {
    console.log('❌ NO BALANCE for BestAuth ID')
  }
  
  if (supabaseUser) {
    console.log('\n6. Points Balance (Supabase ID):')
    const { data: balanceSupabase } = await supabase
      .from('points_balances')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .maybeSingle()
    
    if (balanceSupabase) {
      console.log(`✅ Balance found for Supabase ID:`)
      console.log(`   Balance: ${balanceSupabase.balance}`)
      console.log(`   Lifetime Earned: ${balanceSupabase.lifetime_earned}`)
      console.log(`   Lifetime Spent: ${balanceSupabase.lifetime_spent}`)
    } else {
      console.log('❌ NO BALANCE for Supabase ID')
    }
  }
  
  // 7. Check what resolveSupabaseUserId would return
  console.log('\n7. resolveSupabaseUserId() Simulation:')
  
  const resolvedId = mapping?.supabase_user_id || bestAuthUser.id
  console.log(`   Would resolve to: ${resolvedId}`)
  
  const { data: resolvedBalance } = await supabase
    .from('points_balances')
    .select('*')
    .eq('user_id', resolvedId)
    .maybeSingle()
  
  if (resolvedBalance) {
    console.log(`✅ Balance found for resolved ID: ${resolvedBalance.balance}`)
  } else {
    console.log('❌ NO BALANCE for resolved ID - DEDUCTION WILL FAIL!')
  }
  
  // 8. Test RPC function
  console.log('\n8. Testing RPC deduct_generation_points:')
  const { data: rpcResult, error: rpcError } = await supabase.rpc('deduct_generation_points', {
    p_user_id: resolvedId,
    p_amount: 5,
    p_generation_type: 'nanoBananaImage',
    p_task_id: 'test_diagnosis_' + Date.now(),
    p_metadata: { test: true }
  })
  
  if (rpcError) {
    console.log('❌ RPC Error:', rpcError.message)
  } else {
    console.log('RPC Result:', JSON.stringify(rpcResult, null, 2))
  }
  
  // 9. Summary
  console.log('\n' + '='.repeat(80))
  console.log('DIAGNOSIS SUMMARY')
  console.log('='.repeat(80))
  
  const issues: string[] = []
  
  if (!mapping) {
    issues.push('❌ CRITICAL: user_id_mapping is missing')
  }
  
  if (!resolvedBalance || resolvedBalance.balance === 0) {
    issues.push('❌ CRITICAL: No credits found for resolved user ID')
  }
  
  if (subscription && subscription.tier !== 'free' && (!resolvedBalance || resolvedBalance.balance === 0)) {
    issues.push('❌ CRITICAL: Paid user has 0 credits - RPC will treat as free user')
  }
  
  if (issues.length > 0) {
    console.log('\nISSUES FOUND:')
    issues.forEach(issue => console.log(issue))
    
    console.log('\nRECOMMENDED FIX:')
    console.log('1. Create user_id_mapping entry')
    console.log('2. Grant credits to correct user ID')
    console.log('3. Update subscription metadata with resolved_supabase_user_id')
  } else {
    console.log('\n✅ All checks passed - credits should be deducting')
    console.log('   The issue may be in the frontend or API routing')
  }
}

diagnose().catch(console.error)
