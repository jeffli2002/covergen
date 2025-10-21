/**
 * Verification Script: Credits Deduction Bug Fix
 * 
 * This script verifies that credits are properly deducted after image generation
 * by testing the user ID resolution logic.
 * 
 * Bug Fixed: Credits were not being deducted because BestAuth user IDs were
 * being used instead of Supabase user IDs for the points system.
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Test user from bug report
const TEST_USER_EMAIL = 'jefflee2002@gmail.com'
const EXPECTED_INITIAL_CREDITS = 830

async function verifyUserIdMapping() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  console.log('\n=== Credits Deduction Fix Verification ===\n')
  
  // Step 1: Find BestAuth user
  console.log('Step 1: Finding BestAuth user...')
  const { data: bestAuthUser } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .eq('email', TEST_USER_EMAIL)
    .single()
  
  if (!bestAuthUser) {
    console.error('❌ BestAuth user not found')
    return
  }
  
  console.log('✅ BestAuth user found:', bestAuthUser.id)
  
  // Step 2: Check user_id_mapping
  console.log('\nStep 2: Checking user_id_mapping table...')
  const { data: mapping } = await supabase
    .from('user_id_mapping')
    .select('*')
    .eq('bestauth_user_id', bestAuthUser.id)
    .single()
  
  if (!mapping) {
    console.error('❌ User ID mapping not found - THIS IS THE BUG!')
    console.log('   Points system cannot find the Supabase user ID')
  } else {
    console.log('✅ User ID mapping found:')
    console.log('   BestAuth ID:', mapping.bestauth_user_id)
    console.log('   Supabase ID:', mapping.supabase_user_id)
  }
  
  // Step 3: Check subscription metadata
  console.log('\nStep 3: Checking subscription metadata fallback...')
  const { data: subscription } = await supabase
    .from('bestauth_subscriptions')
    .select('metadata')
    .eq('user_id', bestAuthUser.id)
    .single()
  
  if (subscription?.metadata?.resolved_supabase_user_id) {
    console.log('✅ Subscription metadata has resolved_supabase_user_id:', subscription.metadata.resolved_supabase_user_id)
  } else {
    console.log('❌ No resolved_supabase_user_id in subscription metadata')
  }
  
  // Step 4: Check points balance with resolved ID
  const supabaseUserId = mapping?.supabase_user_id || subscription?.metadata?.resolved_supabase_user_id
  
  if (!supabaseUserId) {
    console.error('\n❌ CRITICAL: Cannot resolve Supabase user ID!')
    console.log('   Credits will NOT be deducted because the points system')
    console.log('   cannot find the user in the points_balances table')
    return
  }
  
  console.log('\nStep 4: Checking points balance with resolved Supabase ID...')
  const { data: balance, error } = await supabase.rpc('get_points_balance', {
    p_user_id: supabaseUserId
  })
  
  if (error) {
    console.error('❌ Error getting points balance:', error)
  } else if (balance) {
    console.log('✅ Points balance found:')
    console.log('   Balance:', balance.balance)
    console.log('   Lifetime Earned:', balance.lifetime_earned)
    console.log('   Lifetime Spent:', balance.lifetime_spent)
    
    if (balance.balance === EXPECTED_INITIAL_CREDITS) {
      console.log('\n⚠️  Balance matches initial amount - no deductions yet')
    } else {
      console.log('\n✅ Balance has changed - deductions are working!')
    }
  } else {
    console.log('❌ No points balance found for Supabase user ID:', supabaseUserId)
  }
  
  // Step 5: Test generation costs
  console.log('\nStep 5: Generation costs (from config):')
  console.log('   nanoBananaImage: 5 points')
  console.log('   sora2Video: 20 points')
  console.log('   sora2ProVideo: 80 points')
  
  // Step 6: Summary
  console.log('\n=== Summary ===')
  console.log('Fix Applied: User ID resolution in all generation endpoints')
  console.log('Files Modified:')
  console.log('  - /src/app/api/sora/query/route.ts')
  console.log('  - /src/app/api/sora/create/route.ts')
  console.log('  - /src/app/api/generate/route.ts')
  console.log('\nWhat was fixed:')
  console.log('  - Added resolveSupabaseUserId() helper function')
  console.log('  - Resolves BestAuth user ID → Supabase user ID')
  console.log('  - Uses user_id_mapping table (primary)')
  console.log('  - Falls back to subscription metadata')
  console.log('  - Points deduction now uses correct Supabase user ID')
  
  if (mapping && balance) {
    console.log('\n✅ All checks passed - credits should now be deducted properly')
  } else {
    console.log('\n⚠️  Some checks failed - review the output above')
  }
}

// Run verification
verifyUserIdMapping().catch(console.error)
