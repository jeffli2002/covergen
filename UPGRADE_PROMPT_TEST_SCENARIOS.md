# UpgradePrompt - Complete Test Scenarios

**Generated:** 2025-10-15  
**Purpose:** Comprehensive testing of all UpgradePrompt trigger scenarios

---

## 📋 Summary of Trigger Scenarios

| # | Scenario | Component | Reason | Status Code | User Type |
|---|----------|-----------|--------|-------------|-----------|
| 1 | Insufficient Credits | Sora Video | `credits` | 402 | Authenticated |
| 2 | Daily Image Limit | Image Generator | `daily_limit` | 429 | Free/Trial |
| 3 | Monthly Image Limit | Image Generator | `monthly_limit` | 429 | Free |
| 4 | Daily Video Limit | Sora Video | `daily_limit` | 429 | Trial |
| 5 | Monthly Video Limit | Sora Video | `monthly_limit` | 429 | Pro/Pro+ |
| 6 | Free Tier Video Access | Sora Video | `video_limit` | 403 | Free |
| 7 | Pro Feature (HD Quality) | Sora Video | `pro_feature` | 402 | Pro (not Pro+) |
| 8 | Unauthenticated Generation | All | N/A | N/A | Guest |

---

## 🧪 Test Scenarios

### **Scenario 1: Insufficient Credits (Sora Video)**

**Component:** `src/components/sora-video-generator.tsx`  
**Trigger:** User doesn't have enough credits for video generation

**Steps to Reproduce:**
1. Sign in as authenticated user with low credits (e.g., 10 credits)
2. Navigate to Sora video generator
3. Select **HD Quality** (costs 80 credits for sora2ProVideo)
4. Enter prompt: "A beautiful sunset over mountains"
5. Click "Generate Video"

**Expected Behavior:**
```json
API Response: /api/sora/create
Status: 402 Payment Required
{
  "error": "Insufficient credits for video generation",
  "insufficientPoints": true,
  "currentBalance": 10,
  "requiredPoints": 80,
  "shortfall": 70
}
```

**UpgradePrompt Display:**
- ✅ Shows `reason="credits"`
- ✅ Shows current credits: 10
- ✅ Shows required credits: 80
- ✅ Shows generation type: "sora2ProVideo"
- ✅ Displays progress bar: 10/80 (12.5%)
- ✅ Message: "You need 80 credits but only have 10 credits remaining"
- ✅ Recommends Pro+ plan (1,600 credits/month)
- ✅ Shows "Buy Credits Pack" option

**Files Involved:**
- `src/components/sora-video-generator.tsx:266-272`
- `src/components/pricing/UpgradePrompt.tsx:84-86`
- `src/app/api/sora/create/route.ts:115-129`

---

### **Scenario 2: Daily Image Limit Reached (Free Tier)**

**Component:** `src/components/image-generator.tsx`  
**Trigger:** Free user generates 3 images in one day (daily limit)

**Steps to Reproduce:**
1. Sign in as Free tier user (or unauthenticated)
2. Generate 3 Nano Banana images (uses 15 credits = 3 images × 5 credits)
3. Attempt to generate 4th image on same day

**Expected Behavior:**
```json
API Response: /api/generate
Status: 429 Too Many Requests
{
  "error": "Daily generation limit reached (3/3). Please try again tomorrow or upgrade to Pro plan.",
  "limit_reached": true,
  "daily_count": 3,
  "daily_limit": 3,
  "is_trial": false,
  "subscription_tier": "free"
}
```

**UpgradePrompt Display:**
- ✅ Shows `reason="daily_limit"`
- ✅ Message: "You've reached your daily limit of 3 images"
- ✅ Recommends Pro plan (800 credits/month = 160 images)
- ✅ Shows "Your limits reset tomorrow"
- ✅ Badge: "Used 3 / 3 images today"

**Files Involved:**
- `src/components/image-generator.tsx:69-72, 171-177`
- `src/components/auth/UpgradePrompt.tsx:102`
- `src/app/api/generate/route.ts:150-160`
- `src/config/subscription.ts:13` (dailyImageLimit: 3)

---

### **Scenario 3: Monthly Image Limit Reached (Free Tier)**

**Component:** `src/components/image-generator.tsx`  
**Trigger:** Free user hits 10 images/month limit

