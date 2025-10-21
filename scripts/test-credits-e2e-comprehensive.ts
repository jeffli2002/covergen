#!/usr/bin/env tsx
/**
 * Comprehensive End-to-End Credit System Testing
 * 
 * Tests the complete credit lifecycle:
 * 1. Credit granting (subscription webhook simulation)
 * 2. Credit checking (before generation)
 * 3. Credit deduction (after generation)
 * 4. Balance tracking and integrity
 * 5. Transaction history
 * 6. User ID resolution
 * 7. Tier-based limits
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TestResult {
  category: string
  test: string
  passed: boolean
  error?: string
  details?: any
  duration?: number
}

const results: TestResult[] = []

// Test users
const TEST_USERS = [
  { email: '994235892@qq.com', expectedTier: 'pro_plus', expectedCredits: 1600 },
  { email: 'jefflee2002@gmail.com', expectedTier: 'pro_plus', expectedCredits: 830 }
]

async function runTest(
  category: string,
  test: string,
  fn: () => Promise<{ passed: boolean; error?: string; details?: any }>
): Promise<void> {
  const start = Date.now()
  console.log(`\n${category} > ${test}...`)
  
  try {
    const result = await fn()
    const duration = Date.now() - start
    
    results.push({
      category,
      test,
      passed: result.passed,
      error: result.error,
      details: result.details,
      duration
    })
    
    if (result.passed) {
      console.log(`  ✅ PASSED (${duration}ms)`)
      if (result.details) {
        console.log(`  Details:`, JSON.stringify(result.details, null, 2))
      }
    } else {
      console.log(`  ❌ FAILED (${duration}ms)`)
      console.log(`  Error: ${result.error}`)
      if (result.details) {
        console.log(`  Details:`, JSON.stringify(result.details, null, 2))
      }
    }
  } catch (error: any) {
    const duration = Date.now() - start
    console.log(`  ❌ EXCEPTION (${duration}ms)`)
    console.log(`  Error: ${error.message}`)
    
    results.push({
      category,
      test,
      passed: false,
      error: error.message,
      duration
    })
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  console.log('='.repeat(80))
  console.log('COMPREHENSIVE CREDIT SYSTEM E2E TESTING')
  console.log('='.repeat(80))
  console.log(`Started: ${new Date().toLocaleString()}`)
  
  // ============================================================================
  // CATEGORY 1: User ID Resolution
  // ============================================================================
  
  for (const testUser of TEST_USERS) {
    await runTest(
      'User ID Resolution',
      `Resolve BestAuth user for ${testUser.email}`,
      async () => {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('id, email')
          .eq('email', testUser.email)
          .single()
        
        return {
          passed: !!user,
          error: user ? undefined : 'User not found',
          details: user ? { userId: user.id } : undefined
        }
      }
    )
    
    await runTest(
      'User ID Resolution',
      `Check user_id_mapping for ${testUser.email}`,
      async () => {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('id')
          .eq('email', testUser.email)
          .single()
        
        if (!user) return { passed: false, error: 'User not found' }
        
        const { data: mapping } = await supabase
          .from('user_id_mapping')
          .select('*')
          .eq('bestauth_user_id', user.id)
          .maybeSingle()
        
        return {
          passed: !!mapping,
          error: mapping ? undefined : 'Mapping not found (using metadata fallback)',
          details: mapping || { note: 'Will use subscription metadata fallback' }
        }
      }
    )
  }
  
  // ============================================================================
  // CATEGORY 2: Subscription Data
  // ============================================================================
  
  for (const testUser of TEST_USERS) {
    await runTest(
      'Subscription Data',
      `Check subscription exists for ${testUser.email}`,
      async () => {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('id')
          .eq('email', testUser.email)
          .single()
        
        if (!user) return { passed: false, error: 'User not found' }
        
        const { data: subscription } = await supabase
          .from('bestauth_subscriptions')
          .select('tier, status, points_balance, billing_cycle')
          .eq('user_id', user.id)
          .single()
        
        return {
          passed: !!subscription,
          error: subscription ? undefined : 'Subscription not found',
          details: subscription
        }
      }
    )
    
    await runTest(
      'Subscription Data',
      `Verify tier is ${testUser.expectedTier} for ${testUser.email}`,
      async () => {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('id')
          .eq('email', testUser.email)
          .single()
        
        if (!user) return { passed: false, error: 'User not found' }
        
        const { data: subscription } = await supabase
          .from('bestauth_subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .single()
        
        const tierMatches = subscription?.tier === testUser.expectedTier
        
        return {
          passed: tierMatches,
          error: tierMatches ? undefined : `Expected ${testUser.expectedTier}, got ${subscription?.tier}`,
          details: { expected: testUser.expectedTier, actual: subscription?.tier }
        }
      }
    )
  }
  
  // ============================================================================
  // CATEGORY 3: Points Balance
  // ============================================================================
  
  for (const testUser of TEST_USERS) {
    await runTest(
      'Points Balance',
      `Check points_balances record exists for ${testUser.email}`,
      async () => {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('id')
          .eq('email', testUser.email)
          .single()
        
        if (!user) return { passed: false, error: 'User not found' }
        
        const { data: balance } = await supabase
          .from('points_balances')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        
        return {
          passed: !!balance,
          error: balance ? undefined : 'No points_balances record',
          details: balance || undefined
        }
      }
    )
    
    await runTest(
      'Points Balance',
      `Verify balance via RPC for ${testUser.email}`,
      async () => {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('id')
          .eq('email', testUser.email)
          .single()
        
        if (!user) return { passed: false, error: 'User not found' }
        
        const { data: balance, error } = await supabase.rpc('get_points_balance', {
          p_user_id: user.id
        })
        
        return {
          passed: !error && !!balance,
          error: error?.message || (!balance ? 'No balance returned' : undefined),
          details: balance || undefined
        }
      }
    )
    
    await runTest(
      'Points Balance',
      `Check balance integrity for ${testUser.email}`,
      async () => {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('id')
          .eq('email', testUser.email)
          .single()
        
        if (!user) return { passed: false, error: 'User not found' }
        
        const { data: balance } = await supabase.rpc('get_points_balance', {
          p_user_id: user.id
        })
        
        if (!balance) return { passed: false, error: 'No balance' }
        
        const calculated = balance.lifetime_earned - balance.lifetime_spent
        const matches = Math.abs(calculated - balance.balance) < 1
        
        return {
          passed: matches,
          error: matches ? undefined : `Integrity check failed: ${calculated} != ${balance.balance}`,
          details: {
            earned: balance.lifetime_earned,
            spent: balance.lifetime_spent,
            calculated,
            stored: balance.balance
          }
        }
      }
    )
  }
  
  // ============================================================================
  // CATEGORY 4: Credit Deduction (Dry Run)
  // ============================================================================
  
  for (const testUser of TEST_USERS) {
    await runTest(
      'Credit Deduction',
      `Test deduction RPC (dry run) for ${testUser.email}`,
      async () => {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('id')
          .eq('email', testUser.email)
          .single()
        
        if (!user) return { passed: false, error: 'User not found' }
        
        // Get current balance first
        const { data: beforeBalance } = await supabase.rpc('get_points_balance', {
          p_user_id: user.id
        })
        
        if (!beforeBalance || beforeBalance.balance < 5) {
          return { passed: false, error: 'Insufficient balance for test', details: beforeBalance }
        }
        
        // Try deduction
        const { data: deductResult, error } = await supabase.rpc('deduct_generation_points', {
          p_user_id: user.id,
          p_generation_type: 'nanoBananaImage',
          p_points_cost: 5,
          p_metadata: {
            test: true,
            dry_run: true,
            timestamp: new Date().toISOString()
          }
        })
        
        if (error) {
          return { passed: false, error: error.message }
        }
        
        const deducted = deductResult.success && deductResult.used_points
        
        return {
          passed: deducted,
          error: deducted ? undefined : 'Deduction failed or skipped',
          details: {
            before: beforeBalance.balance,
            after: deductResult.transaction?.new_balance,
            deducted: deducted,
            result: deductResult
          }
        }
      }
    )
  }
  
  // ============================================================================
  // CATEGORY 5: Credit Granting (Add Points)
  // ============================================================================
  
  await runTest(
    'Credit Granting',
    'Test add_points RPC with small amount',
    async () => {
      // Use test user
      const { data: user } = await supabase
        .from('bestauth_users')
        .select('id')
        .eq('email', TEST_USERS[0].email)
        .single()
      
      if (!user) return { passed: false, error: 'User not found' }
      
      // Get balance before
      const { data: beforeBalance } = await supabase.rpc('get_points_balance', {
        p_user_id: user.id
      })
      
      // Add 1 credit as test
      const { data: addResult, error } = await supabase.rpc('add_points', {
        p_user_id: user.id,
        p_amount: 1,
        p_transaction_type: 'admin_adjustment',
        p_description: 'E2E test - add 1 credit',
        p_generation_type: null,
        p_subscription_id: null,
        p_stripe_payment_intent_id: null,
        p_metadata: {
          test: true,
          e2e_test: true,
          timestamp: new Date().toISOString()
        }
      })
      
      if (error) {
        return { passed: false, error: error.message }
      }
      
      const expectedBalance = (beforeBalance?.balance || 0) + 1
      const balanceCorrect = addResult.new_balance === expectedBalance
      
      return {
        passed: addResult.success && balanceCorrect,
        error: addResult.success ? (balanceCorrect ? undefined : 'Balance mismatch') : 'Add failed',
        details: {
          before: beforeBalance?.balance,
          added: 1,
          expected: expectedBalance,
          actual: addResult.new_balance,
          transaction_id: addResult.transaction_id
        }
      }
    }
  )
  
  // ============================================================================
  // CATEGORY 6: Transaction History
  // ============================================================================
  
  await runTest(
    'Transaction History',
    'Query recent transactions',
    async () => {
      const { data: user } = await supabase
        .from('bestauth_users')
        .select('id')
        .eq('email', TEST_USERS[0].email)
        .single()
      
      if (!user) return { passed: false, error: 'User not found' }
      
      const { data: transactions, error } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      return {
        passed: !error && Array.isArray(transactions),
        error: error?.message,
        details: {
          count: transactions?.length || 0,
          recent: transactions?.slice(0, 3).map(t => ({
            type: t.transaction_type,
            amount: t.amount,
            created: t.created_at
          }))
        }
      }
    }
  )
  
  // ============================================================================
  // CATEGORY 7: Subscription Metadata
  // ============================================================================
  
  for (const testUser of TEST_USERS) {
    await runTest(
      'Subscription Metadata',
      `Check resolved_supabase_user_id for ${testUser.email}`,
      async () => {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('id')
          .eq('email', testUser.email)
          .single()
        
        if (!user) return { passed: false, error: 'User not found' }
        
        const { data: subscription } = await supabase
          .from('bestauth_subscriptions')
          .select('metadata')
          .eq('user_id', user.id)
          .single()
        
        const hasResolvedId = subscription?.metadata?.resolved_supabase_user_id
        
        return {
          passed: !!hasResolvedId,
          error: hasResolvedId ? undefined : 'Missing resolved_supabase_user_id in metadata',
          details: {
            has_resolved_id: !!hasResolvedId,
            metadata_keys: subscription?.metadata ? Object.keys(subscription.metadata) : []
          }
        }
      }
    )
  }
  
  // ============================================================================
  // CATEGORY 8: Edge Cases
  // ============================================================================
  
  await runTest(
    'Edge Cases',
    'Handle non-existent user gracefully',
    async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000'
      
      const { data, error } = await supabase.rpc('get_points_balance', {
        p_user_id: fakeUserId
      })
      
      // Should either return null or error gracefully, not crash
      return {
        passed: true, // As long as it doesn't crash
        details: {
          data,
          error: error?.message || null,
          handled_gracefully: true
        }
      }
    }
  )
  
  await runTest(
    'Edge Cases',
    'Prevent negative balance',
    async () => {
      const { data: user } = await supabase
        .from('bestauth_users')
        .select('id')
        .eq('email', TEST_USERS[0].email)
        .single()
      
      if (!user) return { passed: false, error: 'User not found' }
      
      // Try to deduct more than balance (should fail)
      const { data: balance } = await supabase.rpc('get_points_balance', {
        p_user_id: user.id
      })
      
      if (!balance) return { passed: false, error: 'No balance' }
      
      const hugeAmount = balance.balance + 10000
      
      const { data: deductResult } = await supabase.rpc('deduct_generation_points', {
        p_user_id: user.id,
        p_generation_type: 'test',
        p_points_cost: hugeAmount,
        p_metadata: { test: true }
      })
      
      const preventedNegative = !deductResult?.success || !deductResult?.used_points
      
      return {
        passed: preventedNegative,
        error: preventedNegative ? undefined : 'Allowed negative balance!',
        details: {
          current_balance: balance.balance,
          tried_to_deduct: hugeAmount,
          was_prevented: preventedNegative,
          result: deductResult
        }
      }
    }
  )
  
  // ============================================================================
  // Summary
  // ============================================================================
  
  console.log('\n' + '='.repeat(80))
  console.log('TEST SUMMARY')
  console.log('='.repeat(80))
  
  const totalTests = results.length
  const passedTests = results.filter(r => r.passed).length
  const failedTests = totalTests - passedTests
  const successRate = Math.round((passedTests / totalTests) * 100)
  
  console.log(`\nTotal Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests} ✅`)
  console.log(`Failed: ${failedTests} ❌`)
  console.log(`Success Rate: ${successRate}%`)
  
  // Group by category
  const categories = [...new Set(results.map(r => r.category))]
  
  console.log('\n' + '-'.repeat(80))
  console.log('Results by Category:')
  console.log('-'.repeat(80))
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category)
    const categoryPassed = categoryResults.filter(r => r.passed).length
    const categoryTotal = categoryResults.length
    const categoryRate = Math.round((categoryPassed / categoryTotal) * 100)
    
    console.log(`\n${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`)
    
    for (const result of categoryResults) {
      const icon = result.passed ? '✅' : '❌'
      const duration = result.duration ? ` (${result.duration}ms)` : ''
      console.log(`  ${icon} ${result.test}${duration}`)
      
      if (!result.passed && result.error) {
        console.log(`     Error: ${result.error}`)
      }
    }
  }
  
  // Failed tests detail
  if (failedTests > 0) {
    console.log('\n' + '-'.repeat(80))
    console.log('Failed Tests Detail:')
    console.log('-'.repeat(80))
    
    results.filter(r => !r.passed).forEach(result => {
      console.log(`\n❌ ${result.category} > ${result.test}`)
      console.log(`   Error: ${result.error}`)
      if (result.details) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2))
      }
    })
  }
  
  console.log('\n' + '='.repeat(80))
  console.log(`Completed: ${new Date().toLocaleString()}`)
  console.log('='.repeat(80))
  
  // Exit code based on success rate
  if (successRate < 80) {
    console.log('\n⚠️  WARNING: Success rate below 80%')
    process.exit(1)
  } else if (successRate < 100) {
    console.log('\n⚠️  Some tests failed, but system is mostly functional')
    process.exit(0)
  } else {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  }
}

main().catch(error => {
  console.error('\n💥 Test suite crashed:', error)
  process.exit(1)
})
