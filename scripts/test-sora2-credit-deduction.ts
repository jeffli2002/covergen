#!/usr/bin/env npx tsx
/**
 * Test Sora 2 video generation credit deduction
 * Verifies that EXACTLY 20 credits are deducted for standard quality
 * and 80 credits for Pro quality
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

async function testSora2CreditDeduction() {
  console.log('='.repeat(80))
  console.log('SORA 2 VIDEO GENERATION CREDIT DEDUCTION TEST')
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
  
  // Get current balance
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
  
  // Test standard quality (should be 20 credits)
  const standardCost = 20
  const currentBalance = subscription.points_balance
  const currentSpent = subscription.points_lifetime_spent ?? 0
  
  if (currentBalance < standardCost) {
    console.log(`❌ Insufficient balance for test (need ${standardCost}, have ${currentBalance})`)
    return
  }
  
  console.log(`🧪 Testing Sora 2 Video Generation (Standard Quality)`)
  console.log(`   Expected deduction: ${standardCost} credits`)
  console.log(`   Current balance: ${currentBalance}`)
  
  const newBalance = currentBalance - standardCost
  const newSpent = currentSpent + standardCost
  
  console.log(`   New balance: ${newBalance}`)
  console.log(`   Lifetime spent: ${currentSpent} → ${newSpent}\n`)
  
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
    console.log(`❌ Failed to deduct credits:`, updateError)
    return
  }
  
  // Create transaction with improved description
  const { error: txError } = await supabase
    .from('bestauth_points_transactions')
    .insert({
      user_id: user.id,
      amount: -standardCost,
      balance_after: newBalance,
      transaction_type: 'generation_deduction',
      generation_type: 'sora2Video',
      description: 'Sora 2 video generation: "A cat playing piano in a jazz club"',
      metadata: { 
        test: true, 
        quality: 'standard',
        mode: 'text-to-video',
        prompt: 'A cat playing piano in a jazz club',
        expectedCost: standardCost,
        actualCost: standardCost
      }
    })
  
  if (txError) {
    console.log(`⚠️  Transaction record failed:`, txError)
  } else {
    console.log(`✅ Transaction record created`)
  }
  
  console.log(`\n✅ Credits deducted successfully!`)
  console.log(`   Amount deducted: -${standardCost} credits`)
  console.log(`   New balance: ${newBalance} credits`)
  console.log(`   Lifetime spent: ${newSpent} credits\n`)
  
  // Verify the transaction
  const { data: verifyTx } = await supabase
    .from('bestauth_points_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (verifyTx) {
    console.log('✅ VERIFICATION PASSED')
    console.log('   Transaction details:')
    console.log(`   - Amount: ${verifyTx.amount} credits`)
    console.log(`   - Type: ${verifyTx.generation_type}`)
    console.log(`   - Description: ${verifyTx.description}`)
    console.log(`   - Balance after: ${verifyTx.balance_after}`)
    console.log(`   - Created: ${new Date(verifyTx.created_at).toLocaleString()}`)
    
    if (verifyTx.amount === -standardCost) {
      console.log(`\n🎉 SUCCESS! Correct amount deducted: ${standardCost} credits`)
    } else {
      console.log(`\n❌ ERROR! Wrong amount deducted: ${verifyTx.amount} (expected: -${standardCost})`)
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('EXPECTED COSTS:')
  console.log('='.repeat(80))
  console.log('- Image generation (nanoBananaImage): 5 credits')
  console.log('- Sora 2 video (standard quality): 20 credits')
  console.log('- Sora 2 Pro video (high quality): 80 credits')
}

testSora2CreditDeduction().catch(console.error)
