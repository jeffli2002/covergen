#!/usr/bin/env npx tsx
/**
 * Test all credit deduction scenarios for a user
 * Tests both image and video generation credit deductions
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const email = process.argv[2] || '994235892@qq.com'

const GENERATION_TYPES = {
  nanoBananaImage: { cost: 5, name: 'Image Generation' },
  sora2Video: { cost: 20, name: 'Standard Video' },
  sora2ProVideo: { cost: 80, name: 'Pro Video' },
}

async function testAllCreditDeductions() {
  console.log('='.repeat(80))
  console.log('COMPREHENSIVE CREDIT DEDUCTION TEST')
  console.log('='.repeat(80))
  console.log(`User: ${email}\n`)
  
  // Get user
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id, email')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  console.log(`✅ User found: ${user.email}`)
  console.log(`   User ID: ${user.id}\n`)
  
  // Get subscription
  const { data: subscription } = await supabase
    .from('bestauth_subscriptions')
    .select('points_balance, points_lifetime_spent, tier')
    .eq('user_id', user.id)
    .single()
  
  if (!subscription) {
    console.log('❌ No subscription found')
    return
  }
  
  console.log(`📊 Current Status:`)
  console.log(`   Tier: ${subscription.tier}`)
  console.log(`   Balance: ${subscription.points_balance} credits`)
  console.log(`   Lifetime spent: ${subscription.points_lifetime_spent || 0} credits\n`)
  
  // Test each generation type
  let currentBalance = subscription.points_balance
  let currentSpent = subscription.points_lifetime_spent ?? 0
  
  for (const [type, info] of Object.entries(GENERATION_TYPES)) {
    console.log(`Testing ${info.name} (${type}) - ${info.cost} credits`)
    
    if (currentBalance < info.cost) {
      console.log(`❌ Insufficient balance (${currentBalance} < ${info.cost})`)
      console.log()
      continue
    }
    
    const newBalance = currentBalance - info.cost
    const newSpent = currentSpent + info.cost
    
    // Update subscription
    const { error: updateError } = await supabase
      .from('bestauth_subscriptions')
      .update({
        points_balance: newBalance,
        points_lifetime_spent: newSpent,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
    
    if (updateError) {
      console.log(`❌ Failed to deduct: ${updateError.message}`)
      console.log()
      continue
    }
    
    // Create transaction
    const { error: txError } = await supabase
      .from('bestauth_points_transactions')
      .insert({
        user_id: user.id,
        amount: -info.cost,
        balance_after: newBalance,
        transaction_type: 'generation_deduction',
        generation_type: type,
        description: `Test ${info.name}`,
        metadata: { test: true }
      })
    
    if (txError) {
      console.log(`⚠️  Transaction record failed: ${txError.message}`)
    } else {
      console.log(`✅ Deducted: ${currentBalance} → ${newBalance}`)
      console.log(`✅ Transaction created`)
    }
    
    currentBalance = newBalance
    currentSpent = newSpent
    console.log()
  }
  
  console.log('='.repeat(80))
  console.log('FINAL STATUS')
  console.log('='.repeat(80))
  console.log(`Balance: ${subscription.points_balance} → ${currentBalance}`)
  console.log(`Lifetime spent: ${subscription.points_lifetime_spent || 0} → ${currentSpent}`)
  console.log(`Total deducted: ${(subscription.points_balance - currentBalance)} credits\n`)
  
  // Show recent transactions
  const { data: transactions } = await supabase
    .from('bestauth_points_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  
  console.log('📜 Recent Transactions:')
  if (transactions && transactions.length > 0) {
    transactions.forEach((tx, i) => {
      console.log(`${i + 1}. ${tx.amount > 0 ? '+' : ''}${tx.amount} credits | ${tx.description}`)
      console.log(`   Type: ${tx.generation_type || 'N/A'} | Balance: ${tx.balance_after}`)
      console.log(`   ${new Date(tx.created_at).toLocaleString()}`)
    })
  } else {
    console.log('No transactions found')
  }
}

testAllCreditDeductions().catch(console.error)
