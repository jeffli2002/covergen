# Cover Generation Tool API Specification v1.0

## Table of Contents
1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [Rate Limiting](#rate-limiting)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Authentication APIs](#authentication-apis)
   - [User Management APIs](#user-management-apis)
   - [Template APIs](#template-apis)
   - [Cover Generation APIs](#cover-generation-apis)
   - [Edit APIs](#edit-apis)
   - [Download/Export APIs](#downloadexport-apis)
   - [Payment APIs](#payment-apis)
   - [Content Safety APIs](#content-safety-apis)
   - [Analytics APIs](#analytics-apis)
7. [WebSocket Events](#websocket-events)
8. [Webhook Events](#webhook-events)
9. [Implementation Notes](#implementation-notes)

## Overview

The Cover Generation Tool API provides programmatic access to AI-powered cover and poster generation services. This RESTful API supports authentication, user management, AI-powered image generation, editing, payment processing, and analytics.

### Key Features
- Multi-language support (English, Chinese, Spanish, French, German, Japanese, Korean)
- Multi-region deployment (US, EU, China)
- Real-time generation status updates via WebSocket
- Comprehensive content safety checks
- Flexible subscription tiers
- Multi-platform export sizes

### API Versioning Strategy
- Current version: v1
- Version included in URL path: `https://api.covergen.ai/v1/`
- Breaking changes will increment major version
- Non-breaking additions use same version
- Deprecation notice: 6 months minimum
- Multiple versions supported simultaneously

## Base Configuration

### API Endpoints by Region

```yaml
Production:
  Global: https://api.covergen.ai/v1
  China: https://api-cn.covergen.ai/v1
  Europe: https://api-eu.covergen.ai/v1

Staging:
  Global: https://api-staging.covergen.ai/v1
```

### Request Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {jwt_token}
X-Request-ID: {uuid} # Optional, for request tracking
X-Client-Version: 1.0.0 # Optional, client version
Accept-Language: en # Optional, response language
```

### Response Headers

```http
Content-Type: application/json
X-Request-ID: {uuid}
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1630454400
X-Response-Time: 123ms
```

## Authentication

### JWT Token Structure

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "subscription_tier": "pro",
  "iat": 1630454400,
  "exp": 1630540800,
  "iss": "https://auth.covergen.ai",
  "aud": "covergen.ai"
}
```

### Token Lifecycle
- Access Token: 24 hours
- Refresh Token: 30 days (rotating)
- Token refresh endpoint should be called before expiry

## Rate Limiting

### Default Limits by Tier

| Tier | Requests/Minute | Requests/Hour | Requests/Day |
|------|----------------|---------------|--------------|
| Free | 10 | 100 | 500 |
| Pro | 30 | 500 | 5,000 |
| Pro+ | 60 | 1,000 | 10,000 |

### Endpoint-Specific Limits

| Endpoint | Additional Limit |
|----------|-----------------|
| POST /generation/create | 3 concurrent tasks |
| POST /edit/sessions/*/apply | 5 concurrent edits |
| POST /auth/login | 5 attempts per 15 min |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1630454400
Retry-After: 120 # Only on 429 responses
```

## Error Handling

### Error Response Format

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "details": {
    "field": "title",
    "reason": "Title must be between 1 and 200 characters"
  },
  "timestamp": "2025-08-28T10:30:00Z",
  "request_id": "req_1234567890abcdef"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input parameters |
| AUTHENTICATION_ERROR | 401 | Invalid or missing authentication |
| AUTHORIZATION_ERROR | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| QUOTA_EXCEEDED | 402 | Usage quota exceeded |
| CONTENT_SAFETY_VIOLATION | 422 | Content violates safety policies |
| SERVICE_UNAVAILABLE | 503 | Temporary service issue |
| INTERNAL_ERROR | 500 | Server error |

## API Endpoints

### Authentication APIs

#### 1. User Registration
**POST** `/auth/register`

Create a new user account with email or social provider.

**Request Body (Email Registration):**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "display_name": "John Doe",
  "agree_terms": true,
  "marketing_consent": false,
  "referral_code": "FRIEND2025"
}
```

**Request Body (Social Registration):**
```json
{
  "provider": "google",
  "token": "ya29.a0AfH6SMBx...",
  "agree_terms": true,
  "marketing_consent": false
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "John Doe",
    "subscription_tier": "free",
    "created_at": "2025-08-28T10:30:00Z"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 86400
  }
}
```

**Validation Rules:**
- Email: Valid format, not already registered
- Password: Min 8 chars, uppercase, lowercase, number
- Display name: 2-50 characters
- Terms agreement: Must be true

#### 2. User Login
**POST** `/auth/login`

Authenticate user and obtain access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": true
}
```

**Response (200 OK):** Same as registration response

**Error Response (401):**
```json
{
  "code": "AUTHENTICATION_ERROR",
  "message": "Invalid email or password",
  "timestamp": "2025-08-28T10:30:00Z"
}
```

#### 3. Refresh Token
**POST** `/auth/refresh`

Exchange refresh token for new access token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Implementation Note:** Implement refresh token rotation for security.

### User Management APIs

#### 1. Get User Profile
**GET** `/users/me`

Retrieve current user's complete profile.

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "display_name": "John Doe",
  "avatar_url": "https://storage.covergen.ai/avatars/user-avatar.jpg",
  "language": "en",
  "timezone": "America/New_York",
  "created_at": "2025-01-15T10:30:00Z",
  "email_verified": true,
  "subscription_tier": "pro",
  "auth_providers": ["email", "google"]
}
```

#### 2. Get Subscription Status
**GET** `/users/me/subscription`

Get detailed subscription information.

**Response (200 OK):**
```json
{
  "tier": "pro",
  "status": "active",
  "started_at": "2025-01-01T00:00:00Z",
  "expires_at": "2025-02-01T00:00:00Z",
  "auto_renew": true,
  "payment_method": "stripe",
  "next_billing_date": "2025-02-01",
  "cancellation_date": null
}
```

#### 3. Get Quota Usage
**GET** `/users/me/quota`

Get current billing period quota usage.

**Response (200 OK):**
```json
{
  "period_start": "2025-08-01T00:00:00Z",
  "period_end": "2025-08-31T23:59:59Z",
  "usage": {
    "generations": {
      "used": 15,
      "limit": 50,
      "remaining": 35
    },
    "edits": {
      "used": 5,
      "limit": 100,
      "remaining": 95
    },
    "storage_mb": {
      "used": 245.5,
      "limit": 1024,
      "remaining": 778.5
    }
  },
  "overage_charges": 0
}
```

### Template APIs

#### 1. List Templates
**GET** `/templates`

Get available style templates with filtering and pagination.

**Query Parameters:**
- `category`: Filter by category (tech, lifestyle, minimal, etc.)
- `tag`: Filter by tag
- `popular`: Show only popular templates
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 50)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "tpl_123e4567-e89b-12d3-a456-426614174000",
      "name": "Tech Tutorial",
      "description": "Modern tech-focused design with neon accents",
      "category": "tech",
      "tags": ["modern", "neon", "gradient"],
      "preview_url": "https://storage.covergen.ai/templates/tech-tutorial-preview.jpg",
      "usage_count": 1250,
      "is_premium": false,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_items": 95,
    "has_next": true,
    "has_prev": false
  }
}
```

### Cover Generation APIs

#### 1. Upload Avatar
**POST** `/generation/upload-avatar`

Upload user avatar or logo for cover generation.

**Request (multipart/form-data):**
```
------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="avatar.jpg"
Content-Type: image/jpeg

[binary data]
------WebKitFormBoundary
Content-Disposition: form-data; name="purpose"

avatar
------WebKitFormBoundary--
```

**Response (201 Created):**
```json
{
  "upload_id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://storage.covergen.ai/avatars/550e8400.jpg",
  "thumbnail_url": "https://storage.covergen.ai/avatars/550e8400_thumb.jpg",
  "metadata": {
    "width": 1024,
    "height": 1024,
    "size": 204800,
    "format": "jpeg"
  }
}
```

**File Requirements:**
- Formats: JPG, PNG
- Max size: 10MB
- Recommended: Square aspect ratio
- Min resolution: 256x256

#### 2. Create Generation Task
**POST** `/generation/create`

Create a new cover generation task (asynchronous).

**Request Body:**
```json
{
  "title": "10 Amazing Python Tips You Need to Know!",
  "template_id": "tpl_123e4567-e89b-12d3-a456-426614174000",
  "avatar_upload_id": "550e8400-e29b-41d4-a716-446655440000",
  "custom_parameters": {
    "background_color": "#FF6B6B",
    "text_position": "bottom",
    "font_style": "bold"
  },
  "language": "en",
  "output_count": 3
}
```

**Response (202 Accepted):**
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "queued",
  "estimated_time": 10,
  "queue_position": 3
}
```

**WebSocket Updates:**
```json
{
  "event": "generation.progress",
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "progress": 50,
  "status": "processing"
}
```

#### 3. Get Task Status
**GET** `/generation/tasks/{task_id}`

Check generation task status and results.

**Response (200 OK - Completed):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "10 Amazing Python Tips You Need to Know!",
  "template_id": "tpl_123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "progress": 100,
  "results": [
    {
      "id": "res_001",
      "url": "https://storage.covergen.ai/generated/result1.jpg",
      "thumbnail_url": "https://storage.covergen.ai/generated/result1_thumb.jpg",
      "metadata": {
        "width": 1920,
        "height": 1080,
        "size": 2048000,
        "ai_watermark": true
      }
    }
  ],
  "created_at": "2025-08-28T10:30:00Z",
  "completed_at": "2025-08-28T10:30:10Z",
  "processing_time_ms": 8500
}
```

### Edit APIs

#### 1. Create Edit Session
**POST** `/edit/sessions`

Create an editing session for an existing image.

**Request Body:**
```json
{
  "image_url": "https://storage.covergen.ai/generated/123e4567.jpg",
  "source_task_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response (201 Created):**
```json
{
  "session_id": "987e6543-e21b-12d3-a456-426614174999",
  "expires_at": "2025-08-28T11:30:00Z",
  "edit_url": "https://api.covergen.ai/v1/edit/sessions/987e6543"
}
```

#### 2. Apply Mask-Based Edit
**POST** `/edit/sessions/{session_id}/apply`

Apply a localized edit using mask selection.

**Request Body:**
```json
{
  "mask": {
    "type": "rectangle",
    "coordinates": {
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 400
    }
  },
  "instruction": "Change the background to a coffee shop with warm lighting",
  "preserve_style": true,
  "strength": 0.7
}
```

**Mask Types:**
1. Rectangle: `{x, y, width, height}`
2. Circle: `{cx, cy, radius}`
3. Polygon: Array of `{x, y}` points
4. Freeform: Base64 encoded mask image

**Response (202 Accepted):**
```json
{
  "edit_id": "456e7890-e12b-34d5-a678-901234567890",
  "status": "processing",
  "estimated_time": 5
}
```

### Download/Export APIs

#### 1. Prepare Export
**POST** `/export/prepare`

Prepare image for download with platform-specific sizing.

**Request Body:**
```json
{
  "image_url": "https://storage.covergen.ai/generated/123e4567.jpg",
  "platform": "youtube",
  "format": "jpg",
  "quality": 85,
  "add_watermark": true
}
```

**Platform Dimensions:**
| Platform | Dimensions | Aspect Ratio |
|----------|------------|--------------|
| youtube | 1280x720 | 16:9 |
| bilibili | 1920x1080 | 16:9 |
| tiktok | 1080x1920 | 9:16 |
| instagram_post | 1080x1080 | 1:1 |
| instagram_story | 1080x1920 | 9:16 |
| twitter | 1200x675 | 16:9 |
| facebook | 1200x630 | 1.91:1 |

**Response (200 OK):**
```json
{
  "download_url": "https://download.covergen.ai/temp/abc123def456.jpg",
  "expires_at": "2025-08-28T11:30:00Z",
  "file_size": 1048576,
  "dimensions": {
    "width": 1280,
    "height": 720
  }
}
```

#### 2. Batch Export
**POST** `/export/batch`

Export multiple platform sizes in one request.

**Request Body:**
```json
{
  "image_url": "https://storage.covergen.ai/generated/123e4567.jpg",
  "platforms": ["youtube", "bilibili", "tiktok"],
  "format": "jpg",
  "quality": 85
}
```

**Response (200 OK):**
```json
{
  "exports": [
    {
      "platform": "youtube",
      "download_url": "https://download.covergen.ai/temp/youtube_abc123.jpg",
      "dimensions": {"width": 1280, "height": 720},
      "file_size": 512000
    },
    {
      "platform": "bilibili",
      "download_url": "https://download.covergen.ai/temp/bilibili_abc123.jpg",
      "dimensions": {"width": 1920, "height": 1080},
      "file_size": 1024000
    }
  ],
  "expires_at": "2025-08-28T11:30:00Z"
}
```

### Payment APIs

#### 1. Get Subscription Plans
**GET** `/payments/subscriptions?currency=USD`

List available subscription plans.

**Response (200 OK):**
```json
{
  "plans": [
    {
      "id": "pro_monthly",
      "name": "Pro Monthly",
      "description": "50 covers per month with HD export",
      "tier": "pro",
      "billing_period": "monthly",
      "price": {
        "amount": 9.00,
        "currency": "USD",
        "display": "$9.00"
      },
      "features": [
        {
          "name": "Cover generations per month",
          "value": "50",
          "highlighted": true
        }
      ],
      "limits": {
        "generations_per_month": 50,
        "edits_per_month": 100,
        "storage_mb": 1024,
        "export_quality": "hd",
        "commercial_use": false
      }
    }
  ],
  "current_plan": "free"
}
```

#### 2. Create Subscription
**POST** `/payments/subscribe`

Create or upgrade subscription.

**Request Body:**
```json
{
  "plan_id": "pro_monthly",
  "payment_method": "stripe",
  "coupon_code": "SAVE20",
  "return_url": "https://app.covergen.ai/payment/success"
}
```

**Response (200 OK):**
```json
{
  "payment_id": "pay_123e4567-e89b-12d3-a456-426614174000",
  "payment_url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4",
  "expires_at": "2025-08-28T11:00:00Z"
}
```

### Content Safety APIs

#### 1. Validate Text
**POST** `/safety/validate-text`

Check text content for policy violations.

**Request Body:**
```json
{
  "text": "Amazing tech tutorial thumbnail",
  "language": "en",
  "context": "title"
}
```

**Response (200 OK):**
```json
{
  "safe": true,
  "issues": [],
  "score": 0.95
}
```

**Response (200 OK - With Issues):**
```json
{
  "safe": false,
  "issues": [
    {
      "type": "profanity",
      "severity": "medium",
      "matched_text": "damn",
      "suggestion": "Consider using 'darn' or removing"
    }
  ],
  "score": 0.65
}
```

#### 2. Validate Image
**POST** `/safety/validate-image`

Check generated image for violations.

**Request Body:**
```json
{
  "image_url": "https://storage.covergen.ai/generated/123e4567.jpg",
  "check_faces": true,
  "check_text": true
}
```

**Response (200 OK):**
```json
{
  "safe": true,
  "violations": [],
  "detected_text": ["AMAZING", "TECH TIPS"],
  "face_analysis": {
    "faces_detected": 1,
    "synthetic_probability": 0.15
  }
}
```

### Analytics APIs

#### 1. Get Usage Analytics
**GET** `/analytics/usage?period=month`

Retrieve usage metrics.

**Response (200 OK):**
```json
{
  "period": {
    "start": "2025-08-01T00:00:00Z",
    "end": "2025-08-31T23:59:59Z"
  },
  "summary": {
    "total_generations": 125,
    "total_edits": 45,
    "total_downloads": 98,
    "average_generation_time": 8.5,
    "satisfaction_rate": 0.784
  },
  "daily_breakdown": [
    {
      "date": "2025-08-28",
      "generations": 5,
      "edits": 2,
      "downloads": 4
    }
  ],
  "template_usage": [
    {
      "template_id": "tpl_123e4567",
      "template_name": "Tech Tutorial",
      "usage_count": 15,
      "download_rate": 0.8
    }
  ],
  "platform_breakdown": [
    {
      "platform": "youtube",
      "export_count": 45,
      "percentage": 0.459
    }
  ]
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://ws.covergen.ai/v1/events');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }));
};
```

### Event Types

#### Generation Events
```json
{
  "event": "generation.started",
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2025-08-28T10:30:00Z"
}

{
  "event": "generation.progress",
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "progress": 75,
  "status": "processing",
  "message": "Generating variations..."
}

{
  "event": "generation.completed",
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "results": [...],
  "processing_time_ms": 8500
}

{
  "event": "generation.failed",
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "AI service temporarily unavailable"
  }
}
```

#### Edit Events
```json
{
  "event": "edit.completed",
  "session_id": "987e6543-e21b-12d3-a456-426614174999",
  "edit_id": "456e7890-e12b-34d5-a678-901234567890",
  "result_url": "https://storage.covergen.ai/edited/456e7890.jpg"
}
```

## Webhook Events

### Configuration
Configure webhooks in account settings or via API:

```json
POST /webhooks
{
  "url": "https://your-app.com/webhooks/covergen",
  "events": ["generation.completed", "subscription.updated"],
  "secret": "whsec_1234567890abcdef"
}
```

### Event Payload
```json
{
  "id": "evt_123456",
  "type": "generation.completed",
  "created": "2025-08-28T10:30:00Z",
  "data": {
    "task_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "results": [...]
  }
}
```

### Signature Verification
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Implementation Notes

### 1. Asynchronous Processing
- All generation and editing tasks are asynchronous
- Use task IDs to poll status or WebSocket for real-time updates
- Implement exponential backoff for polling
- Maximum task duration: 60 seconds

### 2. Idempotency
- Include `Idempotency-Key` header for POST requests
- Keys valid for 24 hours
- Prevents duplicate charges/generations

### 3. Pagination
- Default page size: 20
- Maximum page size: 100
- Use cursor-based pagination for large datasets

### 4. Caching Guidelines
- Cache template lists for 1 hour
- Cache user profile for 5 minutes
- Never cache generation results
- Use ETags for conditional requests

### 5. Security Considerations
- All endpoints require HTTPS
- Implement CORS properly
- Rate limit by IP and user
- Validate all file uploads
- Sanitize user-generated content

### 6. Multi-Region Considerations
- Use region-specific endpoints for lower latency
- Data residency compliance (GDPR, China regulations)
- Implement fallback strategies

### 7. AI Service Integration
- Primary: Google Vertex AI
- Fallback: Multiple providers by region
- Implement circuit breakers
- Monitor AI costs closely

### 8. Payment Integration
- PCI compliance not required (using Stripe/PayPal)
- Implement webhook retry logic
- Handle subscription lifecycle events
- Support multiple currencies

### 9. Content Safety
- Pre-generation text validation
- Post-generation image validation
- Human review queue for edge cases
- Maintain blocked content database

### 10. Performance Optimization
- Use CDN for static assets
- Implement request batching
- Database connection pooling
- Redis caching for hot data

---

## Appendix: Status Codes Summary

| Code | Meaning | Used For |
|------|---------|----------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST creating resource |
| 202 | Accepted | Async operation started |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid auth |
| 402 | Payment Required | Quota exceeded |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Content safety violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Server error |
| 503 | Service Unavailable | Temporary outage |