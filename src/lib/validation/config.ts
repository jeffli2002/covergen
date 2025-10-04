// Validation configuration

import { ValidationConfig } from './types'

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  enabled: process.env.VALIDATION_ENABLED !== 'false',
  mode: (process.env.VALIDATION_MODE as 'strict' | 'moderate' | 'permissive') || 'strict',
  layers: {
    basic: process.env.VALIDATION_LAYER_BASIC !== 'false',
    quality: process.env.VALIDATION_LAYER_QUALITY !== 'false',
    safety: process.env.VALIDATION_LAYER_SAFETY !== 'false',
    copyright: process.env.VALIDATION_LAYER_COPYRIGHT !== 'false',
  },
  timeoutMs: parseInt(process.env.VALIDATION_TIMEOUT_MS || '2000', 10),
  thresholds: {
    faceConfidence: parseFloat(process.env.VALIDATION_FACE_CONFIDENCE || '0.7'),
    logoConfidence: parseFloat(process.env.VALIDATION_LOGO_CONFIDENCE || '0.7'),
    nsfwConfidence: parseFloat(process.env.VALIDATION_NSFW_CONFIDENCE || '0.7'),
  },
}

// Configuration by subscription tier
export const VALIDATION_CONFIGS_BY_TIER: Record<string, Partial<ValidationConfig>> = {
  free: {
    mode: 'strict',
    layers: {
      basic: true,
      quality: true,
      safety: true,
      copyright: true,
    },
    thresholds: {
      faceConfidence: 0.7, // Strict - detect most faces
      logoConfidence: 0.7,
      nsfwConfidence: 0.7,
    },
  },
  pro: {
    mode: 'moderate',
    layers: {
      basic: true,
      quality: true,
      safety: true,
      copyright: true,
    },
    thresholds: {
      faceConfidence: 0.8, // Moderate - only high confidence faces
      logoConfidence: 0.7,
      nsfwConfidence: 0.7,
    },
  },
  pro_plus: {
    mode: 'permissive',
    layers: {
      basic: true,
      quality: false, // Pro+ can bypass quality checks
      safety: true,
      copyright: true,
    },
    thresholds: {
      faceConfidence: 0.8,
      logoConfidence: 0.8, // Higher threshold for Pro+
      nsfwConfidence: 0.7,
    },
  },
}

export function getValidationConfig(tier?: string): ValidationConfig {
  const tierConfig = tier ? VALIDATION_CONFIGS_BY_TIER[tier] : {}
  
  return {
    ...DEFAULT_VALIDATION_CONFIG,
    ...tierConfig,
    layers: {
      ...DEFAULT_VALIDATION_CONFIG.layers,
      ...(tierConfig.layers || {}),
    },
    thresholds: {
      ...DEFAULT_VALIDATION_CONFIG.thresholds,
      ...(tierConfig.thresholds || {}),
    },
  }
}
