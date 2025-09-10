/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    domains: ['storage.googleapis.com', 'oss.aliyuncs.com'],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Critical performance improvements
  },
  // Enhanced experimental features for performance
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons', 
      '@/components/ui', 
      '@/lib',
      'next/image',
      'react'
    ],
    // Enable advanced optimizations
    serverComponentsExternalPackages: ['sharp'],
    optimizeServerReact: true,
  },
  // Bundle analyzer integration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate SEO keywords into their own chunk
          seoKeywords: {
            name: 'seo-keywords',
            test: /[\\/]lib[\\/]seo[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          // Platform-specific components
          platformComponents: {
            name: 'platform-components',
            test: /[\\/]components[\\/](platform-|seo\/)/,
            chunks: 'all',
            priority: 25,
          },
          // UI components
          uiComponents: {
            name: 'ui-components',
            test: /[\\/]components[\\/]ui[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          // Icons
          icons: {
            name: 'icons',
            test: /lucide-react|@radix-ui/,
            chunks: 'all',
            priority: 15,
          },
        },
      }
    }
    
    return config
  },
  // Optimize compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async redirects() {
    return [
      // Redirect root to default locale
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Force HTTPS canonical for all pages
          {
            key: 'Link',
            value: '<https://covergen.pro/:path*>; rel="canonical"',
          },
        ],
      },
      // OAuth popup callback headers
      {
        source: '/auth/callback-popup',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' https: data:;",
          },
        ],
      },
      // Optimize caching for static images
      {
        source: '/platform-examples/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Add security headers for images
      {
        source: '/_next/image/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig