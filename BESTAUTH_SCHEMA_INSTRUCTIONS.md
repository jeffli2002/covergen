# BestAuth Schema Installation Instructions

## Step 1: Run the Schema

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the ENTIRE contents of `/src/lib/bestauth/schema-fixed.sql`
5. Paste it into the SQL editor
6. Click "Run" (or press Ctrl/Cmd + Enter)

You should see a notice saying "BestAuth tables created successfully in public schema with bestauth_ prefix"

## Step 2: Verify Installation

After running the schema, go to:
- http://localhost:3000/verify-bestauth

This will check that:
- All tables are created
- RLS is disabled
- Database operations work

## Step 3: Add Environment Variables

Add these to your `.env.local` file:

```env
# Generate a secure random string (32+ characters)
BESTAUTH_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Make sure you have the service role key (not the anon key!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

To generate a secure JWT secret, you can use:
```bash
openssl rand -base64 32
```

## Important Notes

1. **Table Names**: All tables are now in the public schema with `bestauth_` prefix (e.g., `bestauth_users` instead of `bestauth.users`)

2. **RLS is Disabled**: The schema automatically disables Row Level Security on all BestAuth tables. This is intentional - security is handled at the API level.

3. **Service Role Key**: BestAuth requires the service role key (not the anon key) because it bypasses RLS. Never expose this key to the client!

## Troubleshooting

If you see errors about tables not found:
- Make sure you ran the ENTIRE schema script
- Check the SQL editor for any error messages
- Verify you're connected to the correct Supabase project

If you see permission errors:
- Make sure you're using the service role key (not anon key)
- Verify the key is correctly set in `.env.local`
- Restart your Next.js dev server after adding environment variables