**Steps to Reproduce:**
1. Sign in as Free tier user
2. Generate 10 images across multiple days (respecting 3/day limit)
   - Day 1: 3 images (15 credits used)
   - Day 2: 3 images (15 credits used, 30 credits total - signup bonus exhausted)
   - Day 3: 3 images (from new allocation)
   - Day 4: 1 image (reaches 10 monthly limit)
3. Attempt to generate 11th image in same month

**Expected Behavior:**
```json
API Response: /api/generate
Status: 429 Too Many Requests
{
  "error": "Monthly generation limit reached (10/10 images). Upgrade to Pro plan.",
  "limit_reached": true,
  "monthly_usage": 10,
  "monthly_limit": 10,
  "subscription_tier": "free"
}
```

**UpgradePrompt Display:**
- ✅ Shows `reason="monthly_limit"`
- ✅ Message: "You've reached your monthly limit of 10 images"
- ✅ Recommends Pro plan (800 credits/month = 160 images)
- ✅ Shows "Your limits reset next month"

**Files Involved:**
- `src/components/image-generator.tsx:69-72`
- `src/components/pricing/UpgradePrompt.tsx:88-89`
- `src/config/subscription.ts:14` (monthlyImageLimit: 10)

---

### **Scenario 4: Daily Video Limit Reached (Trial User)**

**Component:** `src/components/sora-video-generator.tsx`  
**Trigger:** Trial user generates maximum daily videos

**Steps to Reproduce:**
1. Sign in as trial user (3-day trial)
2. Generate daily video limit (e.g., 2 videos/day for trial)
3. Attempt to generate another video same day

**Expected Behavior:**
```json
API Response: /api/sora/create
Status: 429 Too Many Requests
{
  "error": "Daily trial video limit reached (2/2 videos today). Try again tomorrow or upgrade to Pro plan!",
  "limitReached": true,
  "limitType": "daily",
  "currentTier": "free",
  "dailyUsage": 2,
  "dailyLimit": 2,
  "monthlyUsage": 4,
  "monthlyLimit": 6
}
```

**UpgradePrompt Display:**
- ✅ Shows `reason="daily_limit"`
- ✅ Message: "You've reached your daily limit during trial"
- ✅ Shows trial days remaining
- ✅ Recommends Pro plan
- ✅ "Try Again Tomorrow" button

**Files Involved:**
- `src/components/sora-video-generator.tsx:276-285`
- `src/app/api/sora/create/route.ts:57-63`

---

### **Scenario 5: Monthly Video Limit Reached (Pro User)**

**Component:** `src/components/sora-video-generator.tsx`  
**Trigger:** Pro user exhausts monthly video credits

**Steps to Reproduce:**
1. Sign in as Pro user (800 credits/month)
2. Generate 40 Sora 2 videos (40 × 20 credits = 800 credits)
3. Attempt to generate 41st video

**Expected Behavior:**
```json
API Response: /api/sora/create
Status: 429 Too Many Requests
{
  "error": "Monthly video limit reached (800/800 credits). Upgrade to Pro+ for 1,600 credits/month.",
  "limitReached": true,
  "limitType": "monthly",
  "currentTier": "pro",
  "monthlyUsage": 800,
  "monthlyLimit": 800
}
```

**UpgradePrompt Display:**
- ✅ Shows `reason="monthly_limit"`
- ✅ Message: "Monthly limit reached"
- ✅ Recommends Pro+ upgrade (1,600 credits)
- ✅ Shows "Your limits reset next month"

**Files Involved:**
- `src/components/sora-video-generator.tsx:279-280`
- `src/app/api/sora/create/route.ts:64-73`

---

### **Scenario 6: Free Tier Video Access Denied**

**Component:** `src/components/sora-video-generator.tsx`  
**Trigger:** Free user attempts to generate any video

**Steps to Reproduce:**
1. Sign in as Free tier user (no paid subscription)
2. Navigate to Sora video generator
3. Enter prompt: "A peaceful lake at sunrise"
4. Click "Generate Video"

**Expected Behavior:**
```json
API Response: /api/sora/create
Status: 403 Forbidden
{
  "error": "Sora 2 video generation requires a Pro plan",
  "limitReached": true,
  "currentTier": "free"
}
```

**UpgradePrompt Display:**
- ✅ Shows `reason="video_limit"`
- ✅ Message: "Sora 2 video generation is available on Pro and Pro+ plans"
- ✅ Highlights video generation feature
- ✅ Recommends Pro plan
- ✅ Shows pricing with 20 credits/video cost

