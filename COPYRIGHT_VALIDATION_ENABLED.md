# Copyright Validation - Re-enabled (2025-10-08)

## Issue Summary
Google Vision API face/people detection was **disabled** in the Sora video generation flow, allowing users to upload images with faces/people without validation. This created:
- Risk of violating Sora/OpenAI content policies
- Wasted API charges on requests that would fail
- Poor user experience with unclear error messages

## Root Cause
The validation was disabled due to Edge runtime compatibility issues with the `@google-cloud/vision` package, which requires Node.js runtime.

## Solution Implemented

### 1. Fixed Edge Runtime Compatibility
**Files Modified:**
- `src/app/api/sora/create/route.ts` (line 9)
- `src/app/api/sora/upload-image/route.ts` (line 5)

**Change:**
```typescript
// CRITICAL: Use Node.js runtime for @google-cloud/vision compatibility
export const runtime = 'nodejs'
```

This forces Next.js to use Node.js runtime instead of Edge runtime, allowing the Google Vision API package to work correctly.

### 2. Re-enabled Copyright Validation in Create Endpoint
**File:** `src/app/api/sora/create/route.ts` (lines 6, 236-262)

**Changes:**
1. Added import:
   ```typescript
   import { validateCopyright, getValidationConfig } from '@/lib/validation'
   ```

2. Replaced disabled validation block with active validation:
   ```typescript
   // COPYRIGHT VALIDATION - Prevent API charges for images with faces, logos, watermarks
   console.log('[Sora API] Starting copyright validation...')
   
   const validationConfig = getValidationConfig()
   
   if (validationConfig.enabled && validationConfig.layers.copyright) {
     try {
       const copyrightResult = await validateCopyright(cleanImageUrl, validationConfig)
       
       if (!copyrightResult.valid) {
         console.error('[Sora API] Copyright validation failed:', copyrightResult)
         return NextResponse.json(
           { 
             error: copyrightResult.error || 'Image failed copyright validation',
             details: copyrightResult.details,
             suggestion: copyrightResult.suggestion,
             code: copyrightResult.code,
             validationFailed: true
           },
           { status: 400 }
         )
       }
       
       console.log('[Sora API] ✅ Copyright validation passed')
     } catch (validationError) {
       console.error('[Sora API] Copyright validation error:', validationError)
       // On error, continue with warning (graceful degradation)
       console.warn('[Sora API] ⚠️ Continuing despite validation error')
     }
   }
   ```

### 3. Added Early Validation in Upload Endpoint
**File:** `src/app/api/sora/upload-image/route.ts` (lines 2, 5, 172-195)

**Benefits:**
- Catches copyright issues immediately after upload
- Better user experience (fail fast)
- Saves processing time and API calls

**Implementation:**
```typescript
// EARLY COPYRIGHT VALIDATION - Check immediately after upload
console.log('[Upload Image] Running early copyright validation...')
const validationConfig = getValidationConfig()

if (validationConfig.enabled && validationConfig.layers.copyright) {
  try {
    const copyrightResult = await validateCopyright(imageUrl, validationConfig)
    
    if (!copyrightResult.valid) {
      console.error('[Upload Image] Early copyright validation failed:', copyrightResult)
      return NextResponse.json(
        { 
          error: copyrightResult.error || 'Image failed copyright validation',
          details: copyrightResult.details,
          suggestion: copyrightResult.suggestion,
          code: copyrightResult.code,
          validationFailed: true
        },
        { status: 400 }
      )
    }
    
    console.log('[Upload Image] ✅ Early copyright validation passed')
  } catch (validationError) {
    console.error('[Upload Image] Early copyright validation error:', validationError)
    console.warn('[Upload Image] ⚠️ Continuing despite validation error')
  }
}
```

## Validation Flow

### Two-Layer Validation Strategy

#### Layer 1: Upload Endpoint (Early Detection)
**Endpoint:** `POST /api/sora/upload-image`
**Timing:** Immediately after image is uploaded to Cloudinary
**Purpose:** Fail fast, save processing time

```
User uploads image
    ↓
Upload to Cloudinary (with validation retries)
    ↓
Wait for CDN propagation (3 seconds)
    ↓
✅ Validate image accessibility
    ↓
✅ Run Google Vision API validation
    ├── Face detection (threshold: 0.7)
    ├── Logo detection (threshold: 0.7)
    └── Text/watermark detection
    ↓
❌ Block if face/logo/watermark detected
✅ Return imageUrl if passed
```

#### Layer 2: Create Endpoint (Final Check)
**Endpoint:** `POST /api/sora/create`
**Timing:** Before sending to Sora API
**Purpose:** Double-check protection, handles direct URL submissions

```
User submits video generation request
    ↓
Authentication & usage limit checks
    ↓
Clean and normalize image URL
    ↓
✅ Validate image accessibility (3 retries)
    ↓
✅ Run Google Vision API validation again
    ├── Face detection
    ├── Logo detection
    └── Text/watermark detection
    ↓
❌ Block if validation fails
✅ Send to Sora API if passed
```

## Detection Capabilities

### 1. Face Detection
- **API:** Google Vision `faceDetection()`
- **Threshold:** 0.7 confidence (configurable)
- **Blocks:** Any image with identifiable people/faces
- **Error Message:** "Image contains people or faces"
- **Suggestion:** Use landscapes, abstract graphics, AI-generated images without faces

### 2. Logo Detection
- **API:** Google Vision `logoDetection()`
- **Threshold:** 0.7 confidence (configurable)
- **Blocks:** Images with brand logos or trademarks
- **Error Message:** "Image contains brand logos or trademarks"
- **Suggestion:** Remove branded areas, use plain backgrounds

