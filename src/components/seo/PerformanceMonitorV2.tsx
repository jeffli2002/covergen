'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  cls: number // Cumulative Layout Shift
  fid: number // First Input Delay
  ttfb: number // Time to First Byte
  loadTime: number
  domContentLoaded: number
  jsHeapUsed?: number
  jsHeapTotal?: number
}

interface PerformanceMonitorProps {
  enabled?: boolean
  onMetricsReady?: (metrics: PerformanceMetrics) => void
  showDebug?: boolean
}

export default function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  onMetricsReady,
  showDebug = false
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(showDebug)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        console.log(`[Performance] ${entry.entryType}:`, entry)
      })
    })

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

    // Collect Core Web Vitals
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paintEntries = performance.getEntriesByType('paint')
      
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      const lcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0
      
      // Get CLS
      const clsEntries = performance.getEntriesByType('layout-shift')
      const cls = clsEntries.reduce((total: number, entry: any) => {
        if (!entry.hadRecentInput) {
          return total + entry.value
        }
        return total
      }, 0)

      // Get FID (approximate)
      const fidEntries = performance.getEntriesByType('first-input')
      const fid = fidEntries.length > 0 ? (fidEntries[0] as any).processingStart - fidEntries[0].startTime : 0

      // Get memory info if available
      const memInfo = (performance as any).memory
      const jsHeapUsed = memInfo?.usedJSHeapSize
      const jsHeapTotal = memInfo?.totalJSHeapSize

      const metrics: PerformanceMetrics = {
        fcp: Math.round(fcp),
        lcp: Math.round(lcp),
        cls: Math.round(cls * 1000) / 1000,
        fid: Math.round(fid),
        ttfb: Math.round(navigation.responseStart - navigation.requestStart),
        loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        jsHeapUsed,
        jsHeapTotal,
      }

      setMetrics(metrics)
      onMetricsReady?.(metrics)

      // Log performance insights
      console.log('[Performance Metrics]', metrics)
      
      // Performance warnings
      if (metrics.lcp > 2500) console.warn('⚠️ LCP is slow (>2.5s)')
      if (metrics.fcp > 1800) console.warn('⚠️ FCP is slow (>1.8s)')
      if (metrics.cls > 0.1) console.warn('⚠️ CLS needs improvement (>0.1)')
      if (metrics.fid > 100) console.warn('⚠️ FID needs improvement (>100ms)')
      if (metrics.loadTime > 3000) console.warn('⚠️ Total load time is slow (>3s)')

      // Success messages
      if (metrics.lcp <= 2500) console.log('✅ LCP is good (<=2.5s)')
      if (metrics.fcp <= 1800) console.log('✅ FCP is good (<=1.8s)')
      if (metrics.cls <= 0.1) console.log('✅ CLS is good (<=0.1)')
    }

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 1000)
    } else {
      window.addEventListener('load', () => setTimeout(collectMetrics, 1000))
    }

    return () => {
      observer.disconnect()
    }
  }, [enabled, onMetricsReady])

  // Toggle debug display
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!enabled || !isVisible || !metrics) return null

  const getScoreColor = (metric: string, value: number) => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      loadTime: { good: 2000, poor: 4000 }
    } as const

    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return 'text-gray-600'

    if (value <= threshold.good) return 'text-green-600'
    if (value <= threshold.poor) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const MB = bytes / 1024 / 1024
    return `${MB.toFixed(1)} MB`
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-sm font-mono z-[9999] max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Performance</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className={`flex justify-between ${getScoreColor('fcp', metrics.fcp)}`}>
          <span>FCP:</span> <span>{metrics.fcp}ms</span>
        </div>
        <div className={`flex justify-between ${getScoreColor('lcp', metrics.lcp)}`}>
          <span>LCP:</span> <span>{metrics.lcp}ms</span>
        </div>
        <div className={`flex justify-between ${getScoreColor('cls', metrics.cls)}`}>
          <span>CLS:</span> <span>{metrics.cls}</span>
        </div>
        <div className={`flex justify-between ${getScoreColor('fid', metrics.fid)}`}>
          <span>FID:</span> <span>{metrics.fid}ms</span>
        </div>
        <div className="border-t border-white/20 pt-1 mt-1">
          <div className="flex justify-between text-white/80">
            <span>TTFB:</span> <span>{metrics.ttfb}ms</span>
          </div>
          <div className={`flex justify-between ${getScoreColor('loadTime', metrics.loadTime)}`}>
            <span>Load:</span> <span>{metrics.loadTime}ms</span>
          </div>
          <div className="flex justify-between text-white/80">
            <span>DOM:</span> <span>{metrics.domContentLoaded}ms</span>
          </div>
        </div>
        
        {metrics.jsHeapUsed && (
          <div className="border-t border-white/20 pt-1 mt-1">
            <div className="flex justify-between text-white/60 text-xs">
              <span>Memory:</span> <span>{formatBytes(metrics.jsHeapUsed)}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-white/40 mt-2">
        Ctrl+Shift+P to toggle
      </div>
    </div>
  )
}

// Hook for accessing performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  
  return { metrics, setMetrics }
}

// Performance boundary component
export function PerformanceBoundary({ 
  children, 
  name,
  onMetrics 
}: { 
  children: React.ReactNode
  name: string
  onMetrics?: (name: string, duration: number) => void
}) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      console.log(`[Performance] ${name} render time: ${duration.toFixed(2)}ms`)
      onMetrics?.(name, duration)
    }
  }, [name, onMetrics])
  
  return <>{children}</>
}