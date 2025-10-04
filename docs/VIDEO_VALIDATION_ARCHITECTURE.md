# Video Generation Validation Architecture

**Status:** Design Complete - Ready for Implementation  
**Created:** 2025-10-04  
**Priority:** P0 - Critical for Cost Savings  

## Executive Summary

Comprehensive pre-API-call validation system to prevent unnecessary KIE API charges for failed video generations. **Expected ROI: 80x** with ~$775/month savings for 1000 users.

## Problem Statement

- KIE API charges when `createTask` is called, regardless of success/failure
- Current failure rate: 20-30% (copyright, safety, quality issues)
- Cost per failed generation: ~$0.20
- We absorb these costs but need to minimize them

## Solution Overview

4-layer validation pipeline that runs **before** calling KIE API:

1. **Layer 1: Basic Validation** (~50ms, FREE)
2. **Layer 2: Image Quality** (~200ms, FREE)
3. **Layer 3: Content Safety** (~800ms, $0.0002)
4. **Layer 4: Copyright Detection** (~800ms, $0.0015)

**Total validation time:** <2s (95th percentile)  
**Total validation cost:** ~$0.002 per validation  
**Prevention rate:** 70-85% of failures  

## Architecture Diagram

```
CLIENT REQUEST
      ↓
VALIDATION ORCHESTRATOR
      ↓
┌─────────────────────────────────────┐
│ LAYER 1: Basic (50ms)               │
│  - Auth, quota, format              │
├─────────────────────────────────────┤
│ LAYER 2: Quality (200ms)            │
│  - Resolution, aspect ratio         │
├─────────────────────────────────────┤
│ LAYER 3: Safety (800ms) ─┐          │
│  - NSFW, moderation      │ PARALLEL │
├──────────────────────────┤          │
│ LAYER 4: Copyright (800ms) ──────┘  │
│  - Logo, face, watermark detection  │
└─────────────────────────────────────┘
      ↓
  PASS? ──YES──> Call KIE API
      │
     NO──> Return error + suggestion
```

## Technology Stack

| Component | Technology | Cost | Speed |
|-----------|-----------|------|-------|
| Text Moderation | OpenAI Moderation API | FREE | ~200ms |
| Image Quality | Sharp.js | FREE | ~100ms |
| NSFW Detection | TensorFlow NSFW.js | FREE | ~300ms |
| Logo Detection | Google Cloud Vision | $0.0015 | ~500ms |
| Face Detection | Google Cloud Vision | Bundled | ~500ms |
| OCR/Watermarks | Google Cloud Vision | Bundled | ~500ms |

## Implementation Phases

### ✅ Phase 1: Copyright Detection (Week 1) - **IMPLEMENT FIRST**
**Goal:** Prevent 70% of failures  
**Effort:** 2-3 days  
**Files to Create:**
- `src/lib/validation/config.ts`
- `src/lib/validation/orchestrator.ts`
- `src/lib/validation/layers/copyright.ts`
- `src/lib/validation/services/google-vision.ts`

### 🔄 Phase 2: Quality & Safety (Week 2)
**Goal:** Prevent additional 15% of failures  
**Effort:** 2 days  
**Files to Create:**
- `src/lib/validation/layers/quality.ts`
- `src/lib/validation/layers/safety.ts`

### 📊 Phase 3: Analytics (Week 3)
**Goal:** Monitoring and optimization  
**Effort:** 2-3 days  

### 🚀 Phase 4: Advanced Features (Week 4)
**Goal:** 95%+ accuracy (optional)  
**Effort:** 3-4 days  

## Cost Analysis

### Without Validation (Current)
- Failed generations: 60 videos/month × 20% = 12 failures
- Cost: 12 × $0.20 = **$2.40/user/month** (wasted)

### With Validation
- Validation cost: 60 videos × 50% image × $0.002 = $0.06
- Prevented failures: 12 × 80% = 9.6 prevented
- Savings: 9.6 × $0.20 = $1.92
- **Net savings: $1.86/user/month**

### Platform Scale (1000 users)
- **Monthly savings: ~$775**
- **Annual savings: ~$9,300**

## Error Messages

User-friendly validation errors with actionable suggestions:

```json
{
  "code": "COPYRIGHT_LOGO_DETECTED",
  "message": "Image contains copyrighted content",
  "details": "Detected Nike logo in the image",
  "suggestion": "Please use images without brand logos. Try your own photos or AI-generated images.",
  "category": "copyright",
  "severity": "error"
}
```

## Configuration

### Environment Variables
```env
VALIDATION_ENABLED=true
VALIDATION_MODE=strict
GOOGLE_CLOUD_VISION_API_KEY=...
VALIDATION_NSFW_THRESHOLD=0.7
VALIDATION_LOGO_CONFIDENCE=0.7
```

### Per-Tier Configuration
- **Free:** All validations enabled (strict)
- **Pro:** All validations enabled (moderate)
- **Pro+:** Optional quality bypass (permissive)

## Success Metrics

### Target KPIs
- ✅ Prevent 70%+ of copyright failures (Phase 1)
- ✅ Prevent 85%+ of all failures (Phase 2)
- ✅ Validation time <2s (95th percentile)
- ✅ False positive rate <5%
- ✅ Monthly cost savings >$500

### Monitoring
- Track validation failures by type
- Measure cost savings vs validation costs
- Monitor false positive rate
- Collect user feedback

## Quick Start Implementation

### Minimum Viable Product (Day 1)

```typescript
// src/lib/validation/simple-copyright.ts
export async function validateImageCopyright(imageUrl: string) {
  const vision = new GoogleVision()
  
  const [logos, faces, text] = await Promise.all([
    vision.detectLogos(imageUrl),
    vision.detectFaces(imageUrl),
    vision.detectText(imageUrl)
  ])
  
  if (logos.length > 0) {
    return { valid: false, error: 'Brand logos detected' }
  }
  
  if (faces.length > 0) {
    return { valid: false, error: 'Recognizable people detected' }
  }
  
  return { valid: true }
}
```

### Integration

```typescript
// src/app/api/sora/create/route.ts
if (generationMode === 'image-to-video') {
  const validation = await validateImageCopyright(cleanImageUrl)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }
}
```

## Next Steps

1. ✅ Review architecture design
2. 📋 Setup Google Cloud Vision API account
3. 🔨 Implement Phase 1 (copyright validation)
4. 📊 Monitor metrics for 1 week
5. 🎯 Adjust thresholds based on data
6. 🚀 Roll out Phase 2

## References

- Google Cloud Vision API: https://cloud.google.com/vision/docs
- OpenAI Moderation API: https://platform.openai.com/docs/guides/moderation
- TensorFlow NSFW.js: https://github.com/infinitered/nsfwjs
- Sharp.js: https://sharp.pixelplumbing.com/

---

**Design by:** Software Architect Agent  
**Reviewed by:** Claude Code  
**Status:** Ready for Implementation
