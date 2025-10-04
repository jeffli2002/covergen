// Validation types and interfaces

export interface ValidationResult {
  valid: boolean
  error?: string
  details?: string
  suggestion?: string
  code?: string
  category?: 'quality' | 'safety' | 'copyright' | 'basic'
  severity?: 'error' | 'warning'
  canRetry?: boolean
}

export interface ImageValidationInput {
  imageUrl: string
  mode: 'text-to-video' | 'image-to-video'
  prompt?: string
}

export interface ValidationConfig {
  enabled: boolean
  mode: 'strict' | 'moderate' | 'permissive'
  layers: {
    basic: boolean
    quality: boolean
    safety: boolean
    copyright: boolean
  }
  timeoutMs: number
  thresholds: {
    faceConfidence: number
    logoConfidence: number
    nsfwConfidence: number
  }
}

export interface FaceDetectionResult {
  detected: boolean
  faceCount: number
  confidence: number
  landmarks?: any[]
}

export interface LogoDetectionResult {
  detected: boolean
  logos: Array<{
    description: string
    confidence: number
    boundingBox?: any
  }>
}

export interface TextDetectionResult {
  detected: boolean
  text: string[]
  hasCopyright: boolean
  hasWatermark: boolean
}

export interface CopyrightValidationResult extends ValidationResult {
  faces?: FaceDetectionResult
  logos?: LogoDetectionResult
  text?: TextDetectionResult
}
