# Sora API Flow Explanation

## Overview

The Sora video generation uses **two separate endpoints** because video generation is **asynchronous** - it takes time to generate videos, so the workflow is:

1. **Create** - Submit the generation request → Get task ID
2. **Query** - Poll for completion → Get video URLs when ready

---

## 1️⃣ `/api/sora/create` - Video Generation Request

### Purpose
**Initiates** a video generation task and returns a task ID immediately.

### When It's Used

**User Action**: User submits a video generation request from the frontend

**Two Modes**:

#### Mode A: Text-to-Video
```javascript
POST /api/sora/create
{
  "mode": "text-to-video",
  "prompt": "A cat playing piano in a jazz club",
  "aspect_ratio": "landscape",
  "quality": "standard"  // or "pro"
}
```

#### Mode B: Image-to-Video
```javascript
POST /api/sora/create
{
  "mode": "image-to-video",
  "prompt": "Make this image move naturally",
  "image_url": "https://cloudinary.com/...",
  "aspect_ratio": "landscape",
  "quality": "standard"  // or "pro"
}
```

### What It Does

1. **Validates user authentication** (BestAuth)
2. **Checks video generation limits**:
   - Free: 1/day, 5/month
   - Pro Trial: 4/day, 12 total
   - Pro: 30/month (no daily limit)
   - Pro+: 100/month (no daily limit)
3. **Checks credit balance** (BEFORE generation):
   - Standard quality: 20 credits needed
   - Pro quality: 80 credits needed
   - Returns error if insufficient credits
4. **Validates input**:
   - For text-to-video: Validates prompt
   - For image-to-video: 
     - Validates image URL is accessible (3 retry attempts)
     - Runs copyright validation (checks for faces, logos, watermarks)
5. **Calls Sora API** `createTask()` → Submits to external Sora service
6. **Returns task ID** immediately (video generation starts in background)

### Response
```json
{
  "taskId": "sora_task_abc123",
  "userId": "user_id_xyz",
  "generationType": "sora2Video"  // or "sora2ProVideo"
}
```

