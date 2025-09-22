// Quick script to check if a user exists in BestAuth
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkUser(email) {
  const { data, error } = await supabase
    .from('bestauth_users')
    .select('email, created_at')
    .eq('email', email)
    .single()
  
  if (error) {
    console.log('User not found:', email)
  } else {
    console.log('User exists:', data)
  }
}

// Replace with the email you're trying to sign in with
const emailToCheck = 'your-email@example.com'
checkUser(emailToCheck)