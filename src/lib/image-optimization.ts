// Image optimization utilities for SEO and performance

interface ImageOptimizationConfig {
  quality?: number
  formats?: string[]
  sizes?: number[]
}

export const DEFAULT_IMAGE_CONFIG: ImageOptimizationConfig = {
  quality: 85,
  formats: ['webp', 'avif'],
  sizes: [640, 750, 828, 1080, 1200, 1920]
}

// Generate responsive image sizes attribute
export function generateSizes(config: {
  mobile?: string
  tablet?: string
  desktop?: string
}) {
  const { mobile = '100vw', tablet = '50vw', desktop = '33vw' } = config
  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`
}

// Get optimized image path
export function getOptimizedImagePath(originalPath: string, format: 'webp' | 'avif' = 'webp') {
  return originalPath.replace(/\.(jpg|jpeg|png)$/i, `.${format}`)
}

// Generate srcSet for responsive images
export function generateSrcSet(basePath: string, sizes: number[] = DEFAULT_IMAGE_CONFIG.sizes!) {
  return sizes
    .map(size => `${basePath}?w=${size} ${size}w`)
    .join(', ')
}

// Platform-specific image dimensions
export const PLATFORM_IMAGE_DIMENSIONS = {
  youtube: { width: 1280, height: 720, ratio: '16:9' },
  tiktok: { width: 1080, height: 1920, ratio: '9:16' },
  instagram: { width: 1080, height: 1080, ratio: '1:1' },
  spotify: { width: 640, height: 640, ratio: '1:1' },
  twitch: { width: 1200, height: 600, ratio: '2:1' },
  linkedin: { width: 1584, height: 396, ratio: '4:1' },
  bilibili: { width: 1146, height: 717, ratio: '16:10' },
  xiaohongshu: { width: 1080, height: 1440, ratio: '3:4' }
}

// Get placeholder blur data URL
export function getPlaceholderDataUrl(width: number = 10, height: number = 10) {
  // This is a generic blur placeholder - in production, generate specific ones
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
}

// Preload critical images
export function preloadImage(src: string) {
  if (typeof window === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  
  // Add type for WebP images
  if (src.endsWith('.webp')) {
    link.type = 'image/webp'
  }
  
  document.head.appendChild(link)
}

// Check if browser supports WebP
export function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(true)
  
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

// Get optimal image format
export async function getOptimalImageFormat(supportedFormats: string[] = ['webp', 'jpg']): Promise<string> {
  if (supportedFormats.includes('webp') && await supportsWebP()) {
    return 'webp'
  }
  return supportedFormats.find(f => f !== 'webp') || 'jpg'
}