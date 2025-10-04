# Video Generation Validation Setup Guide

## Overview

This guide explains how to set up the video generation validation system that prevents API charges for images with faces, logos, or copyrighted content.

## Prerequisites

- Google Cloud account
- Google Cloud Vision API enabled
- Node.js project with npm

## Step 1: Install Dependencies

```bash
npm install @google-cloud/vision
```

## Step 2: Get Google Cloud Vision API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable **Cloud Vision API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

4. Create API Key:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

5. (Recommended) Restrict the API key:
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Select only "Cloud Vision API"
   - Save

## Step 3: Configure Environment Variables

Add to your `.env.local` file:

```env
# Required: Google Cloud Vision API Key
GOOGLE_CLOUD_VISION_API_KEY=AIzaSy...your_key_here

# Optional: Validation Configuration
VALIDATION_ENABLED=true
VALIDATION_MODE=strict
VALIDATION_LAYER_COPYRIGHT=true

# Optional: Detection Thresholds
VALIDATION_FACE_CONFIDENCE=0.7
VALIDATION_LOGO_CONFIDENCE=0.7
```

## Step 4: Test the Setup

### Test Face Detection

Upload an image with people/faces to the video generator. You should see:

```json
{
  "error": "Image contains people or faces",
  "details": "Detected 2 people in the image with 95% confidence",
  "suggestion": "Sora has strict restrictions on images with identifiable people. Please try:\n• Using landscape/nature photos without people\n• Abstract graphics or illustrations...",
  "code": "COPYRIGHT_FACE_DETECTED"
}
```

### Test Logo Detection

Upload an image with brand logos (Nike, Apple, etc.). You should see:

```json
{
  "error": "Image contains brand logos or trademarks",
  "details": "Detected 1 logo(s): Nike",
  "code": "COPYRIGHT_LOGO_DETECTED"
}
```

## Configuration Options

### Validation Modes

| Mode | Face Threshold | Logo Threshold | Description |
|------|----------------|----------------|-------------|
| `strict` | 0.7 | 0.7 | Detects most faces/logos (recommended for free tier) |
| `moderate` | 0.8 | 0.7 | Only high-confidence detections (Pro tier) |
| `permissive` | 0.8 | 0.8 | Least restrictive (Pro+ tier) |

### Per-Tier Configuration

The system automatically adjusts thresholds based on user's subscription tier:

- **Free tier**: Strict validation (prevent most failures)
- **Pro tier**: Moderate validation (balance quality/strictness)
- **Pro+ tier**: Permissive validation (trust user judgment)

## Disabling Validation

If you need to temporarily disable validation:

```env
VALIDATION_ENABLED=false
```

Or disable specific layers:

```env
VALIDATION_LAYER_COPYRIGHT=false
```

**Warning:** Disabling validation will result in more API failures and higher costs.

## Monitoring

### Check Validation Logs

Validation results are logged to console:

```
[GoogleVision] Detected 2 faces
[CopyrightValidator] BLOCKED: 2 face(s) detected
[Sora API] Copyright validation FAILED: COPYRIGHT_FACE_DETECTED
```

### Track Cost Savings

Monitor these metrics:
- Validation failures prevented
- API calls saved
- Estimated cost savings

Expected savings: **$1.86/user/month** (Pro+ tier)

## Troubleshooting

### Issue: "Google Vision not available"

**Cause:** API key not configured or invalid

**Solution:**
1. Check `.env.local` has `GOOGLE_CLOUD_VISION_API_KEY`
2. Verify API key is valid in Google Cloud Console
3. Ensure Cloud Vision API is enabled

### Issue: All images getting blocked

**Cause:** Thresholds too strict

**Solution:**
1. Increase confidence thresholds:
   ```env
   VALIDATION_FACE_CONFIDENCE=0.9
   VALIDATION_LOGO_CONFIDENCE=0.9
   ```
2. Or switch to permissive mode:
   ```env
   VALIDATION_MODE=permissive
   ```

### Issue: Validation too slow

**Cause:** Network latency to Google Cloud

**Solution:**
1. Check timeout setting (default 2000ms):
   ```env
   VALIDATION_TIMEOUT_MS=3000
   ```
2. Ensure images are hosted on fast CDN

## API Costs

### Google Cloud Vision Pricing

- **Free tier**: 1,000 images/month
- **Paid tier**: $1.50 per 1,000 images

### Cost Calculation

For 1000 Pro+ users (60 videos/month each):
- Image-to-video requests: 1000 × 60 × 50% = 30,000 validations
- Google Vision cost: 30,000 × $0.0015 = **$45/month**
- KIE API savings: 30,000 × 20% × $0.20 = **$1,200/month**
- **Net savings: $1,155/month**

## Best Practices

1. **Start with strict mode** for new deployments
2. **Monitor false positive rate** - adjust thresholds if needed
3. **Enable all validation layers** for maximum cost savings
4. **Set up alerts** for validation errors
5. **Review rejected images** periodically to fine-tune

## Support

If you encounter issues:

1. Check logs for detailed error messages
2. Test with known-good images (landscapes, abstract art)
3. Verify API key permissions in Google Cloud Console
4. Contact support with validation logs

## Next Steps

After setup:
1. ✅ Test with various image types
2. ✅ Monitor validation success rate
3. ✅ Adjust thresholds based on feedback
4. 📊 Implement Phase 2 (quality & safety validation)

---

**Setup Time:** 10-15 minutes  
**Difficulty:** Easy  
**Expected ROI:** 80x cost savings
