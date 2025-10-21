/**
 * Investigate Balance Mismatch
 * 
 * Issue: Balance shows 1630 but lifetime_earned is 2400
 * Expected: 2400 - 0 (spent) = 2400
 * Actual: 1630
 * Missing: 770 credits
 * 
 * Usage: npx tsx scripts/investigate-balance-mismatch.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const TEST_USER_SUPABASE_ID = '3ac0ce48-2bd0-4172-8c30-cca42ff1e805'

async function investigate() {
  console.log('=' .repeat(80))
  console.log('Balance Mismatch Investigation')
  console.log('=' .repeat(80))

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all transactions
  const { data: transactions, error } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', TEST_USER_SUPABASE_ID)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\nTotal Transactions: ${transactions.length}\n`)

  let runningBalance = 0
  let totalEarned = 0
  let totalSpent = 0

  console.log('Transaction Log:')
  console.log('-'.repeat(80))

  transactions.forEach((tx, index) => {
    const prevBalance = runningBalance
    runningBalance += tx.amount
    
    if (tx.amount > 0) {
      totalEarned += tx.amount
    } else {
      totalSpent += Math.abs(tx.amount)
    }

    console.log(`${index + 1}. ${tx.created_at}`)
    console.log(`   Type: ${tx.transaction_type}`)
    console.log(`   Amount: ${tx.amount > 0 ? '+' : ''}${tx.amount}`)
    console.log(`   Balance Before: ${prevBalance}`)
    console.log(`   Balance After (recorded): ${tx.balance_after}`)
    console.log(`   Balance After (calculated): ${runningBalance}`)
    
    if (tx.balance_after !== runningBalance) {
      console.log(`   ⚠️  MISMATCH! Recorded: ${tx.balance_after}, Calculated: ${runningBalance}`)
    }
    
    if (tx.description) {
      console.log(`   Description: ${tx.description}`)
    }
    console.log()
  })

  console.log('=' .repeat(80))
  console.log('Summary')
  console.log('=' .repeat(80))
  console.log(`Calculated Total Earned: ${totalEarned}`)
  console.log(`Calculated Total Spent: ${totalSpent}`)
  console.log(`Calculated Balance: ${runningBalance}`)
  console.log()

  // Get balance from RPC
  const { data: balance } = await supabase.rpc('get_points_balance', {
    p_user_id: TEST_USER_SUPABASE_ID
  })

  console.log(`Database Balance: ${balance.balance}`)
  console.log(`Database Lifetime Earned: ${balance.lifetime_earned}`)
  console.log(`Database Lifetime Spent: ${balance.lifetime_spent}`)
  console.log()

  // Check for discrepancies
  console.log('=' .repeat(80))
  console.log('Discrepancy Analysis')
  console.log('=' .repeat(80))

  if (totalEarned !== balance.lifetime_earned) {
    console.log(`❌ Lifetime Earned mismatch:`)
    console.log(`   Transactions sum: ${totalEarned}`)
    console.log(`   Database value: ${balance.lifetime_earned}`)
    console.log(`   Difference: ${balance.lifetime_earned - totalEarned}`)
  } else {
    console.log(`✅ Lifetime Earned matches: ${totalEarned}`)
  }

  if (totalSpent !== balance.lifetime_spent) {
    console.log(`❌ Lifetime Spent mismatch:`)
    console.log(`   Transactions sum: ${totalSpent}`)
    console.log(`   Database value: ${balance.lifetime_spent}`)
    console.log(`   Difference: ${balance.lifetime_spent - totalSpent}`)
  } else {
    console.log(`✅ Lifetime Spent matches: ${totalSpent}`)
  }

  if (runningBalance !== balance.balance) {
    console.log(`❌ Balance mismatch:`)
    console.log(`   Calculated from transactions: ${runningBalance}`)
    console.log(`   Database balance: ${balance.balance}`)
    console.log(`   Missing credits: ${runningBalance - balance.balance}`)
  } else {
    console.log(`✅ Balance matches: ${runningBalance}`)
  }

  console.log('=' .repeat(80))

  // Check if there are orphaned records in user_points table
  console.log('\nChecking user_points table directly...')
  const { data: userPoints, error: upError } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', TEST_USER_SUPABASE_ID)
    .maybeSingle()

  if (upError) {
    console.log('Error querying user_points:', upError.message)
  } else if (!userPoints) {
    console.log('❌ No record in user_points table!')
  } else {
    console.log('user_points record:', userPoints)
  }
}

investigate().catch(console.error)
