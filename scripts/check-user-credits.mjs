#!/usr/bin/env node

/**
 * Check user credits and diagnose Pro user credit issue
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env vars
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const email = process.argv[2] || '994235892@qq.com'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log(`\n🔍 Checking credits for: ${email}\n`)

// 1. Find user in auth.users
const { data: authUsers } = await supabase.auth.admin.listUsers()
const authUser = authUsers?.users?.find(u => u.email === email)

if (!authUser) {
  console.error('❌ User not found in auth.users')
  process.exit(1)
}

console.log('✅ User found in auth.users:', authUser.id)

// 2. Get BestAuth user
const { data: bestAuthUser } = await supabase
  .from('bestauth_users')
  .select('id, email, name')
  .eq('email', email)
  .maybeSingle()

console.log('BestAuth User:', bestAuthUser?.id || 'NOT FOUND')

// 3. Get subscription from subscriptions_consolidated
const { data: subscription } = await supabase
  .from('subscriptions_consolidated')
  .select('*')
  .eq('user_id', authUser.id)
  .maybeSingle()

console.log('\n📋 SUBSCRIPTION (subscriptions_consolidated):')
if (subscription) {
  console.log('   Tier:', subscription.tier)
  console.log('   Status:', subscription.status)
  console.log('   Billing Cycle:', subscription.billing_cycle)
  console.log('   Points Balance:', subscription.points_balance)
  console.log('   Lifetime Earned:', subscription.points_lifetime_earned)
  console.log('   Lifetime Spent:', subscription.points_lifetime_spent)
} else {
  console.log('   ❌ No subscription found')
}

// 4. Get BestAuth subscription
const { data: bestAuthSub } = await supabase
  .from('bestauth_subscriptions')
  .select('*')
  .eq('user_id', bestAuthUser?.id || 'none')
  .maybeSingle()

console.log('\n📋 BESTAUTH SUBSCRIPTION:')
if (bestAuthSub) {
  console.log('   Tier:', bestAuthSub.tier)
  console.log('   Status:', bestAuthSub.status)
  console.log('   Billing Cycle:', bestAuthSub.billing_cycle)
  console.log('   Stripe Sub ID:', bestAuthSub.stripe_subscription_id)
} else {
  console.log('   ❌ No BestAuth subscription found')
}

// 5. Get points transactions
const { data: transactions } = await supabase
  .from('points_transactions')
  .select('*')
  .eq('user_id', authUser.id)
  .order('created_at', { ascending: false })
  .limit(10)

console.log('\n💰 POINTS TRANSACTIONS (last 10):')
if (transactions && transactions.length > 0) {
  transactions.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.transaction_type}: ${t.amount > 0 ? '+' : ''}${t.amount} → balance: ${t.balance_after}`)
    console.log(`      ${t.description || 'No description'}`)
    console.log(`      ${new Date(t.created_at).toLocaleString()}`)
  })
} else {
  console.log('   ❌ No transactions found')
}

// 6. Calculate expected credits
console.log('\n🧮 CREDIT CALCULATION:')
const monthlyAllowance = subscription?.tier === 'pro' ? 800 : 
                         subscription?.tier === 'pro_plus' ? 1600 : 0
const currentBalance = subscription?.points_balance || 0
const normalizedBalance = Math.min(currentBalance, monthlyAllowance)
const calculatedUsed = monthlyAllowance > 0 ? Math.max(0, monthlyAllowance - normalizedBalance) : 0

console.log('   Monthly Allowance:', monthlyAllowance)
console.log('   Current Balance:', currentBalance)
console.log('   Normalized Balance:', normalizedBalance)
console.log('   Calculated Used:', calculatedUsed)

// 7. Diagnosis
console.log('\n🔬 DIAGNOSIS:')
if (subscription?.tier === 'pro' || subscription?.tier === 'pro_plus') {
  if (currentBalance === 0) {
    console.log('   ❌ ISSUE: Pro/Pro+ user has 0 balance')
    console.log('   ❌ Expected:', monthlyAllowance, 'credits')
    console.log('   ❌ Has subscription_grant transaction:', transactions?.some(t => t.transaction_type === 'subscription_grant') ? 'YES' : 'NO')
    
    if (!transactions?.some(t => t.transaction_type === 'subscription_grant')) {
      console.log('\n   🚨 ROOT CAUSE: Credits were never granted when Pro subscription was activated')
      console.log('   📝 FIX: Need to call add_points with subscription_grant type')
    }
  } else if (currentBalance > 0 && currentBalance < monthlyAllowance) {
    console.log('   ⚠️  Partial credits used:', monthlyAllowance - currentBalance)
  } else {
    console.log('   ✅ Credits look correct')
  }
}

console.log('\n')
