export interface SoraTextToVideoInput {
  prompt: string
  aspect_ratio?: 'portrait' | 'landscape'
  quality?: 'standard' | 'hd'
}

export interface SoraImageToVideoInput {
  prompt?: string
  image_url: string
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

  const response = await fetch(`${API_BASE_URL}/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(request)
  })

  const data: SoraCreateTaskResponse = await response.json()

  if (data.code !== 200) {
    throw new SoraApiError(
      data.code,
      data.msg || 'Failed to create task',
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
