#!/usr/bin/env npx tsx
/**
 * Test points balance API for header display
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

async function testPointsBalanceAPI() {
  const email = '994235892@qq.com'
  
  console.log('=== Testing Points Balance API (Header Component) ===\n')
  console.log(`Email: ${email}`)
  
  // Get user and create a session token
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.error('User not found')
    return
  }
  
  console.log(`\nUser ID: ${user.id}`)
  
  // Check database state
  const { data: sub } = await supabase
    .from('bestauth_subscriptions')
    .select('points_balance, tier, status')
    .eq('user_id', user.id)
    .single()
  
  console.log('\n=== Database State ===')
  console.log('Tier:', sub?.tier)
  console.log('Status:', sub?.status)
  console.log('Points Balance (DB):', sub?.points_balance)
  
  // Create a temporary session token for testing
  const { auth } = await import('@/lib/bestauth')
  const sessionResult = await auth.createSession({ userId: user.id })
  
  if (!sessionResult.success || !sessionResult.data) {
    console.error('Failed to create session')
    return
  }
  
  const token = sessionResult.data.token
  
  // Test the API
  console.log('\n=== Testing /api/points/balance ===')
  const response = await fetch('http://localhost:3001/api/points/balance', {
    headers: {
      'Cookie': `bestauth_session=${token}`
    }
  })
  
  if (!response.ok) {
    console.error('API returned error:', response.status, response.statusText)
    const text = await response.text()
    console.error('Response:', text)
    return
  }
  
  const data = await response.json()
  
  console.log('API Response:')
  console.log('  balance:', data.balance)
  console.log('  lifetime_earned:', data.lifetime_earned)
  console.log('  lifetime_spent:', data.lifetime_spent)
  console.log('  tier:', data.tier)
  
  // Verify
  if (data.balance === sub?.points_balance) {
    console.log('\n✅ SUCCESS: API returns correct balance for header')
    console.log(`   Expected: ${sub?.points_balance}`)
    console.log(`   Got: ${data.balance}`)
  } else {
    console.log('\n❌ FAIL: API balance mismatch')
    console.log(`   Expected: ${sub?.points_balance}`)
    console.log(`   Got: ${data.balance}`)
  }
}

testPointsBalanceAPI().catch(console.error)
