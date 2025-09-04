// Performance optimization utilities for platform and tool pages

// Resource hints for critical third-party connections
export const CRITICAL_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://www.google-analytics.com',
  'https://www.googletagmanager.com',
  'https://vercel.live',
  'https://vitals.vercel-insights.com'
]

// Generate resource hints for better performance
export function generateResourceHints() {
  return CRITICAL_ORIGINS.map(origin => ({
    rel: 'preconnect',
    href: origin,
    crossOrigin: 'anonymous'
  }))
}

// Critical CSS for above-the-fold content
export const CRITICAL_CSS = `
  /* Critical fonts */
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('/fonts/inter-var-latin.woff2') format('woff2');
  }
  
  /* Critical layout styles */
  .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
  .hero-section { min-height: 60vh; display: flex; align-items: center; }
  .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
  @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  
  /* Critical above-fold styles */
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .text-6xl { font-size: 3.75rem; line-height: 1; }
  .font-bold { font-weight: 700; }
  .mb-6 { margin-bottom: 1.5rem; }
  .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
`

// Generate performance monitoring script
export function generatePerfMonitoring() {
  return `
    // Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            metric_name: 'LCP',
            metric_value: Math.round(lastEntry.startTime),
            metric_delta: Math.round(lastEntry.startTime)
          });
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      
      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const delay = entry.processingStart - entry.startTime;
          console.log('FID:', delay);
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              metric_name: 'FID',
              metric_value: Math.round(delay),
              metric_delta: Math.round(delay)
            });
          }
        });
      }).observe({ type: 'first-input', buffered: true });
    }
  `
}

// Image optimization config for different platforms
export const PLATFORM_IMAGE_CONFIG = {
  youtube: {
    hero: { width: 1920, height: 1080, sizes: '(max-width: 768px) 100vw, 1920px' },
    showcase: { width: 1280, height: 720, sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px' },
    thumbnail: { width: 640, height: 360, sizes: '(max-width: 768px) 50vw, 320px' }
  },
  tiktok: {
    hero: { width: 1080, height: 1920, sizes: '(max-width: 768px) 100vw, 540px' },
    showcase: { width: 540, height: 960, sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px' },
    thumbnail: { width: 270, height: 480, sizes: '(max-width: 768px) 50vw, 270px' }
  },
  instagram: {
    hero: { width: 1080, height: 1080, sizes: '(max-width: 768px) 100vw, 600px' },
    showcase: { width: 640, height: 640, sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px' },
    thumbnail: { width: 320, height: 320, sizes: '(max-width: 768px) 50vw, 320px' }
  },
  spotify: {
    hero: { width: 640, height: 640, sizes: '(max-width: 768px) 100vw, 640px' },
    showcase: { width: 300, height: 300, sizes: '(max-width: 768px) 100vw, 300px' },
    thumbnail: { width: 150, height: 150, sizes: '(max-width: 768px) 50vw, 150px' }
  }
}

// Lazy loading configuration for components
export const LAZY_LOAD_CONFIG = {
  rootMargin: '50px 0px', // Start loading 50px before viewport
  threshold: 0.01,
  trackVisibility: true,
  delay: 100
}

// Bundle splitting strategies
export const BUNDLE_OPTIMIZATION = {
  // Components to lazy load
  lazyComponents: [
    'PlatformShowcase',
    'EnhancedContent',
    'PricingSection',
    'FAQSection',
    'TestimonialSection'
  ],
  
  // Third-party libraries to load on demand
  lazyLibraries: {
    'framer-motion': () => import('framer-motion'),
    'react-intersection-observer': () => import('react-intersection-observer'),
    'react-lazy-load-image-component': () => import('react-lazy-load-image-component')
  }
}

// Generate optimized viewport meta tag
export function generateViewportMeta() {
  return 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover'
}

// Prefetch strategy for navigation
export function generatePrefetchLinks(currentPath: string) {
  const prefetchPaths = []
  
  // Prefetch related platform pages
  if (currentPath.includes('/platforms/')) {
    prefetchPaths.push(
      '/en/platforms/youtube',
      '/en/platforms/tiktok',
      '/en/platforms/instagram'
    )
  }
  
  // Prefetch related tool pages
  if (currentPath.includes('/tools/')) {
    prefetchPaths.push(
      '/en/tools/spotify-playlist-cover',
      '/en/tools/social-media-poster',
      '/en/tools/youtube-thumbnail-maker'
    )
  }
  
  // Always prefetch generator
  prefetchPaths.push('/en#generator')
  
  return prefetchPaths
    .filter(path => path !== currentPath)
    .slice(0, 3) // Limit to 3 prefetches
}

// Service Worker registration for offline support
export const SERVICE_WORKER_CONFIG = `
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => console.log('SW registered:', registration.scope),
        (err) => console.log('SW registration failed:', err)
      );
    });
  }
`