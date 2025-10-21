#!/usr/bin/env npx tsx
/**
 * Test if account API returns correct credits for user with 30 credits
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

async function testAccountAPI() {
  const email = '994235892@qq.com'
  
  console.log('=== Testing Account API Credits Display ===\n')
  console.log(`Email: ${email}`)
  
  // First check database state
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.error('User not found')
    return
  }
  
  const { data: sub } = await supabase
    .from('bestauth_subscriptions')
    .select('points_balance, tier, status')
    .eq('user_id', user.id)
    .single()
  
  console.log('\n=== Database State ===')
  console.log('Tier:', sub?.tier)
  console.log('Status:', sub?.status)
  console.log('Points Balance (DB):', sub?.points_balance)
  
  // Now test getStatus function
  console.log('\n=== Testing db.subscriptions.getStatus ===')
  const { db } = await import('@/lib/bestauth/db-wrapper')
  const status = await db.subscriptions.getStatus(user.id)
  
  console.log('Returned tier:', status?.tier)
  console.log('Returned points_balance:', status?.points_balance)
  console.log('Returned points_lifetime_earned:', status?.points_lifetime_earned)
  console.log('Returned points_lifetime_spent:', status?.points_lifetime_spent)
  
  // Verify
  if (status?.points_balance === sub?.points_balance) {
    console.log('\n✅ SUCCESS: getStatus returns correct points_balance')
  } else {
    console.log('\n❌ FAIL: getStatus points_balance mismatch')
    console.log('   Expected:', sub?.points_balance)
    console.log('   Got:', status?.points_balance)
  }
}

testAccountAPI().catch(console.error)
