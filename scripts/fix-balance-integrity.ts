/**
 * Fix Balance Integrity for User
 * 
 * Recalculates the correct balance from transaction history
 * and updates the user_points/subscriptions_consolidated table
 * 
 * Usage: npx tsx scripts/fix-balance-integrity.ts <user_id>
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const userId = process.argv[2] || '3ac0ce48-2bd0-4172-8c30-cca42ff1e805'

async function fixBalance() {
  console.log('=' .repeat(80))
  console.log('Fix Balance Integrity')
  console.log('=' .repeat(80))
  console.log(`User ID: ${userId}`)
  console.log('=' .repeat(80))

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Step 1: Get all transactions
    console.log('\n1. Fetching all transactions...')
    const { data: transactions, error: txError } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (txError) {
      console.error('Error:', txError)
      return
    }

    console.log(`   Found ${transactions.length} transactions`)

    // Step 2: Calculate correct values
    console.log('\n2. Calculating correct balance...')
    
    let correctBalance = 0
    let correctLifetimeEarned = 0
    let correctLifetimeSpent = 0

    transactions.forEach(tx => {
      correctBalance += tx.amount
      if (tx.amount > 0) {
        correctLifetimeEarned += tx.amount
      } else {
        correctLifetimeSpent += Math.abs(tx.amount)
      }
    })

    console.log(`   Correct Balance: ${correctBalance}`)
    console.log(`   Correct Lifetime Earned: ${correctLifetimeEarned}`)
    console.log(`   Correct Lifetime Spent: ${correctLifetimeSpent}`)

    // Step 3: Get current database values
    console.log('\n3. Checking current database values...')
    
    const { data: currentBalance } = await supabase.rpc('get_points_balance', {
      p_user_id: userId
    })

    console.log(`   Current Balance: ${currentBalance.balance}`)
    console.log(`   Current Lifetime Earned: ${currentBalance.lifetime_earned}`)
    console.log(`   Current Lifetime Spent: ${currentBalance.lifetime_spent}`)

    // Step 4: Check if fix is needed
    const needsFix = 
      currentBalance.balance !== correctBalance ||
      currentBalance.lifetime_earned !== correctLifetimeEarned ||
      currentBalance.lifetime_spent !== correctLifetimeSpent

    if (!needsFix) {
      console.log('\n✅ Balance is already correct! No fix needed.')
      return
    }

    console.log('\n⚠️  Balance mismatch detected!')
    console.log(`   Balance difference: ${correctBalance - currentBalance.balance}`)
    console.log(`   Earned difference: ${correctLifetimeEarned - currentBalance.lifetime_earned}`)
    console.log(`   Spent difference: ${correctLifetimeSpent - currentBalance.lifetime_spent}`)

    // Step 5: Fix the balance
    console.log('\n4. Fixing balance...')
    
    const { data: updateResult, error: updateError } = await supabase
      .from('subscriptions_consolidated')
      .update({
        points_balance: correctBalance,
        points_lifetime_earned: correctLifetimeEarned,
        points_lifetime_spent: correctLifetimeSpent,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()

    if (updateError) {
      console.error('   ❌ Error updating balance:', updateError)
      return
    }

    console.log('   ✅ Balance updated successfully')

    // Step 6: Verify the fix
    console.log('\n5. Verifying fix...')
    
    const { data: verifyBalance } = await supabase.rpc('get_points_balance', {
      p_user_id: userId
    })

    console.log(`   New Balance: ${verifyBalance.balance}`)
    console.log(`   New Lifetime Earned: ${verifyBalance.lifetime_earned}`)
    console.log(`   New Lifetime Spent: ${verifyBalance.lifetime_spent}`)

    if (
      verifyBalance.balance === correctBalance &&
      verifyBalance.lifetime_earned === correctLifetimeEarned &&
      verifyBalance.lifetime_spent === correctLifetimeSpent
    ) {
      console.log('\n✅ Balance successfully fixed and verified!')
    } else {
      console.log('\n❌ Verification failed - balance still incorrect')
    }

    console.log('\n' + '=' .repeat(80))

  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

fixBalance().catch(console.error)
