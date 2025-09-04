'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { generatePerfMonitoring, generatePrefetchLinks } from '@/lib/seo/performance-optimizer'
import { usePathname } from 'next/navigation'

interface OptimizedPlatformLayoutProps {
  children: React.ReactNode
  platform: string
  criticalCSS?: string
}

export function OptimizedPlatformLayout({ 
  children, 
  platform,
  criticalCSS 
}: OptimizedPlatformLayoutProps) {
  const pathname = usePathname()
  
  // Prefetch related pages
  useEffect(() => {
    const prefetchLinks = generatePrefetchLinks(pathname)
    
    prefetchLinks.forEach(link => {
      const linkEl = document.createElement('link')
      linkEl.rel = 'prefetch'
      linkEl.href = link
      linkEl.as = 'document'
      document.head.appendChild(linkEl)
    })
    
    // Cleanup
    return () => {
      prefetchLinks.forEach(link => {
        const linkEl = document.querySelector(`link[rel="prefetch"][href="${link}"]`)
        if (linkEl) linkEl.remove()
      })
    }
  }, [pathname])
  
  // Preload critical fonts
  useEffect(() => {
    const fontLink = document.createElement('link')
    fontLink.rel = 'preload'
    fontLink.href = '/fonts/inter-var-latin.woff2'
    fontLink.as = 'font'
    fontLink.type = 'font/woff2'
    fontLink.crossOrigin = 'anonymous'
    document.head.appendChild(fontLink)
    
    return () => {
      document.head.removeChild(fontLink)
    }
  }, [])
  
  return (
    <>
      {/* Critical CSS inline */}
      {criticalCSS && (
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      )}
      
      {/* Performance monitoring */}
      <Script
        id="perf-monitoring"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: generatePerfMonitoring() }}
      />
      
      {/* Content */}
      {children}
      
      {/* Lazy load non-critical scripts */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="lazyOnload"
      />
    </>
  )
}

// Optimized image component with native lazy loading
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes,
  onLoad
}: {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  sizes?: string
  onLoad?: () => void
}) {
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      link.imageSizes = sizes || ''
      document.head.appendChild(link)
      
      return () => {
        document.head.removeChild(link)
      }
    }
  }, [src, priority, sizes])
  
  return (
    <picture>
      <source
        srcSet={`${src}?w=${width}&fm=webp`}
        type="image/webp"
      />
      <source
        srcSet={`${src}?w=${width}&fm=avif`}
        type="image/avif"
      />
      <img
        src={`${src}?w=${width}`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        className={className}
        sizes={sizes}
        onLoad={onLoad}
      />
    </picture>
  )
}