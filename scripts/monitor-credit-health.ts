#!/usr/bin/env tsx
/**
 * Credit System Health Monitor
 * 
 * Continuously checks for credit system anomalies:
 * - Paid users with 0 balance
 * - Failed deductions
 * - Missing user mappings
 * - Subscription/balance mismatches
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface HealthCheck {
  timestamp: string
  paidUsersWithZeroBalance: Array<{ email: string; tier: string }>
  usersWithoutMapping: Array<{ email: string; id: string }>
  recentFailedDeductions: Array<{ user_id: string; error: string; timestamp: string }>
  balanceIntegrityIssues: Array<{ email: string; issue: string }>
  overallHealth: 'healthy' | 'warning' | 'critical'
}

async function checkHealth(): Promise<HealthCheck> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  const result: HealthCheck = {
    timestamp: new Date().toISOString(),
    paidUsersWithZeroBalance: [],
    usersWithoutMapping: [],
    recentFailedDeductions: [],
    balanceIntegrityIssues: [],
    overallHealth: 'healthy'
  }
  
  console.log('='.repeat(80))
  console.log('CREDIT SYSTEM HEALTH CHECK')
  console.log('='.repeat(80))
  console.log(`Time: ${new Date().toLocaleString()}\n`)
  
  // 1. Check for paid users with 0 balance
  console.log('Check 1: Paid users with zero balance...')
  const { data: paidSubs } = await supabase
    .from('subscriptions_consolidated')
    .select('user_id, tier, status, points_balance')
    .in('tier', ['pro', 'pro_plus'])
    .eq('status', 'active')
  
  if (paidSubs) {
    for (const sub of paidSubs) {
      if (!sub.points_balance || sub.points_balance === 0) {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('email')
          .eq('id', sub.user_id)
          .single()
        
        result.paidUsersWithZeroBalance.push({
          email: user?.email || 'unknown',
          tier: sub.tier
        })
      }
    }
  }
  
  if (result.paidUsersWithZeroBalance.length > 0) {
    console.log(`❌ Found ${result.paidUsersWithZeroBalance.length} paid users with 0 balance:`)
    result.paidUsersWithZeroBalance.forEach(u => console.log(`   - ${u.email} (${u.tier})`))
    result.overallHealth = 'critical'
  } else {
    console.log('✅ All paid users have credits\n')
  }
  
  // 2. Check for users without mapping
  console.log('Check 2: Users without ID mapping...')
  const { data: allUsers } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .limit(1000)
  
  if (allUsers) {
    for (const user of allUsers) {
      const { data: mapping } = await supabase
        .from('user_id_mapping')
        .select('supabase_user_id')
        .eq('bestauth_user_id', user.id)
        .maybeSingle()
      
      if (!mapping) {
        result.usersWithoutMapping.push({
          email: user.email,
          id: user.id
        })
      }
    }
  }
  
  if (result.usersWithoutMapping.length > 0) {
    console.log(`⚠️  Found ${result.usersWithoutMapping.length} users without mapping`)
    if (result.overallHealth === 'healthy') result.overallHealth = 'warning'
  } else {
    console.log('✅ All users have ID mappings\n')
  }
  
  // 3. Check for recent failed transactions
  console.log('Check 3: Recent failed deductions...')
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  
  const { data: recentTransactions } = await supabase
    .from('points_transactions')
    .select('user_id, metadata, created_at')
    .gte('created_at', oneHourAgo)
    .order('created_at', { ascending: false })
  
  if (recentTransactions) {
    for (const tx of recentTransactions) {
      if (tx.metadata?.error || tx.metadata?.failed) {
        result.recentFailedDeductions.push({
          user_id: tx.user_id,
          error: tx.metadata.error || 'Unknown error',
          timestamp: tx.created_at
        })
      }
    }
  }
  
  if (result.recentFailedDeductions.length > 0) {
    console.log(`⚠️  Found ${result.recentFailedDeductions.length} failed deductions in last hour`)
    if (result.overallHealth === 'healthy') result.overallHealth = 'warning'
  } else {
    console.log('✅ No failed deductions in last hour\n')
  }
  
  // 4. Check balance integrity
  console.log('Check 4: Balance integrity...')
  const { data: balances } = await supabase
    .from('points_balances')
    .select('user_id, balance, lifetime_earned, lifetime_spent')
  
  if (balances) {
    for (const balance of balances) {
      const calculatedBalance = balance.lifetime_earned - balance.lifetime_spent
      
      if (Math.abs(calculatedBalance - balance.balance) > 1) {
        const { data: user } = await supabase
          .from('bestauth_users')
          .select('email')
          .eq('id', balance.user_id)
          .maybeSingle()
        
        result.balanceIntegrityIssues.push({
          email: user?.email || balance.user_id,
          issue: `Balance mismatch: stored=${balance.balance}, calculated=${calculatedBalance}`
        })
      }
    }
  }
  
  if (result.balanceIntegrityIssues.length > 0) {
    console.log(`⚠️  Found ${result.balanceIntegrityIssues.length} balance integrity issues`)
    if (result.overallHealth === 'healthy') result.overallHealth = 'warning'
  } else {
    console.log('✅ All balances are consistent\n')
  }
  
  // 5. Summary
  console.log('='.repeat(80))
  console.log('HEALTH SUMMARY')
  console.log('='.repeat(80))
  
  const healthEmoji = {
    healthy: '✅',
    warning: '⚠️ ',
    critical: '❌'
  }
  
  console.log(`Overall Health: ${healthEmoji[result.overallHealth]} ${result.overallHealth.toUpperCase()}`)
  console.log(`\nIssues Found:`)
  console.log(`  - Paid users with 0 balance: ${result.paidUsersWithZeroBalance.length}`)
  console.log(`  - Users without mapping: ${result.usersWithoutMapping.length}`)
  console.log(`  - Failed deductions (1h): ${result.recentFailedDeductions.length}`)
  console.log(`  - Balance integrity issues: ${result.balanceIntegrityIssues.length}`)
  
  if (result.overallHealth === 'critical') {
    console.log('\n🚨 CRITICAL: Run audit-and-fix-all-credits.ts --live to fix!')
  } else if (result.overallHealth === 'warning') {
    console.log('\n⚠️  WARNING: Some issues detected. Review and fix as needed.')
  } else {
    console.log('\n✅ All systems healthy!')
  }
  
  return result
}

// Main
async function main() {
  await checkHealth()
}

main().catch(console.error)
