// Google Cloud Vision API integration for image validation

import { ImageAnnotatorClient } from '@google-cloud/vision'
import type { FaceDetectionResult, LogoDetectionResult, TextDetectionResult } from '../types'

export class GoogleVisionService {
  private client: ImageAnnotatorClient | null = null
  
  constructor() {
    // Only initialize if API key is available
    if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
      try {
        this.client = new ImageAnnotatorClient({
          apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
        })
        console.log('[GoogleVision] Client initialized successfully')
      } catch (error) {
        console.error('[GoogleVision] Failed to initialize client:', error)
      }
    } else {
      console.warn('[GoogleVision] API key not configured, validation will be skipped')
    }
  }
  
  isAvailable(): boolean {
    return this.client !== null
  }
  
  /**
   * Detect faces in an image
   * Returns face count and confidence scores
   */
  async detectFaces(imageUrl: string, confidenceThreshold: number = 0.7): Promise<FaceDetectionResult> {
    if (!this.client) {
      console.warn('[GoogleVision] Client not available, skipping face detection')
      return { detected: false, faceCount: 0, confidence: 0 }
    }
    
    try {
      console.log('[GoogleVision] Detecting faces in image:', imageUrl.substring(0, 100))
      
      const [result] = await this.client.faceDetection(imageUrl)
      const faces = result.faceAnnotations || []
      
      console.log(`[GoogleVision] Detected ${faces.length} faces`)
      
      // Check if any face meets confidence threshold
      const highConfidenceFaces = faces.filter(
        face => (face.detectionConfidence || 0) >= confidenceThreshold
      )
      
      const maxConfidence = faces.reduce(
        (max, face) => Math.max(max, face.detectionConfidence || 0),
        0
      )
      
      return {
        detected: highConfidenceFaces.length > 0,
        faceCount: highConfidenceFaces.length,
        confidence: maxConfidence,
        landmarks: faces.map(face => face.landmarks || []),
      }
    } catch (error) {
      console.error('[GoogleVision] Face detection error:', error)
      // On error, fail safe by assuming no faces (don't block)
      return { detected: false, faceCount: 0, confidence: 0 }
    }
  }
  
  /**
   * Detect logos and brands in an image
   * Returns detected logos with confidence scores
   */
  async detectLogos(imageUrl: string, confidenceThreshold: number = 0.7): Promise<LogoDetectionResult> {
    if (!this.client) {
      console.warn('[GoogleVision] Client not available, skipping logo detection')
      return { detected: false, logos: [] }
    }
    
    try {
      console.log('[GoogleVision] Detecting logos in image:', imageUrl.substring(0, 100))
      
      const [result] = await this.client.logoDetection(imageUrl)
      const logos = result.logoAnnotations || []
      
      console.log(`[GoogleVision] Detected ${logos.length} logos`)
      
      const highConfidenceLogos = logos
        .filter(logo => (logo.score || 0) >= confidenceThreshold)
        .map(logo => ({
          description: logo.description || 'Unknown',
          confidence: logo.score || 0,
          boundingBox: logo.boundingPoly,
        }))
      
      return {
        detected: highConfidenceLogos.length > 0,
        logos: highConfidenceLogos,
      }
    } catch (error) {
      console.error('[GoogleVision] Logo detection error:', error)
      return { detected: false, logos: [] }
    }
  }
  
  /**
   * Detect text in an image (watermarks, copyright notices)
   * Returns detected text and checks for copyright indicators
   */
  async detectText(imageUrl: string): Promise<TextDetectionResult> {
    if (!this.client) {
      console.warn('[GoogleVision] Client not available, skipping text detection')
      return { detected: false, text: [], hasCopyright: false, hasWatermark: false }
    }
    
    try {
      console.log('[GoogleVision] Detecting text in image:', imageUrl.substring(0, 100))
      
      const [result] = await this.client.textDetection(imageUrl)
      const detections = result.textAnnotations || []
      
      // First annotation is the full text, rest are individual words
      const fullText = detections[0]?.description || ''
      const words = detections.slice(1).map(d => d.description || '')
      
      console.log(`[GoogleVision] Detected text: ${fullText.substring(0, 100)}`)
      
      // Check for copyright indicators
      const copyrightIndicators = ['©', '®', '™', 'copyright', 'all rights reserved']
      const watermarkIndicators = ['watermark', 'shutterstock', 'getty', 'istock', 'stock photo']
      
      const lowerText = fullText.toLowerCase()
      const hasCopyright = copyrightIndicators.some(indicator => 
        lowerText.includes(indicator.toLowerCase())
      )
      const hasWatermark = watermarkIndicators.some(indicator => 
        lowerText.includes(indicator.toLowerCase())
      )
      
      return {
        detected: words.length > 0,
        text: words,
        hasCopyright,
        hasWatermark,
      }
    } catch (error) {
      console.error('[GoogleVision] Text detection error:', error)
      return { detected: false, text: [], hasCopyright: false, hasWatermark: false }
    }
  }
  
  /**
   * Run all copyright validations in parallel
   * Optimized for speed by running all checks at once
   */
  async validateCopyright(
    imageUrl: string,
    config: { faceThreshold: number; logoThreshold: number }
  ): Promise<{
    faces: FaceDetectionResult
    logos: LogoDetectionResult
    text: TextDetectionResult
  }> {
    if (!this.client) {
      console.warn('[GoogleVision] Client not available, skipping all validations')
      return {
        faces: { detected: false, faceCount: 0, confidence: 0 },
        logos: { detected: false, logos: [] },
        text: { detected: false, text: [], hasCopyright: false, hasWatermark: false },
      }
    }
    
    console.log('[GoogleVision] Running parallel copyright validation')
    
    // Run all validations in parallel for speed
    const [faces, logos, text] = await Promise.all([
      this.detectFaces(imageUrl, config.faceThreshold),
      this.detectLogos(imageUrl, config.logoThreshold),
      this.detectText(imageUrl),
    ])
    
    console.log('[GoogleVision] Validation results:', {
      facesDetected: faces.detected,
      logosDetected: logos.detected,
      copyrightText: text.hasCopyright || text.hasWatermark,
    })
    
    return { faces, logos, text }
  }
}

// Singleton instance
let visionServiceInstance: GoogleVisionService | null = null

export function getGoogleVisionService(): GoogleVisionService {
  if (!visionServiceInstance) {
    visionServiceInstance = new GoogleVisionService()
  }
  return visionServiceInstance
}
