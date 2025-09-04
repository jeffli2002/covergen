#!/usr/bin/env node

const path = require('path')
const fs = require('fs')

console.log(`
========================================
FIX FOR: "column user_usage.usage_count does not exist"
========================================

This error occurs because there's a schema conflict in the user_usage table.
The table was created with different columns than expected.

To fix this issue, you need to run the migration that fixes the schema.

OPTION 1: Using Supabase Dashboard (Recommended)
------------------------------------------------
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of this file:
   ${path.join(__dirname, '..', 'supabase', 'migrations', '20250903_fix_user_usage_schema.sql')}
4. Click "Run" to execute the migration

OPTION 2: Using psql command line
---------------------------------
If you have PostgreSQL command line tools installed and your database URL:

psql "$SUPABASE_DB_URL" < ${path.join(__dirname, '..', 'supabase', 'migrations', '20250903_fix_user_usage_schema.sql')}

OPTION 3: Manual fix in SQL Editor
----------------------------------
Run this SQL in your Supabase SQL Editor:

`)

// Read and display the migration content
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250903_fix_user_usage_schema.sql')
const migrationContent = fs.readFileSync(migrationPath, 'utf8')

console.log('```sql')
console.log(migrationContent)
console.log('```')

console.log(`

After running the migration:
---------------------------
1. The user_usage table will have the correct schema
2. Any existing data will be preserved and migrated
3. The error should be resolved

Need more help?
--------------
Run: node scripts/check-and-fix-usage-tables.js
This will diagnose the current state of your database tables.
`)