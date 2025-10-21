#!/usr/bin/env tsx
/**
 * Check ALL subscription-related tables for 994235892@qq.com
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const USER_EMAIL = '994235892@qq.com'

async function checkAll() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  // Get user ID
  const { data: user } = await supabase
    .from('bestauth_users')
    .select('id')
    .eq('email', USER_EMAIL)
    .single()
  
  if (!user) {
    console.log('User not found')
    return
  }
  
  const userId = user.id
  console.log(`User ID: ${userId}\n`)
  
  // Check all possible subscription tables
  const tables = [
    'bestauth_subscriptions',
    'subscriptions',
    'subscriptions_consolidated',
    'user_subscriptions' // if exists
  ]
  
  for (const table of tables) {
    console.log(`Table: ${table}`)
    console.log('-'.repeat(50))
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      
      if (error) {
        console.log(`❌ Error: ${error.message}\n`)
        continue
      }
      
      if (data) {
        console.log('✅ Found record:')
        console.log(`   Tier: ${data.tier}`)
        console.log(`   Status: ${data.status}`)
        console.log(`   Full data:`)
        console.log(JSON.stringify(data, null, 2))
      } else {
        console.log('❌ No record found')
      }
    } catch (err: any) {
      console.log(`❌ Table may not exist: ${err.message}`)
    }
    
    console.log('')
  }
}

checkAll().catch(console.error)
