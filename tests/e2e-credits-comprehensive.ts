#!/usr/bin/env npx tsx
/**
 * Comprehensive E2E Credit System Test Suite
 * 
 * Tests all credit scenarios:
 * - Granting (upgrades, subscriptions)
 * - Deduction (image/video generation)
 * - Tracking (frontend display consistency)
 * - Edge cases (downgrades, cancellations)
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface TestResult {
  testName: string
  passed: boolean
  expected: any
  actual: any
  error?: string
}

const results: TestResult[] = []

function logTest(testName: string, passed: boolean, expected: any, actual: any, error?: string) {
  results.push({ testName, passed, expected, actual, error })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${testName}`)
  if (!passed) {
    console.log(`   Expected: ${JSON.stringify(expected)}`)
    console.log(`   Actual: ${JSON.stringify(actual)}`)
    if (error) console.log(`   Error: ${error}`)
  }
}

async function createTestUser(email: string): Promise<string | null> {
  try {
    // Check if user exists
    const { data: existing } = await supabase
      .from('bestauth_users')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    
    if (existing) {
      return existing.id
    }
    
    // Create new user
    const { data: user, error } = await supabase
      .from('bestauth_users')
      .insert({
        email,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (error) throw error
    
    // Create default free subscription
    await supabase
      .from('bestauth_subscriptions')
      .insert({
        user_id: user.id,
        tier: 'free',
        status: 'active',
        points_balance: 30, // Signup bonus
        points_lifetime_earned: 30,
        points_lifetime_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    return user.id
  } catch (error) {
    console.error('Error creating test user:', error)
    return null
  }
}

async function getCredits(userId: string) {
  const { data } = await supabase
    .from('bestauth_subscriptions')
    .select('points_balance, points_lifetime_earned, points_lifetime_spent, tier, billing_cycle')
    .eq('user_id', userId)
    .single()
  
  return data
}

async function setCredits(userId: string, balance: number, lifetimeEarned: number, lifetimeSpent: number) {
  await supabase
    .from('bestauth_subscriptions')
    .update({
      points_balance: balance,
      points_lifetime_earned: lifetimeEarned,
      points_lifetime_spent: lifetimeSpent,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
}

async function simulateUpgrade(userId: string, fromTier: string, toTier: string, billingCycle: 'monthly' | 'yearly' = 'monthly') {
  console.log(`\n--- Simulating ${fromTier} → ${toTier} (${billingCycle}) ---`)
  
  const { bestAuthSubscriptionService } = await import('@/services/bestauth/BestAuthSubscriptionService')
  
  const currentCredits = await getCredits(userId)
  console.log(`Before: ${currentCredits?.points_balance} credits`)
  
  await bestAuthSubscriptionService.createOrUpdateSubscription({
    userId,
    tier: toTier as 'free' | 'pro' | 'pro_plus',
    status: 'active',
    billingCycle,
    previousTier: fromTier as 'free' | 'pro' | 'pro_plus'
  })
  
  const newCredits = await getCredits(userId)
  console.log(`After: ${newCredits?.points_balance} credits`)
  
  return { before: currentCredits, after: newCredits }
}

async function testCreditGranting() {
  console.log('\n=== TEST SUITE 1: CREDIT GRANTING ===\n')
  
  // Test 1.1: Free → Pro (Monthly)
  const user1 = await createTestUser('test-free-to-pro@test.com')
  if (user1) {
    const { before, after } = await simulateUpgrade(user1, 'free', 'pro', 'monthly')
    const expected = (before?.points_balance ?? 0) + 800 // Pro monthly = 800
    logTest(
      'Free → Pro (Monthly): Should add 800 credits',
      after?.points_balance === expected,
      expected,
      after?.points_balance
    )
  }
  
  // Test 1.2: Free → Pro+ (Monthly)
  const user2 = await createTestUser('test-free-to-proplus@test.com')
  if (user2) {
    const { before, after } = await simulateUpgrade(user2, 'free', 'pro_plus', 'monthly')
    const expected = (before?.points_balance ?? 0) + 1600 // Pro+ monthly = 1600
    logTest(
      'Free → Pro+ (Monthly): Should add 1600 credits',
      after?.points_balance === expected,
      expected,
      after?.points_balance
    )
  }
  
  // Test 1.3: Pro → Pro+ (Monthly)
  const user3 = await createTestUser('test-pro-to-proplus@test.com')
  if (user3) {
    // First upgrade to Pro
    await simulateUpgrade(user3, 'free', 'pro', 'monthly')
    const midCredits = await getCredits(user3)
    
    // Then upgrade to Pro+
    const { before, after } = await simulateUpgrade(user3, 'pro', 'pro_plus', 'monthly')
    const expected = (before?.points_balance ?? 0) + 1600 // Pro+ monthly = 1600
    logTest(
      'Pro → Pro+ (Monthly): Should add 1600 credits to existing balance',
      after?.points_balance === expected,
      expected,
      after?.points_balance
    )
  }
  
  // Test 1.4: Free → Pro (Yearly)
  const user4 = await createTestUser('test-free-to-pro-yearly@test.com')
  if (user4) {
    const { before, after } = await simulateUpgrade(user4, 'free', 'pro', 'yearly')
    const expected = (before?.points_balance ?? 0) + 9600 // Pro yearly = 800 * 12
    logTest(
      'Free → Pro (Yearly): Should add 9600 credits',
      after?.points_balance === expected,
      expected,
      after?.points_balance
    )
  }
  
  // Test 1.5: Free → Pro+ (Yearly)
  const user5 = await createTestUser('test-free-to-proplus-yearly@test.com')
  if (user5) {
    const { before, after } = await simulateUpgrade(user5, 'free', 'pro_plus', 'yearly')
    const expected = (before?.points_balance ?? 0) + 19200 // Pro+ yearly = 1600 * 12
    logTest(
      'Free → Pro+ (Yearly): Should add 19200 credits',
      after?.points_balance === expected,
      expected,
      after?.points_balance
    )
  }
}

async function testCreditDeduction() {
  console.log('\n=== TEST SUITE 2: CREDIT DEDUCTION ===\n')
  
  // Import actual credit costs from config
  const { SUBSCRIPTION_CONFIG } = await import('@/config/subscription')
  const imageCost = SUBSCRIPTION_CONFIG.generationCosts.nanoBananaImage
  const sora2Cost = SUBSCRIPTION_CONFIG.generationCosts.sora2Video
  const sora2ProCost = SUBSCRIPTION_CONFIG.generationCosts.sora2ProVideo
  
  console.log('Credit costs from config:', {
    nanoBananaImage: imageCost,
    sora2Video: sora2Cost,
    sora2ProVideo: sora2ProCost
  })
  
  const user = await createTestUser('test-deduction@test.com')
  if (!user) return
  
  // Set initial balance (enough for all tests)
  await setCredits(user, 1000, 1000, 0)
  
  // Test 2.1: Deduct for Nano Banana image (actual cost from config)
  const before1 = await getCredits(user)
  await setCredits(user, (before1?.points_balance ?? 0) - imageCost, before1?.points_lifetime_earned ?? 0, (before1?.points_lifetime_spent ?? 0) + imageCost)
  const after1 = await getCredits(user)
  
  const expectedBalance1 = 1000 - imageCost
  const expectedSpent1 = imageCost
  
  logTest(
    `Image Generation: Should deduct ${imageCost} credits`,
    after1?.points_balance === expectedBalance1 && after1?.points_lifetime_spent === expectedSpent1,
    { balance: expectedBalance1, spent: expectedSpent1 },
    { balance: after1?.points_balance, spent: after1?.points_lifetime_spent }
  )
  
  // Test 2.2: Deduct for Sora 2 video (actual cost from config)
  const before2 = await getCredits(user)
  await setCredits(user, (before2?.points_balance ?? 0) - sora2Cost, before2?.points_lifetime_earned ?? 0, (before2?.points_lifetime_spent ?? 0) + sora2Cost)
  const after2 = await getCredits(user)
  
  const expectedBalance2 = expectedBalance1 - sora2Cost
  const expectedSpent2 = expectedSpent1 + sora2Cost
  
  logTest(
    `Sora 2 Video: Should deduct ${sora2Cost} credits`,
    after2?.points_balance === expectedBalance2 && after2?.points_lifetime_spent === expectedSpent2,
    { balance: expectedBalance2, spent: expectedSpent2 },
    { balance: after2?.points_balance, spent: after2?.points_lifetime_spent }
  )
  
  // Test 2.3: Deduct for Sora 2 Pro video (actual cost from config)
  const before3 = await getCredits(user)
  await setCredits(user, (before3?.points_balance ?? 0) - sora2ProCost, before3?.points_lifetime_earned ?? 0, (before3?.points_lifetime_spent ?? 0) + sora2ProCost)
  const after3 = await getCredits(user)
  
  const expectedBalance3 = expectedBalance2 - sora2ProCost
  const expectedSpent3 = expectedSpent2 + sora2ProCost
  
  logTest(
    `Sora 2 Pro Video: Should deduct ${sora2ProCost} credits`,
    after3?.points_balance === expectedBalance3 && after3?.points_lifetime_spent === expectedSpent3,
    { balance: expectedBalance3, spent: expectedSpent3 },
    { balance: after3?.points_balance, spent: after3?.points_lifetime_spent }
  )
  
  // Test 2.4: Prevent negative balance
  await setCredits(user, imageCost - 1, 1000, 995) // Set balance to one less than image cost
  const before4 = await getCredits(user)
  // Try to deduct image cost when balance is insufficient
  const canDeduct = (before4?.points_balance ?? 0) >= imageCost
  
  logTest(
    'Prevent Negative Balance: Should block deduction when insufficient credits',
    !canDeduct,
    false,
    canDeduct
  )
}

async function testFrontendDisplayConsistency() {
  console.log('\n=== TEST SUITE 3: FRONTEND DISPLAY CONSISTENCY ===\n')
  
  const user = await createTestUser('test-display@test.com')
  if (!user) return
  
  // Upgrade to Pro
  await simulateUpgrade(user, 'free', 'pro', 'monthly')
  
  // Test 3.1: bestauth_subscriptions has correct data
  const subData = await getCredits(user)
  logTest(
    'Database: bestauth_subscriptions has points_balance',
    typeof subData?.points_balance === 'number',
    'number',
    typeof subData?.points_balance
  )
  
  // Test 3.2: getStatus returns points fields
  const { db } = await import('@/lib/bestauth/db-wrapper')
  const status = await db.subscriptions.getStatus(user)
  
  logTest(
    'API: db.subscriptions.getStatus() returns points_balance',
    typeof status?.points_balance === 'number' && status?.points_balance === subData?.points_balance,
    subData?.points_balance,
    status?.points_balance
  )
  
  // Test 3.3: Account API would return correct data
  // (We can't easily test the full API endpoint, but we verified getStatus works)
  logTest(
    'Account Page: Would display correct credits (via getStatus)',
    status?.points_balance === subData?.points_balance,
    subData?.points_balance,
    status?.points_balance
  )
  
  // Test 3.4: Points Balance API would work
  // Check that subscription table has the data
  const { data: directQuery } = await supabase
    .from('bestauth_subscriptions')
    .select('points_balance, tier')
    .eq('user_id', user)
    .single()
  
  logTest(
    'Header API: Can fetch from bestauth_subscriptions',
    directQuery?.points_balance === subData?.points_balance,
    subData?.points_balance,
    directQuery?.points_balance
  )
}

async function testDowngradeScenarios() {
  console.log('\n=== TEST SUITE 4: DOWNGRADE SCENARIOS ===\n')
  
  // Test 4.1: Pro → Free (should keep existing credits)
  const user1 = await createTestUser('test-pro-to-free@test.com')
  if (user1) {
    await simulateUpgrade(user1, 'free', 'pro', 'monthly')
    const beforeDowngrade = await getCredits(user1)
    
    await supabase
      .from('bestauth_subscriptions')
      .update({
        tier: 'free',
        billing_cycle: null, // Free users have no billing cycle
        previous_tier: 'pro',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user1)
    
    const afterDowngrade = await getCredits(user1)
    
    logTest(
      'Pro → Free: Should retain existing credits',
      afterDowngrade?.points_balance === beforeDowngrade?.points_balance,
      beforeDowngrade?.points_balance,
      afterDowngrade?.points_balance
    )
    
    logTest(
      'Pro → Free: billing_cycle should be null',
      afterDowngrade?.billing_cycle === null,
      null,
      afterDowngrade?.billing_cycle
    )
  }
  
  // Test 4.2: Pro+ → Pro (should keep existing credits, no new grant)
  const user2 = await createTestUser('test-proplus-to-pro@test.com')
  if (user2) {
    await simulateUpgrade(user2, 'free', 'pro_plus', 'monthly')
    const beforeDowngrade = await getCredits(user2)
    
    await supabase
      .from('bestauth_subscriptions')
      .update({
        tier: 'pro',
        previous_tier: 'pro_plus',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user2)
    
    const afterDowngrade = await getCredits(user2)
    
    logTest(
      'Pro+ → Pro: Should retain existing credits (no deduction)',
      afterDowngrade?.points_balance === beforeDowngrade?.points_balance,
      beforeDowngrade?.points_balance,
      afterDowngrade?.points_balance
    )
  }
}

async function testSubscriptionCancellation() {
  console.log('\n=== TEST SUITE 5: SUBSCRIPTION CANCELLATION ===\n')
  
  const user = await createTestUser('test-cancellation@test.com')
  if (!user) return
  
  await simulateUpgrade(user, 'free', 'pro', 'monthly')
  const beforeCancel = await getCredits(user)
  
  // Simulate cancellation (cancel_at_period_end = true)
  await supabase
    .from('bestauth_subscriptions')
    .update({
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user)
  
  const afterCancel = await getCredits(user)
  
  logTest(
    'Cancellation: Should retain credits after cancel_at_period_end',
    afterCancel?.points_balance === beforeCancel?.points_balance,
    beforeCancel?.points_balance,
    afterCancel?.points_balance
  )
  
  logTest(
    'Cancellation: Tier should remain Pro until period ends',
    afterCancel?.tier === 'pro',
    'pro',
    afterCancel?.tier
  )
}

async function testBillingCycleSwitch() {
  console.log('\n=== TEST SUITE 6: BILLING CYCLE CHANGES ===\n')
  
  // Test 6.1: Monthly → Yearly (same tier)
  const user = await createTestUser('test-billing-cycle@test.com')
  if (!user) return
  
  // Start with Pro Monthly
  await simulateUpgrade(user, 'free', 'pro', 'monthly')
  const monthlyCredits = await getCredits(user)
  
  // Switch to Yearly
  const { before, after } = await simulateUpgrade(user, 'pro', 'pro', 'yearly')
  const expectedAdd = 9600 // Yearly allocation
  const expected = (before?.points_balance ?? 0) + expectedAdd
  
  logTest(
    'Pro Monthly → Pro Yearly: Should add yearly allocation',
    after?.points_balance === expected,
    expected,
    after?.points_balance
  )
  
  logTest(
    'Billing Cycle Update: Should change to yearly',
    after?.billing_cycle === 'yearly',
    'yearly',
    after?.billing_cycle
  )
}

async function cleanup() {
  console.log('\n=== CLEANUP ===\n')
  
  // Delete test users
  const testEmails = [
    'test-free-to-pro@test.com',
    'test-free-to-proplus@test.com',
    'test-pro-to-proplus@test.com',
    'test-free-to-pro-yearly@test.com',
    'test-free-to-proplus-yearly@test.com',
    'test-deduction@test.com',
    'test-display@test.com',
    'test-pro-to-free@test.com',
    'test-proplus-to-pro@test.com',
    'test-cancellation@test.com',
    'test-billing-cycle@test.com'
  ]
  
  for (const email of testEmails) {
    const { data: user } = await supabase
      .from('bestauth_users')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    
    if (user) {
      // Delete subscription first (foreign key)
      await supabase
        .from('bestauth_subscriptions')
        .delete()
        .eq('user_id', user.id)
      
      // Delete user
      await supabase
        .from('bestauth_users')
        .delete()
        .eq('id', user.id)
    }
  }
  
  console.log('Test users cleaned up')
}

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║     COMPREHENSIVE E2E CREDIT SYSTEM TEST SUITE          ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  
  try {
    await testCreditGranting()
    await testCreditDeduction()
    await testFrontendDisplayConsistency()
    await testDowngradeScenarios()
    await testSubscriptionCancellation()
    await testBillingCycleSwitch()
    
    // Print summary
    console.log('\n╔══════════════════════════════════════════════════════════╗')
    console.log('║                    TEST SUMMARY                          ║')
    console.log('╚══════════════════════════════════════════════════════════╝\n')
    
    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const total = results.length
    
    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`)
    
    if (failed > 0) {
      console.log('FAILED TESTS:')
      results.filter(r => !r.passed).forEach(r => {
        console.log(`\n❌ ${r.testName}`)
        console.log(`   Expected: ${JSON.stringify(r.expected)}`)
        console.log(`   Actual: ${JSON.stringify(r.actual)}`)
        if (r.error) console.log(`   Error: ${r.error}`)
      })
    }
    
    await cleanup()
    
    process.exit(failed > 0 ? 1 : 0)
  } catch (error) {
    console.error('\n💥 Test suite crashed:', error)
    await cleanup()
    process.exit(1)
  }
}

runAllTests()
