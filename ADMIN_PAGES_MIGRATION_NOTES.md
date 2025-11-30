# Admin Pages Migration Notes

## Overview

Admin pages have been copied from the viecom project, but they need to be adapted to work with the current CoverGen project architecture.

## Key Differences

### Database Access
- **Viecom**: Uses Drizzle ORM with `@/server/db` and `@/server/db/schema`
- **CoverGen**: Uses Supabase client with `@/lib/bestauth/db-client` and direct table queries

### Configuration Files
- **Viecom**: Uses `@/config/payment.config` and `@/config/showcase.config`
- **CoverGen**: Now has these files created, but may need adjustments

## Files Created

1. ✅ `src/config/showcase.config.ts` - Showcase categories configuration
2. ✅ `src/config/payment.config.ts` - Payment configuration (based on SUBSCRIPTION_CONFIG)
3. ✅ `src/lib/seo/metadata.ts` - Added `buildCanonicalMetadata` function

## Files That Need Fixing

### High Priority (Core Functionality)

1. **Admin Authentication** (`src/app/api/admin/auth/login/route.ts`)
   - ✅ Partially fixed - now uses Supabase client
   - ⚠️ TODO: Create proper admins table or use environment variables for admin emails
   - ⚠️ TODO: Implement proper password verification

2. **Database Access in Admin API Routes**
   - All routes using `@/server/db` need to be converted to Supabase client
   - Example pattern:
     ```typescript
     // Old (Drizzle):
     import { db } from '@/server/db';
     import { users } from '@/server/db/schema';
     const users = await db.select().from(users).where(eq(users.id, userId));
     
     // New (Supabase):
     import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
     const client = getBestAuthSupabaseClient();
     const { data: users } = await client.from('bestauth_users').select('*').eq('id', userId);
     ```

### Medium Priority

3. **Admin Layout Files**
   - ✅ Fixed - `buildCanonicalMetadata` function added

4. **Revenue Utils** (`src/lib/admin/revenue-utils.ts`)
   - Uses `@/config/payment.config` - ✅ File created
   - May need adjustments to match CoverGen's pricing structure

### Low Priority (Can be disabled if not needed)

5. **Showcase/Publish Features**
   - Uses `@/config/showcase.config` - ✅ File created
   - May need database tables: `landing_showcase_entries`, `publish_submissions`

6. **Upload Features**
   - Uses `@/config/image-upload.config` and `@/lib/storage/r2`
   - May need to be adapted to CoverGen's storage solution

## Environment Variables Needed

Add to `.env.local`:

```env
# Admin Authentication
ADMIN_JWT_SECRET=your-secure-admin-jwt-secret-key
ADMIN_EMAILS=admin1@covergen.pro,admin2@covergen.pro
ADMIN_PASSWORD=your-admin-password  # Temporary - should use proper admins table
```

## Database Tables Needed

You may need to create these tables in Supabase:

1. **admins** table (for proper admin authentication):
   ```sql
   CREATE TABLE IF NOT EXISTS admins (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     name TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **landing_showcase_entries** (if using showcase feature)
3. **publish_submissions** (if using publish feature)
4. **credit_pack_purchase** (if using credit pack tracking)
5. **credit_transactions** (if using transaction tracking)
6. **payment** (if using payment tracking)

## Next Steps

1. **Fix Admin Login**: Complete the admin authentication implementation
2. **Convert Database Queries**: Update all admin API routes to use Supabase client
3. **Create Missing Tables**: Add any required database tables
4. **Test Admin Pages**: Verify all admin pages work correctly
5. **Update Type Definitions**: Fix any remaining TypeScript errors

## Quick Fix Pattern

For most admin API routes, follow this pattern:

```typescript
// Replace Drizzle imports
- import { db } from '@/server/db';
- import { users } from '@/server/db/schema';
- import { eq } from 'drizzle-orm';

// With Supabase client
+ import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';

// Replace queries
- const users = await db.select().from(users).where(eq(users.id, userId));

// With Supabase queries
+ const client = getBestAuthSupabaseClient();
+ if (!client) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
+ const { data: users, error } = await client.from('bestauth_users').select('*').eq('id', userId);
```

