# Supabase Setup Instructions

## Setting up the Feedback Table

The feedback feature requires a feedback table in your Supabase database. Follow these steps to set it up:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/20250831_create_feedback_table.sql`
4. Paste and run the SQL in the editor
5. Verify the table was created in the Table Editor

### Option 2: Using Supabase CLI

1. Install Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

3. Run the migration:
   ```bash
   supabase db push
   ```

## Verifying the Setup

After creating the table, verify that:

1. The `feedback` table exists in your Supabase dashboard
2. Row Level Security (RLS) is enabled on the table
3. The policies are correctly set up (you should see 3 policies)
4. Your service role key has the necessary permissions

## Troubleshooting

If feedback is not being saved:

1. Check that your environment variables are correctly set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Check the server logs for any error messages
3. Verify the table structure matches the TypeScript types in `src/types/supabase.ts`
4. Ensure RLS policies allow the service role to insert data