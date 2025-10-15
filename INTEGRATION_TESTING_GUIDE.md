# Payment Frontend Integration Testing Guide

## Quick Start Testing

### Prerequisites
```bash
# Ensure environment variables are set
CREEM_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CREEM_TEST_MODE=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Test Scenarios

### 1. Pricing Page Display Test

**URL**: `http://localhost:3000/en/pricing`

**Expected Behavior**:
- [ ] Page loads without errors
- [ ] Three pricing cards displayed: Free, Pro, Pro+
- [ ] Monthly/Yearly toggle works
- [ ] Prices update on toggle (20% discount for yearly)
- [ ] Credit amounts display correctly
- [ ] Credit packs section shows below plans
- [ ] FAQ section visible at bottom

**Test Steps**:
1. Navigate to pricing page
2. Toggle between monthly/yearly
3. Verify calculations:
   - Pro Monthly: $14.90/month (800 credits)
   - Pro Yearly: $11.92/month or $143.04/year (9600 credits)
   - Pro+ Monthly: $26.90/month (1600 credits)
   - Pro+ Yearly: $21.52/month or $258.24/year (19200 credits)

---

### 2. Points Balance Display Test

**Pre-requisites**: Must be logged in

**Expected Behavior**:
- [ ] Points balance shows in header (compact variant)
- [ ] Clicking shows popover with details
- [ ] Generation capacity calculations correct
- [ ] "Buy Credits" button links to `/pricing#credits-packs`
- [ ] Balance color-coded (green/orange/red)

**Test Steps**:
1. Sign in to account
2. Check header for coins icon with number
3. Click to open popover
4. Verify calculations match:
   - Images: balance / 5
   - Sora 2 Videos: balance / 20
   - Sora 2 Pro Videos: balance / 80

**Test Different Balances**:
- 0 credits → Red color, "Out of credits" message
- 10 credits → Orange color, "Low" badge
- 100 credits → Green color, normal display

---

### 3. Credits Pack Purchase Flow Test

**Pre-requisites**: Test mode enabled

**Expected Behavior**:
- [ ] Unauthenticated users redirected to sign-in
- [ ] Authenticated users see "Processing..." state
- [ ] Redirect to Creem checkout page
- [ ] Error messages display on failure

**Test Steps**:
1. Navigate to `/pricing#credits-packs`
2. Click "Buy Now" on 100 Credits pack
3. Verify redirect to Creem (test mode)
4. Complete test payment
5. Verify redirect to `/account?purchase=success`
6. Check credits added to balance

**Test Error Handling**:
```bash
# Temporarily remove CREEM_SECRET_KEY
# Click "Buy Now"
# Should show: "Failed to purchase credits. Please try again."
```

---

### 4. Sora Video Generator - Credits Test

**Pre-requisites**: 
- Logged in user
- Known credit balance

**Test Case A: Sufficient Credits**
1. Navigate to `/sora`
2. Enter prompt: "A sunset over mountains"
3. Select quality: Standard (20 credits)
4. Click "Generate Video"
5. Verify:
   - [ ] Generation starts
   - [ ] No upgrade prompt
   - [ ] Credits deducted after success

**Test Case B: Insufficient Credits (0-19 credits)**
1. Use account with <20 credits
2. Try to generate standard video
3. Verify:
   - [ ] Upgrade prompt appears
   - [ ] Shows "Not Enough Credits"
   - [ ] Displays: "You need 20 credits but only have X credits"
   - [ ] Progress bar shows current/required
   - [ ] "Upgrade to Pro" button visible
   - [ ] "Buy Credits" alternative shown (if Pro+)

**Test Case C: Pro Video (Free Tier)**
1. Sign in with free tier account
2. Select quality: HD (80 credits required)
3. Click "Generate Video"
4. Verify:
   - [ ] Upgrade prompt appears
   - [ ] Shows "Upgrade for Video Generation" or "Not Enough Credits"
   - [ ] Recommends Pro or Pro+ plan