**Files Involved:**
- `src/components/sora-video-generator.tsx:289-293`
- `src/components/pricing/UpgradePrompt.tsx:90-91`
- `src/app/api/sora/create/route.ts:74-97`

---

### **Scenario 7: Pro Feature (Sora 2 Pro HD Quality)**

**Component:** `src/components/sora-video-generator.tsx`  
**Trigger:** Pro user tries HD quality (requires Pro+)

**Steps to Reproduce:**
1. Sign in as Pro user (not Pro+)
2. Navigate to Sora video generator
3. Select **HD Quality** instead of Standard
4. Enter prompt and generate

**Expected Behavior:**
```json
API Response: /api/sora/create
Status: 402 Payment Required
{
  "error": "Insufficient credits for Sora 2 Pro quality",
  "insufficientPoints": true,
  "currentBalance": 800,
  "requiredPoints": 80,
  "message": "Sora 2 Pro requires 80 credits (4x more than standard). Consider Pro+ plan."
}
```

**UpgradePrompt Display:**
- ✅ Shows `reason="pro_feature"` or `reason="credits"`
- ✅ Message: "This feature is available on Pro+ plans"
- ✅ Explains 80 credits for HD vs 20 for standard
- ✅ Recommends Pro+ plan
- ✅ Alternative: Use standard quality

**Files Involved:**
- `src/components/sora-video-generator.tsx:266-272`
- `src/components/pricing/UpgradePrompt.tsx:92-93`
- `src/app/api/sora/create/route.ts:115-129`

---

### **Scenario 8: Unauthenticated User**

**Component:** All generators  
**Trigger:** Guest user attempts generation

**Steps to Reproduce:**
1. Open site without signing in
2. Navigate to any generator (Image or Sora)
3. Enter prompt and click generate

**Expected Behavior:**
- ✅ Shows `AuthForm` modal (NOT UpgradePrompt)
- ✅ "Sign In Required" message
- ✅ Sign In button
- ✅ Create Free Account button
- ✅ Message: "Please sign in to generate images/videos"

**After Sign In:**
- ✅ AuthForm closes
- ✅ Generation proceeds with user limits
- ✅ If limits hit → shows UpgradePrompt

**Files Involved:**
- `src/components/sora-video-generator.tsx:118-122`
- `src/components/image-generator.tsx:69-72`
- `src/components/auth/UpgradePrompt.tsx:95-99`

---

## 🔍 Validation Checklist

For each scenario, verify:

### **Data Accuracy:**
- [ ] Current credits/usage displays correctly
- [ ] Required credits/limits displays correctly
- [ ] Plan pricing shows from `PRICING_CONFIG`
- [ ] No hardcoded values (16.99, 29.99, 100 images, etc.)

### **UI Elements:**
- [ ] Modal opens on trigger
- [ ] Close button works
- [ ] Recommended plan highlighted
- [ ] Credit progress bar (if applicable)
- [ ] Badge shows current tier
- [ ] Upgrade button navigates to `/pricing`

### **Messaging:**
- [ ] Error message matches scenario
- [ ] Reason code correct
- [ ] Recommendations appropriate
- [ ] Alternative actions shown

### **Navigation:**
- [ ] "Upgrade" button → `/pricing?highlight={plan}`
- [ ] "Buy Credits" button → `/pricing#credits-packs`
- [ ] "Sign In" button → `/sign-in?redirect=/pricing`
- [ ] "Try Again Tomorrow" closes modal

---

## 📊 Expected PRICING_CONFIG Values

All UpgradePrompt displays should use these dynamic values:

```typescript
// From /src/config/pricing.config.ts & /src/config/subscription.ts

SUBSCRIPTION_CONFIG.free
{
  dailyImageLimit: 3,     // 3 images per day (shared between auth/unauth)
  monthlyImageLimit: 10,  // 10 images per month max
  signupBonusPoints: 30,  // One-time signup bonus
  videoQuota: 0           // No video access for free tier
}

PRICING_CONFIG.plans[0] // Free
{
  credits: { onSignup: 30, monthly: 0 },
  price: { monthly: 0, yearly: 0 }
}

PRICING_CONFIG.plans[1] // Pro
{
  credits: { monthly: 800, yearly: 9600 },
  price: { monthly: 14.9, yearly: 143.04 }
}

PRICING_CONFIG.plans[2] // Pro+
{
  credits: { monthly: 1600, yearly: 19200 },
  price: { monthly: 26.9, yearly: 258.24 }
}

PRICING_CONFIG.generationCosts
{
  nanoBananaImage: 5,
  sora2Video: 20,
  sora2ProVideo: 80
}
```

