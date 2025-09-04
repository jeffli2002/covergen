# Subscription Flow Test Plan

## Test Scenario: Unauthenticated User Clicks Pro Plan

### Steps to Test:
1. Open the application in incognito/private mode (ensure no user is signed in)
2. Navigate to the pricing section on the homepage
3. Click on the "Start Pro Trial" or "Go Pro+" button on any paid plan

### Expected Behavior:
1. When clicking a paid plan button:
   - The sign-in modal should appear immediately
   - The modal should be the AuthForm component with sign-in/sign-up options
   - The pending plan should be stored internally

2. After successful sign-in:
   - The modal should close automatically
   - The user should be redirected to `/en/payment?plan={selected_plan}`
   - The payment page should show the plan they originally selected

### Bug Fix Summary:
- **Before**: Clicking subscription created a mock user and showed "Current Plan"
- **After**: Shows sign-in modal and redirects to payment after authentication

### Code Changes:
1. Added `useAuth` hook to get real authentication state
2. Added `useState` for `showAuthModal` and `pendingPlan`
3. Modified `handleSubscribe` to:
   - Check real authentication state
   - Show sign-in modal for unauthenticated users
   - Store pending plan for post-auth redirect
4. Added `handleAuthSuccess` callback to redirect after sign-in
5. Added AuthForm modal to the component

### Files Modified:
- `/mnt/d/ai/CoverImage/src/components/pricing-section.tsx`