---

### 5. Upgrade Prompt Variations Test

**Test Different Reasons**:

**A. Credits Insufficient**
```javascript
reason: 'credits'
currentCredits: 10
requiredCredits: 20
generationType: 'sora2Video'
```
Expected: Shows progress bar, credit shortage message, plan upgrade

**B. Daily Limit Reached**
```javascript
reason: 'daily_limit'
```
Expected: "Daily Limit Reached" title, "You've reached your daily limit of 3 images"

**C. Monthly Limit Reached**
```javascript
reason: 'monthly_limit'
```
Expected: "Monthly Limit Reached" title, upgrade to Pro message

**D. Video Generation (Free Tier)**
```javascript
reason: 'video_limit'
```
Expected: "Upgrade for Video Generation" title, Pro plan required

**E. Pro Feature**
```javascript
reason: 'pro_feature'
```
Expected: "Pro Feature" title, feature explanation

---

### 6. API Integration Tests

**A. GET /api/points/balance**
```bash
# Must be authenticated (cookie-based)
curl -X GET http://localhost:3000/api/points/balance \
  -H "Cookie: your-session-cookie" \
  -H "Accept: application/json"

# Expected Response:
{
  "balance": 150,
  "lifetime_earned": 300,
  "lifetime_spent": 150,
  "tier": "pro"
}
```

**B. POST /api/points/purchase**
```bash
curl -X POST http://localhost:3000/api/points/purchase \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"packId": "pack_100"}'

# Expected Response:
{
  "sessionId": "checkout_xxx",
  "url": "https://checkout.creem.io/xxx"
}
```

**C. POST /api/sora/create (with credits check)**
```bash
curl -X POST http://localhost:3000/api/sora/create \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "mode": "text-to-video",
    "prompt": "A beautiful landscape",
    "aspect_ratio": "landscape",
    "quality": "standard"
  }'

# Success Response:
{
  "taskId": "task_xxx",
  "creditsDeducted": 20,
  "remainingCredits": 130
}

# Error Response (402):
{
  "error": "Insufficient credits",
  "currentCredits": 10,
  "requiredCredits": 20,
  "code": "INSUFFICIENT_CREDITS"
}
```

---

### 7. E2E User Journey Tests

**Journey 1: Free User Tries Video**
1. Sign up new account (gets 30 free credits)
2. Navigate to Sora generator
3. Try to generate video (20 credits needed)
4. Generation succeeds
5. Credits reduced to 10
6. Try another video
7. Upgrade prompt appears
8. Click "Upgrade to Pro"
9. Redirected to pricing page
10. Complete subscription
11. Credits added
12. Can generate videos again

**Journey 2: Pro User Buys Credit Pack**
1. Sign in as Pro user
2. Use all monthly credits
3. Try to generate
4. Upgrade prompt shows "Just need a few more credits?"
5. Click "Browse Credit Packs"
6. Select 100 credits pack ($3.00)
7. Complete Creem checkout
8. Return to site
9. 100 credits added (+ any bonus)
10. Can generate again

**Journey 3: Guest User Flow**
1. Visit pricing page (not logged in)
2. Click "Start Pro" button
3. Redirected to sign-in with `redirect=/pricing&plan=pro`
4. Sign up/sign in
5. Redirected back to pricing with plan pre-selected
6. Click subscribe
7. Complete payment
8. Get Pro credits
9. Can use Pro features

---

## Automated Testing Commands

### Jest Tests (if implemented)
```bash
# Test points service
npm test -- points-service.test.ts

# Test API endpoints
npm test -- api/points

# Test components
npm test -- PointsBalance.test.tsx
npm test -- CreditsPacks.test.tsx
npm test -- UpgradePrompt.test.tsx
```

### Integration Tests
```bash
# Run BestAuth integration tests
npm test -- bestauth-integration.test.ts

# Test end-to-end flow
npm run test:e2e
```

---

## Common Issues & Debugging

