#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function checkVerificationStatus() {
  const email = process.argv[2] || '994235892@qq.com'
  
  console.log('👤 Checking Verification Status')
  console.log('=' .repeat(70))
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { data: user, error } = await supabase
      .from('bestauth_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
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
      console.log('🎉 Email is verified!')
      console.log('')
      console.log('✅ User can now:')
      console.log('   • Log in normally')
      console.log('   • Access all features')
      console.log('   • Receive notifications')
    } else {
      console.log('⚠️  Email is NOT verified')
      console.log('')
      console.log('💡 To verify manually, run:')
      console.log(`   npm run verify:email:manual ${email}`)
    }
    console.log('')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

checkVerificationStatus()

