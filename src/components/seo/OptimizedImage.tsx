'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  onLoad?: () => void
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  preloadOnHover?: boolean
  loading?: 'eager' | 'lazy'
}

// Generate optimal blur placeholder
const generateBlurDataURL = (width: number = 400, height: number = 300) => {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
  if (!canvas) {
    // Fallback blur data URL
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  }
  
  canvas.width = 10
  canvas.height = 10
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, 10, 10)
    return canvas.toDataURL()
  }
  return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 85,
  sizes,
  onLoad,
  placeholder = 'blur',
  blurDataURL,
  preloadOnHover = false,
  loading = 'lazy',
}: OptimizedImageProps) {
  const [isIntersecting, setIsIntersecting] = useState(priority)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!ref.current || priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [priority])

  // Handle image loading
  const handleLoad = useCallback(() => {
    setHasLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setHasLoaded(true)
  }, [])

  // Preload on hover
  useEffect(() => {
    if (!preloadOnHover || !isHovered || hasLoaded) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)

    return () => {
      try {
        document.head.removeChild(link)
      } catch {
        // Link may have already been removed
      }
    }
  }, [isHovered, preloadOnHover, src, hasLoaded])

  // Generate sizes attribute if not provided
  const optimizedSizes = sizes || (
    fill 
      ? '100vw' 
      : `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`
  )

  const shouldRender = priority || isIntersecting
  const defaultBlurDataURL = blurDataURL || generateBlurDataURL(width, height)

  return (
    <div 
      ref={ref} 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {shouldRender ? (
        <>
          {!hasLoaded && placeholder === 'blur' && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          
          {hasError ? (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Image not available</div>
            </div>
          ) : (
            <Image
              ref={imgRef}
              src={src}
              alt={alt}
              width={!fill ? width : undefined}
              height={!fill ? height : undefined}
              fill={fill}
              quality={quality}
              sizes={optimizedSizes}
              placeholder={placeholder}
              blurDataURL={defaultBlurDataURL}
              priority={priority}
              loading={priority ? 'eager' : loading}
              onLoad={handleLoad}
              onError={handleError}
              className={`transition-opacity duration-300 ${
                hasLoaded ? 'opacity-100' : 'opacity-0'
              } ${className}`}
            />
          )}
        </>
      ) : (
        <div 
          className={`bg-gray-200 animate-pulse ${fill ? 'absolute inset-0' : ''}`}
          style={!fill && width && height ? { width, height } : undefined}
        />
      )}
    </div>
  )
}

// High-performance image preloader
export function ImagePreloader({ srcs }: { srcs: string[] }) {
  useEffect(() => {
    const preloadImages = async () => {
      const promises = srcs.map(src => {
        return new Promise((resolve, reject) => {
          const img = new window.Image()
          img.onload = resolve
          img.onerror = reject
          img.src = src
        })
      })
      
      try {
        await Promise.allSettled(promises)
      } catch (error) {
        console.warn('Some images failed to preload:', error)
      }
    }

    // Preload after a short delay to not block initial render
    const timer = setTimeout(preloadImages, 100)
    return () => clearTimeout(timer)
  }, [srcs])

  return null
}

// Critical image component for above-the-fold content
export function CriticalImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      loading="eager"
      placeholder="blur"
      quality={90}
    />
  )
}

// Lazy image component for below-the-fold content
export function LazyImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={false}
      loading="lazy"
      preloadOnHover={true}
      quality={85}
    />
  )
}