### 3. Watermark Detection
- **API:** Google Vision `textDetection()`
- **Detects:** Copyright symbols (©, ®, ™), stock photo watermarks
- **Keywords:** 'watermark', 'shutterstock', 'getty', 'istock', 'stock photo'
- **Error Message:** "Image contains copyright notices or watermarks"
- **Suggestion:** Use original photos, royalty-free images, AI-generated content

## Configuration

### Environment Variables
```bash
# Google Cloud Vision API
GOOGLE_CLOUD_VISION_API_KEY=AIzaSyDMqs5-jgRG3p4rmrC0DomOd6FvrcLsrx8

# Validation Configuration
VALIDATION_ENABLED=true
VALIDATION_MODE=strict
VALIDATION_LAYER_COPYRIGHT=true
VALIDATION_FACE_CONFIDENCE=0.7
VALIDATION_LOGO_CONFIDENCE=0.7
```

### Validation Modes by Tier
**Free Tier:**
- Mode: `strict`
- Face confidence: 0.7 (detects most faces)
- Logo confidence: 0.7

**Pro Tier:**
- Mode: `moderate`
- Face confidence: 0.8 (only high confidence)
- Logo confidence: 0.7

**Pro+ Tier:**
- Mode: `permissive`
- Face confidence: 0.8
- Logo confidence: 0.8 (higher threshold)

## Error Handling

### Graceful Degradation
If Google Vision API fails or is unavailable:
1. Log error to console
2. Continue with request (don't block user)
3. Rely on Sora API's own validation as fallback

**Rationale:** Better to allow some bad images than block all images when service is down.

### Error Response Format
```json
{
  "error": "Image contains people or faces",
  "details": "Detected 2 people in the image with 87% confidence",
  "suggestion": "Sora has strict restrictions on images with identifiable people. Please try:\n• Using landscape/nature photos without people\n• Abstract graphics or illustrations\n• AI-generated images without faces\n• Your own selfies (may still be blocked)\n• Simple objects or patterns",
  "code": "COPYRIGHT_FACE_DETECTED",
  "validationFailed": true
}
```

## Testing

### Test Script
Created `test-copyright-validation.js` to verify the complete flow:

```bash
node test-copyright-validation.js
```

**Test Cases:**
1. Image with face (should be blocked with error message)
2. Image without face (should pass validation)

### Manual Testing
1. **Upload image with face:**
   - Use Sora video generator
   - Upload any photo with a person
   - Should see error immediately after upload

2. **Upload landscape image:**
   - Use nature/landscape photo
   - Should pass validation
   - Can proceed to video generation

## Files Modified
1. `src/app/api/sora/create/route.ts` - Re-enabled validation, added Node.js runtime
2. `src/app/api/sora/upload-image/route.ts` - Added early validation, Node.js runtime
3. `test-copyright-validation.js` - Created test script
4. `COPYRIGHT_VALIDATION_ENABLED.md` - This documentation

## Related Documentation
- `src/lib/validation/services/google-vision.ts` - Google Vision API integration
- `src/lib/validation/validators/copyright-validator.ts` - Validation logic
- `docs/VALIDATION_SETUP_GUIDE.md` - Setup guide
- `docs/VIDEO_VALIDATION_ARCHITECTURE.md` - Architecture design
- `CLAUDE.md` - Project instructions (line 233-236 updated)

## Monitoring

### Console Logs
Watch for these log messages:

**Success:**
```
[Upload Image] Running early copyright validation...
[Upload Image] ✅ Early copyright validation passed
[Sora API] Starting copyright validation...
[Sora API] ✅ Copyright validation passed
```

**Blocked:**
```
[Upload Image] Early copyright validation failed: {...}
[Sora API] BLOCKED: 2 face(s) detected
```

**Error:**
```
[Upload Image] Early copyright validation error: {...}
[Upload Image] ⚠️ Continuing despite validation error
```

## Security & Compliance

### Why This Matters
1. **Sora Policy Compliance:** Sora/OpenAI strictly prohibits images with identifiable people
2. **Cost Savings:** Failed validations waste API credits
3. **User Experience:** Clear error messages help users understand restrictions
4. **Legal Protection:** Helps prevent copyright infringement

### What Gets Blocked
✅ **Blocked:**
- Photos with people/faces
- Brand logos (Nike, Apple, etc.)
- Stock photos with watermarks
- Images with copyright symbols

✅ **Allowed:**
- Landscapes without people
- Abstract art
- AI-generated images (without faces)
- Simple objects/patterns
- Personal photos (if no faces)

## Future Improvements
1. Add NSFW content detection (existing but not enabled)
2. Add quality validation (blur, resolution)
3. Add caching for validated images (avoid re-checking)
4. Add admin override for Pro+ users
5. Add detailed analytics on rejection reasons

## Testing Checklist
- [x] Node.js runtime configured
- [x] Import statements added
- [x] Validation enabled in create endpoint
- [x] Early validation in upload endpoint
- [x] Error messages with suggestions
- [x] Graceful degradation on API failure
- [x] Test script created
- [ ] Manual testing with real images
- [ ] Production deployment verification
- [ ] Monitor logs for first 24 hours

## Deployment Notes
1. Ensure `GOOGLE_CLOUD_VISION_API_KEY` is set in production environment
2. Monitor error logs for false positives
3. Check validation performance impact (adds ~1-2 seconds)
4. Verify billing for Google Vision API usage

## Support
If validation is blocking legitimate images:
1. Check confidence thresholds in config
2. Review Google Vision API responses in logs
3. Consider adjusting thresholds for specific user tiers
4. Add manual override option for customer support
