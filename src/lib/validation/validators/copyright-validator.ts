// Copyright validation - faces, logos, watermarks

import { getGoogleVisionService } from '../services/google-vision'
import type { CopyrightValidationResult, ValidationConfig } from '../types'

export async function validateCopyright(
  imageUrl: string,
  config: ValidationConfig
): Promise<CopyrightValidationResult> {
  console.log('[CopyrightValidator] Starting validation for:', imageUrl.substring(0, 100))
  
  const visionService = getGoogleVisionService()
  
  // Skip validation if service not available (no API key)
  if (!visionService.isAvailable()) {
    console.warn('[CopyrightValidator] Google Vision not available, skipping validation')
    return {
      valid: true, // Allow if service unavailable (graceful degradation)
      code: 'COPYRIGHT_VALIDATION_SKIPPED',
      details: 'Copyright validation service unavailable',
    }
  }
  
  try {
    // Run all copyright checks in parallel
    const { faces, logos, text } = await visionService.validateCopyright(imageUrl, {
      faceThreshold: config.thresholds.faceConfidence,
      logoThreshold: config.thresholds.logoConfidence,
    })
    
    // CRITICAL: Block if faces detected (Sora/OpenAI restriction)
    if (faces.detected && faces.faceCount > 0) {
      console.warn(`[CopyrightValidator] BLOCKED: ${faces.faceCount} face(s) detected`)
      return {
        valid: false,
        error: 'Image contains people or faces',
        details: `Detected ${faces.faceCount} ${faces.faceCount === 1 ? 'person' : 'people'} in the image with ${Math.round(faces.confidence * 100)}% confidence`,
        suggestion: `Sora has strict restrictions on images with identifiable people. Please try:
• Using landscape/nature photos without people
• Abstract graphics or illustrations
• AI-generated images without faces
• Your own selfies (may still be blocked)
• Simple objects or patterns`,
        code: 'COPYRIGHT_FACE_DETECTED',
        category: 'copyright',
        severity: 'error',
        canRetry: false,
        faces,
        logos,
        text,
      }
    }
    
    // Block if logos/brands detected
    if (logos.detected && logos.logos.length > 0) {
      const logoNames = logos.logos.map(l => l.description).join(', ')
      console.warn(`[CopyrightValidator] BLOCKED: Logos detected - ${logoNames}`)
      return {
        valid: false,
        error: 'Image contains brand logos or trademarks',
        details: `Detected ${logos.logos.length} logo(s): ${logoNames}`,
        suggestion: `Remove brand logos and trademarks from your image. Try:
• Cropping out the branded areas
• Using plain backgrounds
• Creating custom graphics without commercial brands`,
        code: 'COPYRIGHT_LOGO_DETECTED',
        category: 'copyright',
        severity: 'error',
        canRetry: false,
        faces,
        logos,
        text,
      }
    }
    
    // Block if copyright text/watermarks detected
    if (text.hasCopyright || text.hasWatermark) {
      console.warn('[CopyrightValidator] BLOCKED: Copyright text or watermark detected')
      return {
        valid: false,
        error: 'Image contains copyright notices or watermarks',
        details: text.hasCopyright 
          ? 'Detected copyright symbols (©, ®, ™) or copyright text'
          : 'Detected stock photo watermark',
        suggestion: `This image appears to be copyrighted or from a stock photo site. Please use:
• Your own original photos
• Royalty-free images with commercial licenses
• AI-generated images
• Public domain images`,
        code: 'COPYRIGHT_WATERMARK_DETECTED',
        category: 'copyright',
        severity: 'error',
        canRetry: false,
        faces,
        logos,
        text,
      }
    }
    
    // All checks passed
    console.log('[CopyrightValidator] ✅ Validation passed')
    return {
      valid: true,
      faces,
      logos,
      text,
    }
    
  } catch (error) {
    console.error('[CopyrightValidator] Validation error:', error)
    
    // On error, fail safe by allowing (graceful degradation)
    // Better to allow some bad images than block all images
    return {
      valid: true,
      code: 'COPYRIGHT_VALIDATION_ERROR',
      details: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
