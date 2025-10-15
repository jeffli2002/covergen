# Free Tier Limits - Clarification Summary

**Date:** 2025-10-15  
**Status:** ✅ Corrected and Updated

---

## 🎯 Free Tier Configuration

### **Limits (from `/src/config/subscription.ts`)**

```typescript
SUBSCRIPTION_CONFIG.free = {
  dailyImageLimit: 3,      // 3 images per day
  monthlyImageLimit: 10,   // 10 images per month (hard cap)
  videoQuota: 0,           // No video access
  signupBonusPoints: 30,   // One-time signup bonus (authenticated only)
}
```

### **Key Points:**

1. **Shared Limits:** Daily and monthly limits apply to **BOTH** authenticated and unauthenticated users
2. **Signup Bonus:** 30 credits one-time bonus **ONLY** for authenticated users (on signup)
3. **No Monthly Credits:** Free tier gets 0 credits/month (only signup bonus)
4. **Hard Monthly Cap:** 10 images/month maximum regardless of credits

---

## 📊 Free Tier User Journey

### **Unauthenticated User (Guest)**
- ❌ No signup bonus
- ✅ 3 images/day limit
- ✅ 10 images/month limit
- ❌ No video access
- **Total possible:** 10 images/month max

### **Authenticated User (Signed Up)**
- ✅ 30 credits signup bonus (one-time)
- ✅ 3 images/day limit (same as guest)
- ✅ 10 images/month limit (same as guest)
- ❌ No video access
- **Total possible:** 10 images/month max (30 credits allows 6 images, but capped at 10/month)

---

## 🧮 Generation Costs

```typescript
PRICING_CONFIG.generationCosts = {
  nanoBananaImage: 5,     // 5 credits per image
  sora2Video: 20,         // 20 credits per video
  sora2ProVideo: 80,      // 80 credits per HD video
}
```

### **Free Tier Math:**

**Signup Bonus:**
- 30 credits ÷ 5 credits/image = **6 images possible**
- BUT monthly cap = 10 images total
- So: 6 bonus images + 4 additional images = 10/month max

**Daily Limit:**
- 3 images/day × 5 credits = **15 credits/day**
- After signup bonus exhausted, free tier has no way to earn more credits
- Daily limit becomes the only constraint

---

## 🔄 Usage Flow Examples

### **Example 1: Authenticated User - First Month**

| Day | Action | Credits Used | Credits Remaining | Monthly Count |
|-----|--------|--------------|-------------------|---------------|
| 1 | Sign up | 0 | 30 | 0 |
| 1 | Generate 3 images | 15 | 15 | 3 |
| 2 | Generate 3 images | 15 | 0 | 6 |
| 3 | **Out of credits** | - | 0 | 6 |
| 3 | Hits daily limit (0 credits) | - | 0 | 6 |

**Result:** Can only use signup bonus (6 images total in first month)

### **Example 2: Authenticated User - Second Month**

| Day | Action | Credits Used | Credits Remaining | Monthly Count |
|-----|--------|--------------|-------------------|---------------|
| 31 | New month starts | 0 | 0 (no monthly credits) | 0 |
| 31 | Try to generate | - | - | - |
| 31 | **Blocked: No credits** | - | 0 | 0 |

**Result:** Cannot generate any images (no monthly credits for free tier)

### **Example 3: Unauthenticated User**

| Day | Action | Credits Used | Credits Remaining | Monthly Count |
|-----|--------|--------------|-------------------|---------------|
| 1 | Visit site | 0 | 0 | 0 |
| 1 | Try to generate | - | - | - |
| 1 | **Blocked: No credits** | - | 0 | 0 |

**Result:** Cannot generate (no credits, no signup bonus)

---

## ⚠️ Critical Correction

### **Previous Understanding (WRONG):**
- ❌ Free tier gets 6 images/day
- ❌ Authenticated users have different limits than guests
- ❌ 30 credits = 6 images with no other limits

### **Correct Understanding (RIGHT):**
- ✅ Free tier: **3 images/day, 10/month max** (all users)
- ✅ Authenticated users get **30 credits one-time bonus**
- ✅ Daily and monthly limits apply **regardless of credits balance**
- ✅ After signup bonus exhausted, free users cannot generate more (0 monthly credits)

---

## 🚨 Implications for UpgradePrompt

### **Scenario A: Daily Limit Reached**
```
User generates: 3 images today
Attempt: 4th image
Result: UpgradePrompt with reason="daily_limit"
Message: "You've reached your daily limit of 3 images. Upgrade to Pro for 800 credits/month!"
```

### **Scenario B: Monthly Limit Reached**
```
User generates: 10 images this month (across multiple days)
Attempt: 11th image
Result: UpgradePrompt with reason="monthly_limit"
Message: "You've reached your monthly limit of 10 images. Upgrade to Pro for 160 images/month!"
```

### **Scenario C: No Credits (After Signup Bonus)**
```
User generates: 6 images (used 30 signup credits)
Attempt: 7th image (same month, but new day)
Result: UpgradePrompt with reason="credits" (insufficient balance)
Message: "You need 5 credits but only have 0 credits remaining. Upgrade to get monthly credits!"
```

---

## 📝 Updated Components

All UpgradePrompt components now correctly reflect:

1. **`src/components/auth/UpgradePrompt.tsx`**
   - Shows 3/day, 10/month limits
   - Shows 30 credits signup bonus
   - Uses `PRICING_CONFIG` for all values

2. **`src/components/pricing/UpgradePrompt.tsx`**
   - Displays credit-based messaging
   - Handles all 5 upgrade scenarios
   - Uses `PRICING_CONFIG` for calculations

3. **`src/lib/subscription-plans.ts`**
   - Free tier features updated
   - Credits and limits from `PRICING_CONFIG`
   - No hardcoded values

---

## ✅ Verification Checklist

- [x] Free tier limits: 3/day, 10/month
- [x] Signup bonus: 30 credits (one-time)
- [x] No monthly credits for free tier
- [x] Daily/monthly limits shared between auth/unauth
- [x] All UpgradePrompt components use config values
- [x] No hardcoded limits in code
- [x] Test scenarios updated with correct limits

---

**Last Updated:** 2025-10-15  
**Config Source:** `/src/config/subscription.ts`  
**Components Updated:** 3 files (UpgradePrompt × 2, subscription-plans.ts)
