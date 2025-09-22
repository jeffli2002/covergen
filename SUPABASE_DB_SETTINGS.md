# Supabase Database Settings for BestAuth

## Required Changes

### 1. **Disable RLS on BestAuth Tables** (Important!)
Since BestAuth uses the service role key, you need to disable Row Level Security on the BestAuth tables:

```sql
-- Disable RLS on all BestAuth tables
ALTER TABLE bestauth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.oauth_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.magic_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.password_resets DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.activity_logs DISABLE ROW LEVEL SECURITY;
```

### 2. **Keep Existing Tables** 
- Keep your existing tables (profiles, user_usage, subscriptions_consolidated, etc.)
- BestAuth will work alongside them
- The migration script will help move users from auth.users to bestauth.users

### 3. **Service Role Key**
Make sure you have the service role key in your `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Security Note**: The service role key bypasses RLS, so never expose it to the client!

### 4. **Database Connection Settings**
No changes needed to connection settings. BestAuth uses the same Supabase client.

### 5. **Existing Auth Settings**
You can leave Supabase Auth enabled for now during migration:
- Email auth can stay enabled
- OAuth providers in Supabase can remain configured
- This allows gradual migration

## Step-by-Step Setup

1. **Run the schema creation**:
   - Go to Supabase Dashboard > SQL Editor
   - Copy the entire contents of `/src/lib/bestauth/schema.sql`
   - Run it

2. **Disable RLS** (run the SQL above)

3. **Verify tables created**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'bestauth';
   ```

4. **Update your `.env.local`**:
   ```env
   # Keep your existing Supabase vars
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Add the service role key for BestAuth
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Add BestAuth JWT secret
   BESTAUTH_JWT_SECRET=generate-a-random-32-char-string
   ```

## Important Considerations

### What Stays the Same
- Your existing tables remain untouched
- Database URL stays the same
- You can run both auth systems during migration

### What Changes
- New `bestauth` schema with auth tables
- Service role key is now required
- RLS is disabled on BestAuth tables (secured at API level instead)

### Migration Strategy
1. **Phase 1**: Run both systems
   - BestAuth for new users
   - Supabase Auth still works for existing users

2. **Phase 2**: Migrate users
   - Run migration script
   - Update your app to use BestAuth exclusively

3. **Phase 3**: Cleanup
   - Remove Supabase Auth code
   - Disable Supabase Auth in dashboard

## Security Notes

1. **Service Role Key Security**:
   - Only use in server-side code
   - Never expose to browser
   - BestAuth handles this automatically

2. **API-Level Security**:
   - Since RLS is disabled, security is enforced in the API routes
   - All routes validate sessions before database access
   - This is actually more performant than RLS

3. **Production Considerations**:
   - Consider using a separate database user for BestAuth
   - Implement rate limiting on auth endpoints
   - Monitor authentication logs

## Quick Test

After setup, test the connection:
```sql
-- This should return empty results (no users yet)
SELECT * FROM bestauth.users LIMIT 1;
```

If you get a permissions error, make sure:
1. The schema was created
2. RLS is disabled
3. You're using the service role key