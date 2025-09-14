'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface WebVitalsMetric {
  name: string
  value: number
  delta: number
  id: string
  entries: any[]
}

export function PerformanceMonitor() {
  const pathname = usePathname()

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return

    // Web Vitals monitoring
    const reportWebVitals = (metric: WebVitalsMetric) => {
      // Log to console in development
      console.log(`${metric.name}:`, Math.round(metric.value))

      // Send to Google Analytics
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_action: metric.name,
          event_value: Math.round(metric.value),
          event_label: pathname,
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
        })
      }

      // Send to custom monitoring endpoint
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          metric: metric.name,
          value: metric.value,
          delta: metric.delta,
          id: metric.id,
          pathname,
          timestamp: Date.now(),
        })
        
        navigator.sendBeacon('/api/metrics', data)
      }
    }

    // Import web-vitals dynamically
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(reportWebVitals)
      onFCP(reportWebVitals)
      onLCP(reportWebVitals)
      onTTFB(reportWebVitals)
      onINP(reportWebVitals)
    })

    // Performance Observer for custom metrics
    if ('PerformanceObserver' in window) {
      // Observe long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
              })
              
              // Report to analytics
              if (window.gtag) {
                window.gtag('event', 'performance', {
                  event_category: 'Performance',
                  event_action: 'long_task',
                  event_value: Math.round(entry.duration),
                  event_label: pathname,
                })
              }
            }
          })
        })
        
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        
        return () => {
          longTaskObserver.disconnect()
        }
      } catch (e) {
        // Some browsers don't support longtask
        console.log('Long task observer not supported')
      }
    }

    // Navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (navigationEntries.length > 0) {
        const navTiming = navigationEntries[0]
        
        // Calculate key metrics
        const metrics = {
          dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
          tcp: navTiming.connectEnd - navTiming.connectStart,
          ttfb: navTiming.responseStart - navTiming.requestStart,
          download: navTiming.responseEnd - navTiming.responseStart,
          domInteractive: navTiming.domInteractive - navTiming.responseEnd,
          domComplete: navTiming.domComplete - navTiming.domInteractive,
          loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
        }

        // Log metrics
        console.log('Navigation Timing:', metrics)

        // Send to analytics
        if (window.gtag) {
          Object.entries(metrics).forEach(([key, value]) => {
            window.gtag!('event', 'timing_complete', {
              name: key,
              value: Math.round(value),
              event_category: 'Performance',
              event_label: pathname,
            })
          })
        }
      }
    }

    // Resource timing for critical resources
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      // Find critical resources (fonts, hero images, etc.)
      const criticalResources = resourceEntries.filter(entry => 
        entry.name.includes('.woff2') || 
        entry.name.includes('hero') || 
        entry.name.includes('critical')
      )

      criticalResources.forEach(resource => {
        const loadTime = resource.responseEnd - resource.startTime
        
        if (loadTime > 1000) {
          console.warn('Slow resource:', {
            name: resource.name,
            loadTime: Math.round(loadTime),
            size: resource.transferSize,
          })
        }
      })
    }

  }, [pathname])

  // Memory monitoring (Chrome only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    const checkMemory = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory
        const usedMemoryMB = Math.round(memory.usedJSHeapSize / 1048576)
        const totalMemoryMB = Math.round(memory.totalJSHeapSize / 1048576)
        
        // Alert if memory usage is high
        if (usedMemoryMB > 100) {
          console.warn('High memory usage:', {
            used: `${usedMemoryMB}MB`,
            total: `${totalMemoryMB}MB`,
            percentage: Math.round((usedMemoryMB / totalMemoryMB) * 100),
          })
        }
      }
    }

    const memoryInterval = setInterval(checkMemory, 30000) // Check every 30 seconds

    return () => {
      clearInterval(memoryInterval)
    }
  }, [])

  return null // This component doesn't render anything
}

// Utility to measure component render time
export function measureComponentPerformance(componentName: string) {
  if (process.env.NODE_ENV === 'production') return

  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`)
    }
  }
}