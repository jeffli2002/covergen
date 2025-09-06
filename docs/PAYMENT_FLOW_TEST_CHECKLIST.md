# Payment Flow Test Checklist

## Overview

This checklist ensures the payment integration with isolated auth wrapper doesn't break OAuth functionality.

## Pre-Test Setup

1. **Clear Environment**
   - [ ] Clear all browser cookies and localStorage
   - [ ] Open browser DevTools Console
   - [ ] Filter console for "GoTrueClient" warnings

2. **Test Environment**
   - [ ] Verify `NEXT_PUBLIC_CREEM_TEST_MODE=true` for test environment
   - [ ] Check all payment environment variables are set

## Test Scenarios

### 1. Fresh OAuth Login to Payment Flow

**Steps:**
1. [ ] Navigate to `/en` (home page)
2. [ ] Click "Sign in with Google"
3. [ ] Complete OAuth flow
4. [ ] Verify no "Multiple GoTrueClient" warnings in console
5. [ ] Navigate to `/en/payment`
6. [ ] Select a plan and click "Subscribe"
7. [ ] Verify checkout session created without auth errors

**Expected Results:**
- ✅ No console warnings about multiple clients
- ✅ Smooth transition from OAuth to payment
- ✅ User remains signed in throughout

### 2. Session Validity Check

**Steps:**
1. [ ] Sign in with OAuth
2. [ ] Open browser DevTools > Application > Cookies
3. [ ] Note the session expiry time
4. [ ] Wait until < 5 minutes before expiry
5. [ ] Navigate to `/en/payment`
6. [ ] Try to start checkout

**Expected Results:**
- ✅ Should show "Please sign in again to continue with payment"
- ✅ Should redirect to sign-in with return URL
- ✅ No attempt to refresh session inline

### 3. API Endpoint Test

**Steps:**
1. [ ] Sign in with OAuth
2. [ ] Navigate to `/api/test/payment-auth`
3. [ ] Check the JSON response

**Expected Results:**
```json
{
  "success": true,
  "allTestsPassed": true,
  "results": {
    "tests": {
      "authServiceAvailable": true,
      "sessionValid": true,
      "sessionValidForPayment": true,
      "authContextAvailable": true,
      "authHeadersGenerated": true,
      "noMultipleClientWarnings": true
    }
  }
}
```

### 4. Concurrent Session Test

**Steps:**
1. [ ] Sign in with OAuth in Tab 1
2. [ ] Navigate to `/en/payment` in Tab 1
3. [ ] Open Tab 2 and navigate to `/en/account`
4. [ ] Sign out in Tab 2
5. [ ] Go back to Tab 1 and try to proceed with payment

**Expected Results:**
- ✅ Payment page detects invalid session
- ✅ Redirects to sign-in
- ✅ No console errors about auth state

### 5. Webhook Isolation Test

**Steps:**
1. [ ] Sign in with OAuth
2. [ ] Note your user ID from `/en/account`
3. [ ] Trigger a test webhook (use Creem dashboard or test endpoint)
4. [ ] Check you're still signed in
5. [ ] Verify subscription updated in database

**Expected Results:**
- ✅ Webhook processes successfully
- ✅ User session remains intact
- ✅ No auth state modifications

### 6. Payment Success Return

**Steps:**
1. [ ] Complete a test payment (use test card 4242...)
2. [ ] On success redirect, verify you're still signed in
3. [ ] Check `/en/account` shows updated subscription

**Expected Results:**
- ✅ Session persists through payment redirect
- ✅ Subscription status updated correctly
- ✅ No auth errors

## Console Warning Checklist

Monitor console throughout all tests for these critical warnings:

- [ ] No "Multiple GoTrueClient instances detected"
- [ ] No "GoTrueClient already initialized"
- [ ] No "Session refresh failed" during payment flows
- [ ] No "Unexpected auth state change" messages

## Post-Test Verification

1. **OAuth Still Works**
   - [ ] Sign out completely
   - [ ] Sign in with Google OAuth
   - [ ] Verify smooth login flow

2. **Payment Integration**
   - [ ] Can view pricing without auth
   - [ ] Redirects to sign-in when starting checkout
   - [ ] Maintains session through payment flow

3. **Error States**
   - [ ] Handles expired sessions gracefully
   - [ ] Shows appropriate error messages
   - [ ] Never attempts inline session refresh

## Test Summary

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Fresh OAuth to Payment | | | |
| Session Validity | | | |
| API Endpoint | | | |
| Concurrent Sessions | | | |
| Webhook Isolation | | | |
| Payment Success | | | |

## Known Good Behaviors

✅ **Payment pages redirect to sign-in** when session invalid
✅ **Webhooks use admin client** without touching user sessions
✅ **Auth context is read-only** in payment flows
✅ **Single Supabase client instance** throughout app

## Red Flags

❌ Any "Multiple GoTrueClient" warnings
❌ Session refresh attempts in payment code
❌ Auth state modifications during payment
❌ Lost sessions after payment operations

---

**Test Date:** _______________
**Tester:** _______________
**Environment:** [ ] Local [ ] Staging [ ] Production
**All Tests Passed:** [ ] Yes [ ] No

**Notes:**
_____________________________________
_____________________________________
_____________________________________