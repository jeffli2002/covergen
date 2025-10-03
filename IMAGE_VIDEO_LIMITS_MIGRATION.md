# Image & Video Limits Migration Guide

## Overview
This document outlines the changes made to support separate image and video generation limits across all subscription tiers.

## New Subscription Plans

### Free Plan
- **Daily**: 3 images + 1 video
- **Monthly**: 10 images + 5 videos

### Pro Plan ($16.99/month)
- **Monthly**: 100 images + 30 videos
- **No daily limits** for paid plans

### Pro+ Plan ($29.99/month)
- **Monthly**: 200 images + 60 videos
- **No daily limits** for paid plans

## Database Changes

### 1. Schema Migration
**File**: `/src/lib/bestauth/schema/add-image-video-tracking.sql`

Added new columns to `bestauth_usage_tracking` table:
```sql
ALTER TABLE bestauth_usage_tracking 
ADD COLUMN IF NOT EXISTS image_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_count INTEGER NOT NULL DEFAULT 0;
```

### 2. SQL Functions Added
- `increment_image_usage(p_user_id UUID)` - Increments image count
- `increment_video_usage(p_user_id UUID)` - Increments video count
- `get_user_usage_summary(p_user_id UUID, p_date DATE)` - Returns usage summary

### 3. Migration Steps
1. Run the SQL migration: `add-image-video-tracking.sql`
2. Existing `generation_count` data is migrated to `image_count`
3. `generation_count` is kept for backwards compatibility

## Code Changes

### 1. Subscription Plans (`/src/lib/subscription-plans.ts`)
Updated plan structure to include separate limits:
```typescript
limits: {
  images: {
    monthly: number
    daily: number
  },
  videos: {
    monthly: number
    daily: number
  }
}
```

### 2. BestAuth Service (`/src/services/bestauth/BestAuthSubscriptionService.ts`)

#### New Methods:
- `canUserGenerateImage(userId: string)` - Checks image limits
- `canUserGenerateVideo(userId: string)` - Checks video limits

#### Updated Methods:
- `getSubscriptionLimits()` - Now returns separate image/video limits:
```typescript
{
  daily: number,        // Total (for backwards compatibility)
  monthly: number,      // Total (for backwards compatibility)
  images: { daily: number, monthly: number },
  videos: { daily: number, monthly: number }
}
```

### 3. Database Layer (`/src/lib/bestauth/db.ts` & `/src/lib/bestauth/db-wrapper.ts`)

#### New Database Methods:
- `getTodayByType(userId, type)` - Get today's usage by type (image/video)
- `getMonthlyUsageByType(userId, type)` - Get monthly usage by type
- `incrementByType(userId, type, amount)` - Increment usage by type

## API Integration

### Image Generation API
Update `/src/app/api/generate/route.ts`:
```typescript
// Before generation
const canGenerate = await bestAuthSubscriptionService.canUserGenerateImage(userId)

// After successful generation
await db.usage.incrementByType(userId, 'image', 1)
```

### Video Generation API  
Update `/src/app/api/sora/create/route.ts`:
```typescript
// Before generation
const canGenerate = await bestAuthSubscriptionService.canUserGenerateVideo(userId)

// After successful generation
await db.usage.incrementByType(userId, 'video', 1)
```

## UI Updates Needed

### 1. Usage Display Component (`/src/components/usage-display.tsx`)
Show separate image and video usage:
```typescript
const imageUsage = await bestAuthSubscriptionService.getUserUsageByType(userId, 'image')
const videoUsage = await bestAuthSubscriptionService.getUserUsageByType(userId, 'video')

// Display:
// Images: 5/10 daily, 25/100 monthly
// Videos: 1/1 daily, 10/30 monthly
```

### 2. Account Page
Update to show separate limits and usage for images and videos

### 3. Header/Navigation
Update quota display to show both image and video counts

## Pricing Section Updates

All pricing displays have been updated:
- ✅ `/src/components/pricing-section.tsx` - Updated with new prices and limits
- ✅ `/src/app/[locale]/page-client.tsx` (FAQ) - Updated plan details
- ✅ `/src/app/[locale]/terms/page-client.tsx` - Updated legal terms
- ✅ `/src/services/payment/creem.ts` - Updated payment pricing

## Environment Variables

Updated in `.env.example`:
```bash
# Monthly limits now match new plans
PRO_MONTHLY_LIMIT=100
PRO_PLUS_MONTHLY_LIMIT=200
```

## Testing Checklist

### Database Migration
- [ ] Run migration SQL file
- [ ] Verify new columns exist: `image_count`, `video_count`
- [ ] Verify SQL functions created
- [ ] Test increment functions work correctly

### API Testing
- [ ] Test image generation with limits
- [ ] Test video generation with limits
- [ ] Verify separate limit checking works
- [ ] Test limit exceeded scenarios

### UI Testing
- [ ] Verify usage display shows separate counts
- [ ] Test account page shows correct limits
- [ ] Verify pricing page displays correctly
- [ ] Check header quota display

### Integration Testing
- [ ] Test free user: 3 images + 1 video daily
- [ ] Test Pro user: 100 images + 30 videos monthly
- [ ] Test Pro+ user: 200 images + 60 videos monthly
- [ ] Verify upgrade flow preserves usage data

## Rollback Plan

If issues arise:
1. Revert code changes to previous version
2. Run rollback SQL:
```sql
-- Optionally drop new columns (data will be lost)
ALTER TABLE bestauth_usage_tracking 
DROP COLUMN IF EXISTS image_count,
DROP COLUMN IF EXISTS video_count;
```

## Migration Timeline

1. **Phase 1**: Database migration (Run SQL)
2. **Phase 2**: Backend code deployment
3. **Phase 3**: Frontend UI updates
4. **Phase 4**: Monitoring and verification

## Notes

- Backwards compatibility maintained via `generation_count`
- Existing users' usage data preserved
- New columns default to 0
- Functions handle both authenticated users and sessions
- Error handling includes fallbacks to prevent service disruption