### Important Notes
- ✅ Checks credit balance **BEFORE** generation
- ❌ Does **NOT** deduct credits yet (only deducts on success)
- ⏱️ Returns immediately (doesn't wait for video)
- 🎬 Video generation happens asynchronously via external Sora API

---

## 2️⃣ `/api/sora/query` - Check Video Generation Status

### Purpose
**Polls** the status of a video generation task and **deducts credits** when successful.

### When It's Used

**Frontend Polling**: After receiving a task ID, the frontend polls this endpoint every few seconds:

```javascript
// Frontend polling loop
const pollInterval = setInterval(async () => {
  const response = await fetch(`/api/sora/query?taskId=${taskId}&quality=${quality}`)
  const data = await response.json()
  
  if (data.state === 'success') {
    // Video is ready!
    clearInterval(pollInterval)
    showVideo(data.resultUrls)
  } else if (data.state === 'fail') {
    clearInterval(pollInterval)
    showError(data.failMsg)
  }
  // else state === 'waiting', keep polling
}, 3000) // Poll every 3 seconds
```

### What It Does

1. **Calls Sora API** `querySoraTask(taskId)` to check status
2. **If status is 'success'** (first time seeing this task succeed):
   - **Deducts credits** from user's balance:
     - Standard: -20 credits
     - Pro: -80 credits
   - **Creates transaction record** with metadata
   - **Increments video usage counter**
   - **Marks task as counted** (prevents double-charging)
3. **Returns task info** to frontend:
   - `state`: 'waiting' | 'success' | 'fail'
   - `resultUrls`: Array of video URLs (when success)
   - `failMsg`: Error message (when fail)

### Response Examples

#### Still Processing
```json
{
  "taskId": "sora_task_abc123",
  "state": "waiting",
  "model": "sora-2-text-to-video",
  "resultJson": null,
  "costTime": null
}
```

#### Success (First Poll)
```json
{
  "taskId": "sora_task_abc123",
  "state": "success",
  "model": "sora-2-text-to-video",
  "resultJson": "{\"resultUrls\":[\"https://video.url/video.mp4\"]}",
  "costTime": 45000,
  "completeTime": 1729543200000
}
```
**Backend Action**: ✅ Deducts 20 credits, creates transaction

#### Success (Subsequent Polls)
Same response as above, but:
**Backend Action**: ℹ️ No deduction (already counted via `video_tasks` table)

#### Failed
```json
{
  "taskId": "sora_task_abc123",
  "state": "fail",
  "failCode": "CONTENT_POLICY_VIOLATION",
  "failMsg": "Input contains prohibited content"
}
```
**Backend Action**: ❌ No credit deduction (generation failed)

### Important Notes
- ✅ Only deducts credits when `state === 'success'`
- ✅ Only deducts **once per task** (tracked in `video_tasks` table)
- ❌ No credit deduction if generation fails
- 🔁 Safe to call multiple times (idempotent)

---

## Complete User Flow Diagram

```
USER                FRONTEND              /api/sora/create           Sora API           /api/sora/query
  |                    |                         |                      |                       |
  | Click "Generate"   |                         |                      |                       |
  |------------------->|                         |                      |                       |
  |                    | POST /api/sora/create   |                      |                       |
  |                    |------------------------>|                      |                       |
  |                    |                         | Check limits         |                       |
  |                    |                         | Check credits (20)   |                       |
  |                    |                         | Validate input       |                       |
  |                    |                         |                      |                       |
  |                    |                         | createTask()         |                       |
  |                    |                         |--------------------->|                       |
  |                    |                         |                      | Start generating...  |
  |                    |                         | taskId: "abc123"     |                       |
  |                    |                         |<---------------------|                       |
  |                    | { taskId: "abc123" }    |                      |                       |
  |                    |<------------------------|                      |                       |
  | "Generating..."    |                         |                      |                       |
  |<-------------------|                         |                      |                       |
  |                    |                         |                      |     [10-60 sec]      |
  |                    | [Poll every 3s]         |                      |                       |
  |                    | GET /query?taskId=abc123|                      |                       |
  |                    |---------------------------------------------------------------->|
  |                    |                         |                      |                       | querySoraTask()
  |                    |                         |                      |                       | state: 'waiting'
  |                    | { state: 'waiting' }    |                      |                       |
  |                    |<----------------------------------------------------------------|
  |                    |                         |                      |                       |
  |                    | [Poll again after 3s]   |                      |                       |
  |                    | GET /query?taskId=abc123|                      |                       |
  |                    |---------------------------------------------------------------->|
  |                    |                         |                      |                       | querySoraTask()
  |                    |                         |                      |                       | state: 'success' ✅
  |                    |                         |                      |                       | Deduct 20 credits!
  |                    |                         |                      |                       | Create transaction
  |                    | { state: 'success',     |                      |                       |
  |                    |   resultUrls: [...] }   |                      |                       |
  |                    |<----------------------------------------------------------------|
  | Video ready! 🎬    |                         |                      |                       |
  |<-------------------|                         |                      |                       |
```

---

## Why Two Endpoints?

### ❓ Why not deduct credits immediately in `/create`?

**Answer**: Because video generation can **fail** after submission!

Possible failure scenarios:
1. **Content policy violation** - Sora rejects the prompt/image
2. **Service timeout** - Sora API goes down mid-generation
3. **Technical errors** - Network issues, API limits, etc.

If we deducted credits immediately, users would lose credits for failed generations. This is a **terrible user experience**.

### ✅ Why deduct in `/query` on success?

**Answer**: **Pay only for successful results**

- User only loses credits when they get a usable video
- Failed generations don't cost anything
- Much better UX and fairer billing

### 🔄 Why poll instead of webhooks?

**Answer**: **Simplicity and reliability**

While Sora API supports webhooks via `callBackUrl`, polling is:
- ✅ Simpler to implement (no webhook endpoint needed)
- ✅ More reliable (no missed callbacks)
- ✅ Easier to debug (synchronous flow)
- ✅ Works in all environments (no public URL needed)

---

## Credit Deduction Logic

### Create Endpoint (Pre-Check Only)
```typescript
// Check if user has enough credits
const pointsCheck = await checkPointsForGeneration(user.id, generationType, supabaseAdmin)

if (pointsCheck.usesPoints && !pointsCheck.canProceed) {
  return NextResponse.json({
    error: 'Insufficient credits',
    currentBalance: pointsCheck.details?.currentBalance,
    requiredPoints: pointsCheck.details?.requiredPoints
  }, { status: 402 })
}

// Submit task (NO DEDUCTION YET)
const taskId = await createSoraTask(input, mode)
return NextResponse.json({ taskId })
```

### Query Endpoint (Deduct on Success)
```typescript
const taskInfo = await querySoraTask(taskId)

// Only deduct when successful
if (taskInfo.state === 'success') {
  const existingUsage = await db.videoTasks.findByTaskId(taskId)
  
  // Only deduct once (idempotency check)
  if (!existingUsage) {
    // DEDUCT CREDITS
    await deductPointsForGeneration(user.id, generationType, supabaseAdmin, {
      taskId,
      quality,
      mode: taskInfo.model
    })
    
    // Mark as counted
    await db.videoTasks.create({ taskId, userId: user.id, status: 'success' })
  }
}

return NextResponse.json(taskInfo)
```

---

## Idempotency Protection

### Problem
User might poll `/query` multiple times after video succeeds. We must not charge them multiple times!

### Solution: `video_tasks` Table

```sql
CREATE TABLE video_tasks (
  task_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Logic**:
1. First poll after success: No record in `video_tasks` → **Deduct credits**
2. Second+ poll: Record exists in `video_tasks` → **Skip deduction**

This ensures **exactly-once** credit deduction per video.

---

## Summary Table

| Endpoint | When Called | Credit Check | Credit Deduction | Returns |
|----------|-------------|--------------|------------------|---------|
| `/api/sora/create` | User clicks "Generate" | ✅ Yes (pre-check) | ❌ No | `taskId` immediately |
| `/api/sora/query` | Frontend polls every 3s | ❌ No | ✅ Yes (on first success) | Task status + video URLs |

---

## Real-World Timeline

```
T+0s:  User clicks "Generate Video"
T+0s:  POST /api/sora/create (returns taskId in 500ms)
T+0s:  User sees "Generating..." spinner
T+3s:  GET /api/sora/query → state: 'waiting'
T+6s:  GET /api/sora/query → state: 'waiting'
T+9s:  GET /api/sora/query → state: 'waiting'
...
T+45s: GET /api/sora/query → state: 'success' ✅
       Backend deducts 20 credits
       Frontend shows video player
T+48s: GET /api/sora/query → state: 'success' (no deduction, already counted)
```

**Average generation time**: 30-60 seconds  
**Polling frequency**: Every 3 seconds  
**Total polls**: 10-20 requests per video

---

## Error Scenarios

### Scenario 1: Insufficient Credits

**Create endpoint returns**:
```json
{
  "error": "Insufficient credits. You need 20 credits but only have 5 credits.",
  "insufficientPoints": true,
  "currentBalance": 5,
  "requiredPoints": 20,
  "shortfall": 15
}
```
**Result**: ❌ Video generation never starts, no credits deducted

### Scenario 2: Content Policy Violation

**Create endpoint**: ✅ Succeeds, returns taskId  
**Query endpoint (after 10s)**: 
```json
{
  "state": "fail",
  "failCode": "CONTENT_POLICY_VIOLATION",
  "failMsg": "The input contains prohibited content"
}
```
**Result**: ❌ No credits deducted (generation failed)

### Scenario 3: Copyright Validation Failure

**Create endpoint**: Detects faces in uploaded image
```json
{
  "error": "Image contains people or faces",
  "details": "Detected 2 people with 87% confidence",
  "code": "COPYRIGHT_FACE_DETECTED",
  "validationFailed": true
}
```
**Result**: ❌ Video generation never starts, no credits deducted, no external API call made

---

## Key Takeaways

1. **Two-step process**: Create (submit) → Query (poll until ready)
2. **Async by design**: Video generation takes 30-60 seconds
3. **Pay for success**: Credits only deducted when video successfully generates
4. **Idempotent**: Safe to poll multiple times, only charged once
5. **Fair billing**: Failed generations = no charge
6. **Pre-validation**: Checks limits, credits, and content before submitting

This architecture ensures users only pay for what they successfully receive! 🎯
