#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function checkByUserId() {
  const userId = '57c1c563-4cdd-4471-baa0-f49064b997c9' // From API test
  
  console.log('👤 Checking User by ID')
  console.log('=' .repeat(70))
  console.log('')
  console.log('User ID:', userId)
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { data: user, error } = await supabase
      .from('bestauth_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.log('❌ Error:', error.message)
      return
    }

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name || 'N/A'}`)
    console.log(`   Email Verified: ${user.email_verified ? '✅ YES' : '❌ NO'}`)
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
    console.log('')

    if (user.email_verified) {
      console.log('🎉 This user\'s email IS VERIFIED!')
      console.log('')
      console.log('✅ The verification was successful!')
    } else {
      console.log('⚠️  Email is NOT verified')
    }
    console.log('')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

checkByUserId()