### Issue: Points balance not showing
**Check**:
1. User is authenticated
2. Session cookie present
3. `/api/points/balance` returns 200
4. Browser console for errors

**Debug**:
```javascript
// In browser console
fetch('/api/points/balance', {credentials: 'include'})
  .then(r => r.json())
  .then(console.log)
```

### Issue: Purchase button doesn't work
**Check**:
1. CREEM_SECRET_KEY environment variable set
2. Product IDs configured
3. Network tab shows API call
4. Response contains checkout URL

**Debug**:
```javascript
// Check environment
console.log(process.env.NEXT_PUBLIC_CREEM_TEST_MODE)

// Check API response
fetch('/api/points/purchase', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({packId: 'pack_100'})
}).then(r => r.json()).then(console.log)
```

### Issue: Upgrade prompt not showing
**Check**:
1. API returns proper error code (402, 403, 429)
2. Error response includes required fields
3. Component state updates triggered
4. Modal open state is true

**Debug**:
```javascript
// In component
console.log('Upgrade modal state:', {
  showUpgradeModal,
  upgradeReason,
  currentCredits,
  requiredCredits
})
```

---

## Performance Benchmarks

### Expected Load Times
- Pricing page: < 1 second
- Points balance fetch: < 200ms
- Purchase API call: < 500ms
- Sora creation API: < 2 seconds

### Network Activity
- Points balance: Auto-refresh every 30 seconds
- No unnecessary API calls on page load
- Proper error retry logic

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces balance
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Error messages announced

---

## Production Readiness Checklist

### Environment Variables
- [ ] CREEM_SECRET_KEY set to production key
- [ ] NEXT_PUBLIC_CREEM_TEST_MODE=false
- [ ] All product IDs configured
- [ ] NEXT_PUBLIC_SITE_URL correct

### Database
- [ ] Points tables migrated
- [ ] Indexes created
- [ ] Constraints verified
- [ ] Seed data (if needed)

### Monitoring
- [ ] Error tracking configured
- [ ] Payment webhook alerts set
- [ ] Balance query performance monitored
- [ ] Conversion funnel tracked

### Documentation
- [ ] API docs updated
- [ ] Integration guide complete
- [ ] Troubleshooting guide available
- [ ] Team trained

---

## Test Data Setup

### Create Test Users
```sql
-- Free user with 30 credits
INSERT INTO bestauth_users (email, ...) VALUES ('free@test.com', ...);
INSERT INTO points_balance (user_id, balance, tier) VALUES (
  (SELECT id FROM bestauth_users WHERE email='free@test.com'),
  30,
  'free'
);

-- Pro user with 800 credits
INSERT INTO bestauth_users (email, ...) VALUES ('pro@test.com', ...);
INSERT INTO points_balance (user_id, balance, tier) VALUES (
  (SELECT id FROM bestauth_users WHERE email='pro@test.com'),
  800,
  'pro'
);

-- Pro+ user with 1600 credits
INSERT INTO bestauth_users (email, ...) VALUES ('proplus@test.com', ...);
INSERT INTO points_balance (user_id, balance, tier) VALUES (
  (SELECT id FROM bestauth_users WHERE email='proplus@test.com'),
  1600,
  'pro_plus'
);

-- User with low credits (10)
INSERT INTO bestauth_users (email, ...) VALUES ('low@test.com', ...);
INSERT INTO points_balance (user_id, balance, tier) VALUES (
  (SELECT id FROM bestauth_users WHERE email='low@test.com'),
  10,
  'free'
);
```

---

## Success Criteria

Integration is successful when:

1. ✅ All pricing displays correctly
2. ✅ Points balance updates in real-time
3. ✅ Purchase flow completes without errors
4. ✅ Upgrade prompts appear at correct times
5. ✅ Credits deducted on generation
6. ✅ Webhook processes payments
7. ✅ No console errors
8. ✅ Mobile responsive
9. ✅ Accessible
10. ✅ Fast loading (<2s)

---

*Last Updated*: 2025-10-15
