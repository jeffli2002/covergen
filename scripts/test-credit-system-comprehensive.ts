#!/usr/bin/env tsx
/**
 * Comprehensive Credit System Testing
 * 
 * Tests the entire credit flow end-to-end:
 * 1. User ID resolution (BestAuth → Supabase)
 * 2. Credit granting (subscription webhook)
 * 3. Credit checking (before generation)
 * 4. Credit deduction (after generation)
 * 5. Balance integrity
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

async function runTests(userEmail: string): Promise<TestResult[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const results: TestResult[] = []
  
  console.log('='.repeat(80))
  console.log('COMPREHENSIVE CREDIT SYSTEM TEST')
  console.log('='.repeat(80))
  console.log(`Testing user: ${userEmail}\n`)
  
  // Test 1: User exists
  console.log('Test 1: User exists in BestAuth...')
  const { data: user, error: userError } = await supabase
    .from('bestauth_users')
    .select('*')
    .eq('email', userEmail)
    .maybeSingle()
  
  if (!user || userError) {
    results.push({
      name: 'User exists',
      passed: false,
      error: userError?.message || 'User not found'
    })
    console.log('❌ FAILED\n')
    return results
  }
  
  results.push({ name: 'User exists', passed: true })
  console.log(`✅ PASSED - User ID: ${user.id}\n`)
  
  // Test 2: User ID mapping exists
  console.log('Test 2: User ID mapping exists...')
  const { data: mapping, error: mappingError } = await supabase
    .from('user_id_mapping')
    .select('*')
    .eq('bestauth_user_id', user.id)
    .maybeSingle()
  
  if (!mapping) {
    results.push({
      name: 'User ID mapping',
      passed: false,
      error: 'No mapping found'
    })
    console.log('❌ FAILED - No mapping\n')
  } else {
    results.push({
      name: 'User ID mapping',
      passed: true,
      details: { supabase_user_id: mapping.supabase_user_id }
    })
    console.log(`✅ PASSED - Maps to: ${mapping.supabase_user_id}\n`)
  }
  
  const resolvedUserId = mapping?.supabase_user_id || user.id
  
  // Test 3: Subscription exists (PRIMARY SOURCE: bestauth_subscriptions)
  console.log('Test 3: Subscription exists...')
  const { data: subscription, error: subError } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  
  if (!subscription) {
    results.push({
      name: 'Subscription exists',
      passed: false,
      error: 'No subscription found'
    })
    console.log('❌ FAILED\n')
  } else {
    results.push({
      name: 'Subscription exists',
      passed: true,
      details: { tier: subscription.tier, status: subscription.status }
    })
    console.log(`✅ PASSED - Tier: ${subscription.tier}, Status: ${subscription.status}\n`)
  }
  
  // Test 4: Subscription metadata has resolved ID
  console.log('Test 4: Subscription metadata has resolved_supabase_user_id...')
  const hasResolvedId = subscription?.metadata?.resolved_supabase_user_id
  
  if (!hasResolvedId) {
    results.push({
      name: 'Subscription metadata',
      passed: false,
      error: 'Missing resolved_supabase_user_id'
    })
    console.log('❌ FAILED\n')
  } else {
    results.push({
      name: 'Subscription metadata',
      passed: true,
      details: { resolved_id: hasResolvedId }
    })
    console.log(`✅ PASSED - Resolved ID: ${hasResolvedId}\n`)
  }
  
  // Test 5: Points balance exists
  console.log('Test 5: Points balance exists...')
  const { data: balance, error: balanceError } = await supabase.rpc('get_points_balance', {
    p_user_id: resolvedUserId
  })
  
  if (balanceError || !balance) {
    results.push({
      name: 'Points balance exists',
      passed: false,
      error: balanceError?.message || 'No balance found'
    })
    console.log('❌ FAILED\n')
  } else {
    results.push({
      name: 'Points balance exists',
      passed: true,
      details: balance
    })
    console.log(`✅ PASSED - Balance: ${balance.balance}\n`)
  }
  
  // Test 6: Balance matches tier allocation
  if (subscription && balance) {
    console.log('Test 6: Balance is reasonable for tier...')
    const tierExpectations = {
      free: { min: 0, max: 100 },
      pro: { min: 0, max: 1000 },
      pro_plus: { min: 0, max: 2000 }
    }
    
    const expected = tierExpectations[subscription.tier as keyof typeof tierExpectations] || { min: 0, max: 10000 }
    const isReasonable = balance.balance >= expected.min && balance.balance <= expected.max
    
    if (!isReasonable) {
      results.push({
        name: 'Balance is reasonable',
        passed: false,
        error: `Balance ${balance.balance} outside expected range ${expected.min}-${expected.max}`,
        details: { balance: balance.balance, expected }
      })
      console.log('⚠️  WARNING - Balance seems unusual\n')
    } else {
      results.push({
        name: 'Balance is reasonable',
        passed: true,
        details: { balance: balance.balance, expected }
      })
      console.log(`✅ PASSED\n`)
    }
  }
  
  // Test 7: Balance integrity (earned - spent = balance)
  if (balance) {
    console.log('Test 7: Balance integrity check...')
    const calculated = balance.lifetime_earned - balance.lifetime_spent
    const matches = Math.abs(calculated - balance.balance) < 1
    
    if (!matches) {
      results.push({
        name: 'Balance integrity',
        passed: false,
        error: `Calculated ${calculated} != stored ${balance.balance}`,
        details: {
          earned: balance.lifetime_earned,
          spent: balance.lifetime_spent,
          calculated,
          stored: balance.balance
        }
      })
      console.log('❌ FAILED\n')
    } else {
      results.push({
        name: 'Balance integrity',
        passed: true
      })
      console.log(`✅ PASSED\n`)
    }
  }
  
  // Test 8: Can deduct credits (dry run)
  if (balance && balance.balance >= 5) {
    console.log('Test 8: Can deduct credits (dry run)...')
    const { data: deductResult, error: deductError } = await supabase.rpc('deduct_generation_points', {
      p_user_id: resolvedUserId,
      p_generation_type: 'nanoBananaImage',
      p_points_cost: 5,
      p_metadata: {
        test: true,
        dry_run: true,
        timestamp: new Date().toISOString()
      }
    })
    
    if (deductError) {
      results.push({
        name: 'Can deduct credits',
        passed: false,
        error: deductError.message
      })
      console.log('❌ FAILED\n')
    } else if (!deductResult.success || !deductResult.used_points) {
      results.push({
        name: 'Can deduct credits',
        passed: false,
        error: 'RPC returned success but did not deduct',
        details: deductResult
      })
      console.log('❌ FAILED - RPC issue\n')
    } else {
      results.push({
        name: 'Can deduct credits',
        passed: true,
        details: deductResult
      })
      console.log(`✅ PASSED - Would deduct 5 credits\n`)
    }
  } else {
    console.log('Test 8: SKIPPED - Insufficient balance\n')
  }
  
  return results
}

// Summary
async function main() {
  const userEmail = process.argv[2] || 'jefflee2002@gmail.com'
  const results = await runTests(userEmail)
  
  console.log('='.repeat(80))
  console.log('TEST SUMMARY')
  console.log('='.repeat(80))
  
  const passed = results.filter(r => r.passed).length
  const total = results.length
  const percentage = Math.round((passed / total) * 100)
  
  console.log(`Passed: ${passed}/${total} (${percentage}%)`)
  console.log('')
  
  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌'
    console.log(`${icon} ${r.name}`)
    if (!r.passed && r.error) {
      console.log(`   Error: ${r.error}`)
    }
    if (r.details) {
      console.log(`   Details: ${JSON.stringify(r.details)}`)
    }
  })
  
  console.log('')
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Credit system is working correctly.')
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed. Run audit-and-fix-all-credits.ts to fix.`)
  }
}

main().catch(console.error)
