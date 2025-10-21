#!/usr/bin/env tsx
/**
 * Reset Jeff's balance to correct Pro+ monthly allocation (830 credits)
 * Clean up duplicate grants
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const USER_ID = '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a'
const CORRECT_BALANCE = 830 // Pro+ monthly allocation

async function reset() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  console.log('='.repeat(80))
  console.log('Resetting Balance to Correct Amount')
  console.log('='.repeat(80))
  
  // 1. Check current balance
  console.log('\nStep 1: Current state...')
  const { data: currentBalance } = await supabase.rpc('get_points_balance', {
    p_user_id: USER_ID
  })
  
  console.log(`Current Balance: ${currentBalance.balance}`)
  console.log(`Lifetime Earned: ${currentBalance.lifetime_earned}`)
  console.log(`Lifetime Spent: ${currentBalance.lifetime_spent}`)
  
  // 2. Calculate adjustment
  const adjustment = CORRECT_BALANCE - currentBalance.balance
  console.log(`\nAdjustment needed: ${adjustment}`)
  
  if (adjustment === 0) {
    console.log('✅ Balance is already correct!')
    return
  }
  
  // 3. Apply adjustment
  console.log(`\n${adjustment > 0 ? 'Adding' : 'Removing'} ${Math.abs(adjustment)} credits...`)
  
  if (adjustment > 0) {
    // Add credits
    const { data: result, error } = await supabase.rpc('add_points', {
      p_user_id: USER_ID,
      p_amount: adjustment,
      p_transaction_type: 'admin_adjustment',
      p_description: `Balance correction: adjust to ${CORRECT_BALANCE} credits`,
      p_generation_type: null,
      p_subscription_id: null,
      p_stripe_payment_intent_id: null,
      p_metadata: {
        reason: 'Correct balance from duplicate grants',
        previous_balance: currentBalance.balance,
        target_balance: CORRECT_BALANCE
      }
    })
    
    if (error) {
      console.error('❌ Failed:', error.message)
      return
    }
    
    console.log('✅ Credits added')
    console.log(`New balance: ${result.new_balance}`)
  } else {
    // Deduct credits
    const { data: result, error } = await supabase.rpc('deduct_generation_points', {
      p_user_id: USER_ID,
      p_generation_type: 'admin_adjustment',
      p_points_cost: Math.abs(adjustment),
      p_metadata: {
        reason: 'Correct balance from duplicate grants',
        previous_balance: currentBalance.balance,
        target_balance: CORRECT_BALANCE
      }
    })
    
    if (error) {
      console.error('❌ Failed:', error.message)
      return
    }
    
    console.log('✅ Credits removed')
    console.log(`New balance: ${result.transaction.new_balance}`)
  }
  
  // 4. Verify final balance
  console.log('\nStep 2: Verifying final balance...')
  const { data: finalBalance } = await supabase.rpc('get_points_balance', {
    p_user_id: USER_ID
  })
  
  console.log(`Final Balance: ${finalBalance.balance}`)
  console.log(`Lifetime Earned: ${finalBalance.lifetime_earned}`)
  console.log(`Lifetime Spent: ${finalBalance.lifetime_spent}`)
  
  if (finalBalance.balance === CORRECT_BALANCE) {
    console.log('\n🎉 Balance corrected successfully!')
  } else {
    console.log(`\n⚠️  Balance is ${finalBalance.balance}, expected ${CORRECT_BALANCE}`)
  }
}

reset().catch(console.error)
