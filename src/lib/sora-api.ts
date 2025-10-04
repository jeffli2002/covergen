export interface SoraTextToVideoInput {
  prompt: string
  aspect_ratio?: 'portrait' | 'landscape'
  quality?: 'standard' | 'hd'
}

export interface SoraImageToVideoInput {
  prompt: string  // Required for image-to-video
  image_urls: string[]  // Changed from image_url to image_urls (array)
  aspect_ratio?: 'portrait' | 'landscape'
  quality?: 'standard' | 'hd'
}

export type SoraCreateTaskInput = SoraTextToVideoInput | SoraImageToVideoInput

export interface SoraCreateTaskRequest {
  model: 'sora-2-text-to-video' | 'sora-2-image-to-video'
  input: SoraCreateTaskInput
  callBackUrl?: string
}

export interface SoraCreateTaskResponse {
  code: number
  msg: string
  data: {
    taskId: string
  }
}

export interface SoraTaskInfo {
  taskId: string
  model: string
  state: 'waiting' | 'success' | 'fail'
  param: string
  resultJson: string | null
  failCode: string | null
  failMsg: string | null
  costTime: number | null
  completeTime: number | null
  createTime: number
}

export interface SoraQueryTaskResponse {
  code: number
  msg: string
  data: SoraTaskInfo
}

export interface SoraResult {
  resultUrls: string[]
}

const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs'

export class SoraApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SoraApiError'
  }
}

export async function createSoraTask(
  input: SoraCreateTaskInput,
  mode: 'text-to-video' | 'image-to-video' = 'text-to-video',
  callBackUrl?: string
): Promise<string> {
  const apiKey = process.env.KIE_API_KEY
  
  if (!apiKey) {
    throw new SoraApiError(500, 'KIE_API_KEY is not configured')
  }

  const model = mode === 'text-to-video' ? 'sora-2-text-to-video' : 'sora-2-image-to-video'
  
  const request: SoraCreateTaskRequest = {
    model,
    input,
    ...(callBackUrl && { callBackUrl })
  }

  console.log('[Sora API] Creating task:', {
    model,
    inputKeys: Object.keys(input),
    hasImageUrls: 'image_urls' in input,
    imageUrlsLength: 'image_urls' in input ? (input as any).image_urls?.length : 0,
    firstImageUrl: 'image_urls' in input ? (input as any).image_urls?.[0] : null,
    fullRequest: JSON.stringify(request, null, 2)
  })

  const response = await fetch(`${API_BASE_URL}/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(request)
  })

  console.log('[Sora API] HTTP response status:', response.status)
  
  const responseText = await response.text()
  console.log('[Sora API] Raw response:', responseText)
  
  let data: SoraCreateTaskResponse
  try {
    data = JSON.parse(responseText)
  } catch (e) {
    console.error('[Sora API] Failed to parse response as JSON:', responseText)
    throw new SoraApiError(500, 'Invalid API response format', { responseText })
  }
  
  console.log('[Sora API] API response:', {
    code: data.code,
    msg: data.msg,
    hasData: !!data.data,
    fullResponse: data
  })

  if (data.code !== 200) {
    console.error('[Sora API] API error response:', data)
    
    // Provide more helpful error messages for common issues
    let errorMessage = data.msg || 'Failed to create task'
    
    // Generic policy error often means image URL is not accessible
    if (errorMessage.includes('policy') || errorMessage.includes('违反') || data.code === 500) {
      errorMessage = `API Error (${data.code}): ${errorMessage}\n\n` +
        'Common causes:\n' +
        '1. Image URL is not publicly accessible or timed out\n' +
        '2. Image format/size does not meet requirements\n' +
        '3. Network connectivity issues\n\n' +
        'Please try uploading a different image or check that your image URL is publicly accessible.'
    }
    
    throw new SoraApiError(
      data.code,
      errorMessage,
      data
    )
  }

  return data.data.taskId
}

export async function querySoraTask(taskId: string): Promise<SoraTaskInfo> {
  const apiKey = process.env.KIE_API_KEY
  
  if (!apiKey) {
    throw new SoraApiError(500, 'KIE_API_KEY is not configured')
  }

  const response = await fetch(
    `${API_BASE_URL}/recordInfo?taskId=${taskId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    }
  )

  const data: SoraQueryTaskResponse = await response.json()

  if (data.code !== 200) {
    throw new SoraApiError(
      data.code,
      data.msg || 'Failed to query task',
      data
    )
  }

  return data.data
}

export function parseSoraResult(resultJson: string): SoraResult {
  try {
    return JSON.parse(resultJson) as SoraResult
  } catch (error) {
    throw new SoraApiError(500, 'Failed to parse result JSON', { resultJson })
  }
}

export async function pollSoraTask(
  taskId: string,
  maxAttempts: number = 60,
  intervalMs: number = 5000
): Promise<SoraTaskInfo> {
  for (let i = 0; i < maxAttempts; i++) {
    const taskInfo = await querySoraTask(taskId)
    
    if (taskInfo.state === 'success' || taskInfo.state === 'fail') {
      return taskInfo
    }
    
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
  
  throw new SoraApiError(408, 'Task polling timeout')
}
