# Face Detection Not Working - Debug Guide

## Issue
Google Vision API is not detecting people in uploaded images, allowing images with faces to pass validation.

## Possible Causes

### 1. API Key Not Set in Production
**Check:** Vercel environment variables
- Go to Vercel Dashboard → Project Settings → Environment Variables
- Verify `GOOGLE_CLOUD_VISION_API_KEY` is set
- Make sure it's enabled for Production environment

### 2. API Key Invalid or Quota Exceeded
**Check:** Google Cloud Console
- Go to: https://console.cloud.google.com/apis/dashboard
- Check Vision API is enabled
- Check quota usage and limits
- Verify API key has Vision API permissions

### 3. Validation Config Disabled
**Check:** Environment variables in Vercel
```bash
VALIDATION_ENABLED=true          # Must be true
VALIDATION_LAYER_COPYRIGHT=true  # Must be true
VALIDATION_FACE_CONFIDENCE=0.7   # Threshold (0.0-1.0)
```

### 4. Image URL Not Accessible
**Issue:** Vision API requires publicly accessible URLs
**Check:** 
- Image must be hosted on public URL (Cloudinary, ImgBB, etc.)
- No authentication required to access
- HTTPS preferred
- URL must not be temporary/expired

### 5. Confidence Threshold Too High
**Default:** 0.7 (70% confidence)
**Issue:** Some faces may have lower confidence scores

**Fix:** Lower threshold temporarily for testing:
```bash
VALIDATION_FACE_CONFIDENCE=0.5  # 50% confidence
```

### 6. Client Initialization Failing
**Check logs for:**
```
[GoogleVision] Failed to initialize client
[CopyrightValidator] ❌ Google Vision NOT AVAILABLE
```

## Debug Steps

### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard → Deployments → Your deployment
2. Click "Functions" tab
3. Look for logs from `/api/sora/upload-image` or `/api/sora/create`
4. Search for these log messages:

**Good signs:**
```
[CopyrightValidator] ===== STARTING COPYRIGHT VALIDATION =====
[CopyrightValidator] ✅ Google Vision service available
[GoogleVision] Raw API response - Total faces found: 2
[GoogleVision] Face 1: confidence 0.956
[CopyrightValidator] ❌ BLOCKED: 2 face(s) detected
```

**Bad signs:**
```
[CopyrightValidator] ❌ Google Vision NOT AVAILABLE
[GoogleVision] Client not available, skipping face detection
[Sora API] Copyright validation disabled in config
```

### Step 2: Test API Key Locally
Run this command to test the API key:
```bash
node test-vision-api-direct.mjs
```

Expected output:
```
✅ Client initialized
Testing: Portrait with clear face
Found 2 face(s)
  Face 1: Detection Confidence: 95.6%
```

### Step 3: Check Environment Variables
```bash
# In Vercel Dashboard
GOOGLE_CLOUD_VISION_API_KEY=AIzaSy...   # Should be set
VALIDATION_ENABLED=true                  # Should be true
VALIDATION_LAYER_COPYRIGHT=true          # Should be true
```

### Step 4: Verify API Quota
1. Go to: https://console.cloud.google.com/apis/api/vision.googleapis.com/quotas
2. Check "Requests per minute"
3. Check if quota is exceeded

### Step 5: Test with Known Image
Upload this test image (known to have a clear face):
```
https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800
```

## Expected Behavior

### When Working Correctly:
1. User uploads image with face
2. Image uploaded to Cloudinary
3. Copyright validation runs
4. Google Vision API called
5. **Face detected** with confidence > 0.7
6. **Request blocked** with error message
7. User sees: "Image contains people or faces"

### When NOT Working:
1. User uploads image with face
2. Image uploaded to Cloudinary
3. Copyright validation **skipped** or **passes**
4. Image accepted
5. Video generation proceeds (will fail at Sora API)

## Quick Fixes

### Fix 1: Ensure API Key is Set
```bash
# In Vercel Dashboard → Environment Variables → Add
GOOGLE_CLOUD_VISION_API_KEY=AIzaSyDMqs5-jgRG3p4rmrC0DomOd6FvrcLsrx8
```

### Fix 2: Enable Validation
```bash
# In Vercel Dashboard → Environment Variables → Add
VALIDATION_ENABLED=true
VALIDATION_LAYER_COPYRIGHT=true
```

### Fix 3: Lower Confidence Threshold (Testing Only)
```bash
# In Vercel Dashboard → Environment Variables → Add/Update
VALIDATION_FACE_CONFIDENCE=0.5
```

### Fix 4: Redeploy After Changes
After updating environment variables:
1. Go to Deployments
2. Click ••• on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

## Testing After Fix

### Test 1: Upload Image With Face
1. Go to your app → Sora Video Generator
2. Switch to "Image to Video" tab
3. Upload a photo of a person
4. **Expected:** Error message "Image contains people or faces"
5. **If passed:** Check logs for why validation was skipped

### Test 2: Upload Image Without Face
1. Upload a landscape or nature photo
2. **Expected:** Upload succeeds, no error
3. Can proceed to video generation

## Monitoring

### Check these logs after deployment:
```bash
# Good - validation working
[CopyrightValidator] ===== STARTING COPYRIGHT VALIDATION =====
[GoogleVision] Raw API response - Total faces found: 1
[CopyrightValidator] ❌ BLOCKED: 1 face(s) detected

# Bad - validation not working
[CopyrightValidator] ❌ Google Vision NOT AVAILABLE
[Sora API] Copyright validation disabled in config
```

## Common Issues

### Issue: "API key not set"
**Solution:** Set `GOOGLE_CLOUD_VISION_API_KEY` in Vercel

### Issue: "Client not available"
**Solution:** API key invalid or Vision API not enabled

### Issue: "Validation skipped"
**Solution:** Set `VALIDATION_ENABLED=true` and `VALIDATION_LAYER_COPYRIGHT=true`

### Issue: "Faces found but not blocked"
**Solution:** Confidence below threshold - check logs for actual confidence scores

### Issue: "API quota exceeded"
**Solution:** Increase quota in Google Cloud Console or wait for reset

## Contact Support

If issue persists after trying all fixes:
1. Export Vercel function logs
2. Run local test: `node test-vision-api-direct.mjs`
3. Check Google Cloud Console for API errors
4. Verify API key has Vision API permissions

## Latest Code Changes
- Commit `e1cab33`: Added comprehensive logging
- Commit `a3c8375`: Added package.json dependency
- Commit `8440c14`: Re-enabled validation with Node.js runtime

All validation code is in:
- `/src/lib/validation/services/google-vision.ts`
- `/src/lib/validation/validators/copyright-validator.ts`
- `/src/app/api/sora/upload-image/route.ts`
- `/src/app/api/sora/create/route.ts`
