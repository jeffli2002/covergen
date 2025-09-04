# Bug Fix: Subscription Flow After Sign-In

## Bug 定位 (Bug Location)

The issue was caused by two main problems:

1. **Dev Mode Interference**: The `NEXT_PUBLIC_BYPASS_USAGE_LIMIT` environment variable was set to `true`, causing the app to show "Unlimited (Dev Mode)" in the header, which could confuse the subscription flow and user experience.

2. **Lost State During OAuth**: When users clicked a subscription button and then signed in via Google OAuth, the pending plan selection was lost because OAuth redirects to Google and back, causing the React state to be reset.

## 修复方案 (Fix Solutions)

### Solution 1: Improved Dev Mode Display Logic
Updated `UserMenu.tsx` to:
- Only show "Dev Mode" when in development environment AND user doesn't have a paid subscription
- Show actual subscription usage for paid users even in dev mode
- Better differentiate between dev mode and production behavior

### Solution 2: Persist Pending Plan Across OAuth Flow
Updated `pricing-section.tsx` and `header.tsx` to:
- Store the pending plan in localStorage when user clicks subscription button without being authenticated
- Check for pending plan after successful authentication (including OAuth callback)
- Automatically redirect to payment page with the selected plan after sign-in
- Clear pending plan from localStorage after redirect or on modal close

## 验证建议 (Verification Suggestions)

1. **Test Regular Sign-In Flow**:
   - Click Pro subscription button while logged out
   - Sign in with email/password
   - Verify redirect to payment page with correct plan

2. **Test Google OAuth Flow**:
   - Click Pro+ subscription button while logged out
   - Sign in with Google
   - After OAuth callback, verify automatic redirect to payment page

3. **Test Dev Mode Behavior**:
   - With `NEXT_PUBLIC_BYPASS_USAGE_LIMIT=true`, verify "Dev Mode" shows for free users
   - Upgrade to Pro plan
   - Verify actual usage shows instead of "Dev Mode" for paid users

4. **Test Edge Cases**:
   - Close auth modal without signing in - verify pending plan is cleared
   - Sign in from header (not pricing section) - verify no unwanted redirects
   - Multiple subscription button clicks - verify correct plan is remembered

## Implementation Details

The fix uses localStorage key `covergen_pending_plan` to persist the selected plan across page reloads and OAuth redirects. This ensures the user's intent is preserved throughout the authentication flow, providing a seamless upgrade experience.