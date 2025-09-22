# BestAuth Migration Guide

## How to Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the SQL from the files below
5. Run each script in order

### Option 2: Using Supabase CLI

```bash
# First, ensure you're connected to your project
supabase db push

# Then run the migration files
supabase db execute -f src/lib/bestauth/schema/subscriptions.sql
supabase db execute -f src/lib/bestauth/schema/migrate-subscriptions.sql
```

### Option 3: Using psql

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the scripts
\i src/lib/bestauth/schema/subscriptions.sql
\i src/lib/bestauth/schema/migrate-subscriptions.sql
```

## Migration Steps

### Step 1: Create BestAuth Tables (Run First)

Run the contents of `src/lib/bestauth/schema/subscriptions.sql`

This creates:
- BestAuth subscription tables
- Usage tracking tables
- Payment history tables
- Helper functions

### Step 2: Migrate Data (Run Second)

Run the contents of `src/lib/bestauth/schema/migrate-subscriptions.sql`

This:
- Copies all user data from Supabase Auth to BestAuth
- Migrates all subscription data preserving trial info
- Transfers usage history
- Creates payment records

### Step 3: Verify Migration

Run these queries to verify the migration worked:

```sql
-- Check migrated subscriptions
SELECT COUNT(*) as total_subscriptions FROM bestauth_subscriptions;

-- Check active trials
SELECT 
  u.email,
  s.tier,
  s.status,
  s.trial_ends_at
FROM bestauth_subscriptions s
JOIN bestauth_users u ON s.user_id = u.id
WHERE s.status = 'trialing';

-- Check usage data
SELECT COUNT(DISTINCT user_id) as users_with_usage FROM bestauth_usage_tracking;
```

## Troubleshooting

### Error: "bestauth_users table doesn't exist"

First run this to create the base BestAuth tables:

```sql
-- Create bestauth_users table
CREATE TABLE IF NOT EXISTS bestauth_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create other required tables
CREATE TABLE IF NOT EXISTS bestauth_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bestauth_oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS bestauth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW()
);
```

### Error: "Connection string is missing"

This error occurs when trying to run SQL through the application instead of directly in the database. Use one of the methods above to run the SQL directly.

### Error: "permission denied for schema bestauth"

Run this first:
```sql
GRANT ALL ON SCHEMA bestauth TO postgres;
GRANT ALL ON SCHEMA bestauth TO authenticated;
GRANT ALL ON SCHEMA bestauth TO anon;
```

## After Migration

1. Test the authentication flow
2. Verify subscription data is correct
3. Check that usage limits are working
4. Monitor for any errors in production

## Rollback Plan

If you need to rollback:

```sql
-- Disable BestAuth by setting USE_BESTAUTH = false in auth.config.ts

-- Optionally, remove BestAuth tables (BE CAREFUL!)
DROP SCHEMA bestauth CASCADE;
```