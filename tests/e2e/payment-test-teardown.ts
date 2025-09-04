import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function globalTeardown() {
  console.log('Cleaning up payment test environment...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Clean up all test data created during tests
  try {
    // Delete test subscriptions
    const { error: subError } = await supabase
      .from('subscriptions')
      .delete()
      .like('stripe_customer_id', 'cus_test_%');

    if (subError) {
      console.warn('Failed to clean up test subscriptions:', subError);
    }

    // Delete test user profiles created during tests
    const { data: testUsers } = await supabase
      .from('profiles')
      .select('id')
      .like('email', 'test-%@example.com');

    if (testUsers && testUsers.length > 0) {
      for (const user of testUsers) {
        // Delete user usage
        await supabase
          .from('user_usage')
          .delete()
          .eq('user_id', user.id);

        // Delete profile
        await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);
      }
    }

    // Clean up auth users
    const { data: { users } } = await supabase.auth.admin.listUsers();
    
    if (users) {
      const testAuthUsers = users.filter(u => 
        u.email?.includes('test-') && u.email?.includes('@example.com')
      );

      for (const user of testAuthUsers) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }

  } catch (error) {
    console.error('Teardown error:', error);
  }

  console.log('Payment test teardown complete');
}

export default globalTeardown;