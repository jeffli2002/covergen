#!/usr/bin/env npx tsx
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkSchema() {
  console.log('=== Checking bestauth_subscriptions schema ===\n')
  
  // Get a sample subscription
  const { data, error } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  if (data) {
    console.log('Actual columns in bestauth_subscriptions:')
    const columns = Object.keys(data).sort()
    columns.forEach(col => {
      const value = data[col]
      const type = value === null ? 'null' : typeof value
      console.log(`  ${col.padEnd(30)} : ${type}`)
    })
    
    console.log('\n=== Checking for Creem-related columns ===')
    const creemColumns = columns.filter(c => c.toLowerCase().includes('creem'))
    if (creemColumns.length > 0) {
      console.log('✅ Found Creem columns:', creemColumns)
    } else {
      console.log('❌ No creem_subscription_id column found')
      console.log('⚠️  Using stripe_subscription_id for Creem subscriptions')
    }
    
    console.log('\n=== Checking existing Creem subscriptions ===')
    const { data: creemSubs } = await supabase
      .from('bestauth_subscriptions')
      .select('stripe_subscription_id, tier, status')
      .not('stripe_subscription_id', 'is', null)
      .limit(5)
    
    if (creemSubs && creemSubs.length > 0) {
      console.log('Sample subscription IDs:')
      creemSubs.forEach(sub => {
        console.log(`  ${sub.stripe_subscription_id} (${sub.tier}, ${sub.status})`)
      })
    }
  }
}

checkSchema()
