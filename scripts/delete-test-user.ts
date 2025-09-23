// Script to delete test user from BestAuth database
import { db } from '@/lib/bestauth/db'

async function deleteTestUser(email: string) {
  try {
    console.log(`Deleting user with email: ${email}`)
    
    // First, find the user
    const user = await db.users.findByEmail(email)
    
    if (!user) {
      console.log('User not found')
      return
    }
    
    console.log(`Found user with ID: ${user.id}`)
    
    // Delete related data in order (to avoid foreign key constraints)
    
    // 1. Delete sessions
    console.log('Deleting sessions...')
    await db.pool.query(
      'DELETE FROM bestauth_sessions WHERE user_id = $1',
      [user.id]
    )
    
    // 2. Delete subscriptions
    console.log('Deleting subscriptions...')
    await db.pool.query(
      'DELETE FROM bestauth_subscriptions WHERE user_id = $1',
      [user.id]
    )
    
    // 3. Delete usage tracking
    console.log('Deleting usage tracking...')
    await db.pool.query(
      'DELETE FROM bestauth_usage_tracking WHERE user_id = $1',
      [user.id]
    )
    
    // 4. Delete OAuth accounts
    console.log('Deleting OAuth accounts...')
    await db.pool.query(
      'DELETE FROM bestauth_oauth_accounts WHERE user_id = $1',
      [user.id]
    )
    
    // 5. Delete magic links
    console.log('Deleting magic links...')
    await db.pool.query(
      'DELETE FROM bestauth_magic_links WHERE email = $1',
      [email]
    )
    
    // 6. Delete password reset tokens
    console.log('Deleting password reset tokens...')
    await db.pool.query(
      'DELETE FROM bestauth_password_reset_tokens WHERE user_id = $1',
      [user.id]
    )
    
    // 7. Finally, delete the user
    console.log('Deleting user...')
    await db.pool.query(
      'DELETE FROM bestauth_users WHERE id = $1',
      [user.id]
    )
    
    console.log(`Successfully deleted user: ${email}`)
    
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    // Close the database connection
    await db.pool.end()
  }
}

// Run the script
const emailToDelete = '994235892@qq.com'
deleteTestUser(emailToDelete)
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })