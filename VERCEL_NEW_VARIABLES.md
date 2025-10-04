# New Environment Variables for Vercel Deployment

## Image & Video Separate Limits (Add These)

### Server-Side Variables (Backend API)

```bash
# Free Tier - Images
FREE_DAILY_IMAGE_LIMIT=3
FREE_MONTHLY_IMAGE_LIMIT=10

# Free Tier - Videos
FREE_DAILY_VIDEO_LIMIT=1
FREE_MONTHLY_VIDEO_LIMIT=5

# Pro Tier - Images ($16.99/month)
PRO_MONTHLY_IMAGE_LIMIT=100
PRO_DAILY_IMAGE_LIMIT=0

# Pro Tier - Videos
PRO_MONTHLY_VIDEO_LIMIT=30
PRO_DAILY_VIDEO_LIMIT=0

# Pro+ Tier - Images ($29.99/month)
PRO_PLUS_MONTHLY_IMAGE_LIMIT=200
PRO_PLUS_DAILY_IMAGE_LIMIT=0

# Pro+ Tier - Videos
PRO_PLUS_MONTHLY_VIDEO_LIMIT=60
PRO_PLUS_DAILY_VIDEO_LIMIT=0

# Trial Limits - Images
PRO_TRIAL_DAILY_IMAGE_LIMIT=3
PRO_PLUS_TRIAL_DAILY_IMAGE_LIMIT=4

# Trial Limits - Videos
PRO_TRIAL_DAILY_VIDEO_LIMIT=1
PRO_PLUS_TRIAL_DAILY_VIDEO_LIMIT=2
```

### Client-Side Variables (Frontend UI - NEXT_PUBLIC_*)

```bash
# Free Tier - Images
NEXT_PUBLIC_FREE_DAILY_IMAGE_LIMIT=3
NEXT_PUBLIC_FREE_MONTHLY_IMAGE_LIMIT=10

# Free Tier - Videos
NEXT_PUBLIC_FREE_DAILY_VIDEO_LIMIT=1
NEXT_PUBLIC_FREE_MONTHLY_VIDEO_LIMIT=5

# Pro Tier - Images
NEXT_PUBLIC_PRO_MONTHLY_IMAGE_LIMIT=100
NEXT_PUBLIC_PRO_DAILY_IMAGE_LIMIT=0

# Pro Tier - Videos
NEXT_PUBLIC_PRO_MONTHLY_VIDEO_LIMIT=30
NEXT_PUBLIC_PRO_DAILY_VIDEO_LIMIT=0

# Pro+ Tier - Images
NEXT_PUBLIC_PRO_PLUS_MONTHLY_IMAGE_LIMIT=200
NEXT_PUBLIC_PRO_PLUS_DAILY_IMAGE_LIMIT=0

# Pro+ Tier - Videos
NEXT_PUBLIC_PRO_PLUS_MONTHLY_VIDEO_LIMIT=60
NEXT_PUBLIC_PRO_PLUS_DAILY_VIDEO_LIMIT=0

# Trial Limits - Images
NEXT_PUBLIC_PRO_TRIAL_DAILY_IMAGE_LIMIT=3
NEXT_PUBLIC_PRO_PLUS_TRIAL_DAILY_IMAGE_LIMIT=4

# Trial Limits - Videos
NEXT_PUBLIC_PRO_TRIAL_DAILY_VIDEO_LIMIT=1
NEXT_PUBLIC_PRO_PLUS_TRIAL_DAILY_VIDEO_LIMIT=2
```

## Quick Copy-Paste for Vercel Dashboard

### Paste All at Once (Server + Client Variables)

```
FREE_DAILY_IMAGE_LIMIT=3
FREE_MONTHLY_IMAGE_LIMIT=10
FREE_DAILY_VIDEO_LIMIT=1
FREE_MONTHLY_VIDEO_LIMIT=5
PRO_MONTHLY_IMAGE_LIMIT=100
PRO_DAILY_IMAGE_LIMIT=0
PRO_MONTHLY_VIDEO_LIMIT=30
PRO_DAILY_VIDEO_LIMIT=0
PRO_PLUS_MONTHLY_IMAGE_LIMIT=200
PRO_PLUS_DAILY_IMAGE_LIMIT=0
PRO_PLUS_MONTHLY_VIDEO_LIMIT=60
PRO_PLUS_DAILY_VIDEO_LIMIT=0
PRO_TRIAL_DAILY_IMAGE_LIMIT=3
PRO_PLUS_TRIAL_DAILY_IMAGE_LIMIT=4
PRO_TRIAL_DAILY_VIDEO_LIMIT=1
PRO_PLUS_TRIAL_DAILY_VIDEO_LIMIT=2
NEXT_PUBLIC_FREE_DAILY_IMAGE_LIMIT=3
NEXT_PUBLIC_FREE_MONTHLY_IMAGE_LIMIT=10
NEXT_PUBLIC_FREE_DAILY_VIDEO_LIMIT=1
NEXT_PUBLIC_FREE_MONTHLY_VIDEO_LIMIT=5
NEXT_PUBLIC_PRO_MONTHLY_IMAGE_LIMIT=100
NEXT_PUBLIC_PRO_DAILY_IMAGE_LIMIT=0
NEXT_PUBLIC_PRO_MONTHLY_VIDEO_LIMIT=30
NEXT_PUBLIC_PRO_DAILY_VIDEO_LIMIT=0
NEXT_PUBLIC_PRO_PLUS_MONTHLY_IMAGE_LIMIT=200
NEXT_PUBLIC_PRO_PLUS_DAILY_IMAGE_LIMIT=0
NEXT_PUBLIC_PRO_PLUS_MONTHLY_VIDEO_LIMIT=60
NEXT_PUBLIC_PRO_PLUS_DAILY_VIDEO_LIMIT=0
NEXT_PUBLIC_PRO_TRIAL_DAILY_IMAGE_LIMIT=3
NEXT_PUBLIC_PRO_PLUS_TRIAL_DAILY_IMAGE_LIMIT=4
NEXT_PUBLIC_PRO_TRIAL_DAILY_VIDEO_LIMIT=1
NEXT_PUBLIC_PRO_PLUS_TRIAL_DAILY_VIDEO_LIMIT=2
```

## Important Notes

1. **Keep Existing Variables**: Do NOT remove the old variables (`FREE_DAILY_LIMIT`, `PRO_MONTHLY_LIMIT`, etc.) - they are needed for backwards compatibility.

2. **Zero Daily Limits for Paid Plans**: Pro and Pro+ tiers have `0` daily limits, meaning unlimited daily usage within monthly quotas.

3. **Deployment Order**:
   - Add these variables to Vercel
   - Deploy the updated code
   - Run database migration (if not already done)

4. **Database Migration Required**: 
   - Ensure `add-image-video-tracking.sql` has been run on production database
   - This adds `image_count` and `video_count` columns to `bestauth_usage_tracking` table

5. **Testing After Deployment**:
   - Verify free users can generate 3 images + 1 video daily
   - Verify Pro users see 100 images + 30 videos monthly limits
   - Verify Pro+ users see 200 images + 60 videos monthly limits

## Subscription Plan Summary

| Tier | Price | Images (Monthly) | Videos (Monthly) | Images (Daily) | Videos (Daily) |
|------|-------|------------------|------------------|----------------|----------------|
| Free | $0 | 10 | 5 | 3 | 1 |
| Pro | $16.99 | 100 | 30 | Unlimited* | Unlimited* |
| Pro+ | $29.99 | 200 | 60 | Unlimited* | Unlimited* |

*Within monthly quota
