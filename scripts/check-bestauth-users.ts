#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function checkUsers() {
  console.log('👥 Checking BestAuth Users')
  console.log('=' .repeat(70))
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('bestauth_users')
      .select('*')
      .limit(10)

    if (error) {
      console.error('❌ Error fetching users:', error)
      return
    }

    if (!users || users.length === 0) {
      console.log('📭 No users found in bestauth_users table')
      console.log('')
      console.log('💡 To test email verification, you need to:')
      console.log('1. Sign up at http://localhost:3001/auth/signup')
      console.log('2. Or create a test user manually')
      console.log('')
      return
    }

    console.log(`📊 Found ${users.length} user(s):`)
    console.log('')

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Name: ${user.name || 'N/A'}`)
      console.log(`   Email Verified: ${user.email_verified ? '✅ Yes' : '❌ No'}`)
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
      console.log('')
    })

    console.log('🧪 To test email verification for any user, run:')
    console.log(`   npm run test:email:verification ${users[0].email}`)
    console.log('')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

checkUsers()

