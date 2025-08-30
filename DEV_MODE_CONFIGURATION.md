# Development Mode Configuration

## Overview
Development mode allows bypassing the daily usage limits for easier testing and development.

## Configuration

Add these environment variables to your `.env.local` file:

```env
# Development Configuration
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=true
```

## Features in Dev Mode

When `NEXT_PUBLIC_BYPASS_USAGE_LIMIT=true`:

1. **No Usage Limits**: Can generate unlimited images without restrictions
2. **No Usage Tracking**: Usage is not tracked in database or local storage
3. **Dev Mode Indicator**: Shows "Unlimited (Dev Mode)" in the header with a blue "DEV" badge
4. **Skip Auth Prompts**: Won't show upgrade prompts after 3 generations

## Visual Indicators

- Header shows "Unlimited (Dev Mode)" instead of usage count
- Blue "DEV" badge appears next to the usage display
- No "Limit reached" warnings

## To Disable Dev Mode

Simply remove or set to false:
```env
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false
```

Or remove the lines entirely from `.env.local` to test production behavior.

## Important Notes

- This configuration should ONLY be used in development
- Never deploy to production with `NEXT_PUBLIC_BYPASS_USAGE_LIMIT=true`
- The dev mode flag is visible to users (shows in UI)
- All other authentication features work normally in dev mode