**Free Tier Clarification:**
- **Daily Limit:** 3 images/day (applies to ALL users, auth and unauth)
- **Monthly Limit:** 10 images/month max
- **Signup Bonus:** 30 credits one-time (authenticated users only)
- **30 Credits = 6 images** but monthly cap is 10 images total
- **No video generation** for free tier

**Calculated Limits:**
- Free: 3/day, 10/month, 30 credits signup bonus = max 6 bonus images
- Pro: 800 credits = 160 images or 40 videos or 10 Pro videos
- Pro+: 1600 credits = 320 images or 80 videos or 20 Pro videos

---

## 🎯 Critical Test Cases

### **Priority 1 - High Impact:**
1. ✅ **Scenario 1:** Insufficient credits (most common)
2. ✅ **Scenario 6:** Free tier video access (conversion driver)
3. ✅ **Scenario 2:** Daily image limit (free tier)

### **Priority 2 - Medium Impact:**
4. ✅ **Scenario 3:** Monthly credit limit
5. ✅ **Scenario 5:** Monthly video limit (Pro users)
6. ✅ **Scenario 7:** Pro feature access (HD quality)

### **Priority 3 - Edge Cases:**
7. ✅ **Scenario 4:** Daily video limit (trial users)
8. ✅ **Scenario 8:** Unauthenticated users

---

## 🧰 Testing Tools

### **Manual Testing:**
```bash
# 1. Run development server
npm run dev

# 2. Open browser DevTools → Network tab
# 3. Monitor API calls to /api/generate and /api/sora/create
# 4. Verify status codes and response bodies
```

### **Check Points Balance:**
```bash
# Query user's current points
curl http://localhost:3000/api/points/balance \
  -H "Cookie: session=YOUR_SESSION"
```

### **Simulate Low Credits:**
```sql
-- Directly modify user points in database
UPDATE user_points
SET balance = 10
WHERE user_id = 'USER_ID';
```

### **Verify PRICING_CONFIG Loading:**
```javascript
// In browser console
import { PRICING_CONFIG } from '@/config/pricing.config'
console.log('Pro price:', PRICING_CONFIG.plans[1].price.monthly) // Should be 14.9
console.log('Image cost:', PRICING_CONFIG.generationCosts.nanoBananaImage) // Should be 5
```

---

## ✅ Success Criteria

All scenarios pass if:

1. **No hardcoded values visible** (16.99, 29.99, 100 images, etc.)
2. **Pricing reads from PRICING_CONFIG** dynamically
3. **Correct UpgradePrompt reason** for each scenario
4. **Accurate credit/usage display**
5. **Appropriate plan recommendations**
6. **All navigation links work**
7. **Modal can be closed**
8. **Responsive on mobile and desktop**

---

## 📝 Test Results Template

```markdown
### Test Run: [Date]

**Tester:** [Name]  
**Environment:** [Dev/Staging/Production]

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. Insufficient Credits | ✅ PASS | Credits display correctly |
| 2. Daily Image Limit | ✅ PASS | |
| 3. Monthly Credit Limit | ⚠️ PARTIAL | See note below |
| 4. Daily Video Limit | ✅ PASS | |
| 5. Monthly Video Limit | ✅ PASS | |
| 6. Free Tier Video | ✅ PASS | |
| 7. Pro Feature (HD) | ✅ PASS | |
| 8. Unauthenticated | ✅ PASS | |

**Issues Found:**
- [Issue description]

**PRICING_CONFIG Verified:** ✅ All values dynamic
```

---

**Last Updated:** 2025-10-15  
**Files Modified:** 
- `src/components/auth/UpgradePrompt.tsx` (uses PRICING_CONFIG)
- `src/components/pricing/UpgradePrompt.tsx` (uses PRICING_CONFIG)
- `src/lib/subscription-plans.ts` (uses PRICING_CONFIG)
- `src/services/payment/creem.ts` (uses PRICING_CONFIG)
