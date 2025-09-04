import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function globalSetup() {
  console.log('Setting up payment test environment...');
  
  // Create Supabase admin client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Clean up test users
  const testEmails = [
    'existing-test@example.com',
    'google-test@example.com',
    'webhook-test@example.com'
  ];

  for (const email of testEmails) {
    try {
      // Get user by email
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email);

      if (users && users.length > 0) {
        for (const user of users) {
          // Delete subscriptions
          await supabase
            .from('subscriptions')
            .delete()
            .eq('user_id', user.id);

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
    } catch (error) {
      console.warn(`Failed to clean up test user ${email}:`, error);
    }
  }

  // Create a test user for existing user scenarios
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'existing-test@example.com',
      password: 'Test123456!',
      email_confirm: true
    });

    if (authError) {
      console.warn('Failed to create test user:', authError);
    } else if (authData?.user) {
      // Create profile
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: 'existing-test@example.com',
        full_name: 'Test User',
        subscription_tier: 'free',
        quota_limit: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('Created test user:', authData.user.id);
    }
  } catch (error) {
    console.warn('Test user setup error:', error);
  }

  // Set up test webhook endpoint if needed
  if (process.env.SETUP_WEBHOOK_ENDPOINT) {
    console.log('Setting up webhook endpoint...');
    // This would typically configure your payment provider's webhook endpoint
    // For Creem, this might involve API calls to set up test webhooks
  }

  console.log('Payment test setup complete');
  
  // Store any necessary data for tests
  return {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    testMode: true
  };
}

export default globalSetup;