'use client'

import { lazy, Suspense } from 'react'
import { Music, TrendingUp, Smartphone, Sparkles, Zap, Sparkles } from 'lucide-react'
import { getLightweightKeywords } from '@/lib/seo/lightweight-keywords'
import { platformShowcases } from '@/lib/platform-showcases'

// Lazy load heavy components for better performance
const OptimizedPlatformPage = lazy(() => import('@/components/seo/OptimizedPlatformPage'))
const DynamicPlatformShowcase = lazy(() => import('@/components/seo/DynamicPlatformShowcase'))

const features = [
  {
    icon: TrendingUp,
    "title": "Viral Ready",
    "description": "Designs optimized for TikTok algorithm"
  },
  {
    icon: Smartphone,
    "title": "Mobile First",
    "description": "Perfect vertical format for mobile viewing"
  },
  {
    icon: Sparkles,
    "title": "Eye Catching",
    "description": "Bold designs that stop the scroll"
  },
  {
    icon: Zap,
    "title": "Quick Generate",
    "description": "Viral covers in seconds"
  }
]

const tiktokConfig = {
  name: 'TikTok',
  icon: Music,
  gradientColors: 'from-purple-600 to-pink-600',
  features,
  showcases: platformShowcases.tiktok || [],
  primaryColor: '#000000'
}

// Simple loading component for better perceived performance
function TikTokLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="h-12 bg-gray-200 animate-pulse rounded-md max-w-lg mx-auto mb-4" />
        <div className="h-6 bg-gray-200 animate-pulse rounded-md max-w-md mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6">
              <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-2xl mx-auto mb-4" />
              <div className="h-5 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TikTokContentMakerClient({ 
  locale, 
  translations 
}: { 
  locale: string, 
  translations: any 
}) {
  // Use lightweight keywords for initial render
  const lightweightKeywords = getLightweightKeywords('tiktok')

  return (
    <Suspense fallback={<TikTokLoadingSkeleton />}>
      <OptimizedPlatformPage
        config={tiktokConfig}
        locale={locale}
      >
        {/* Additional TikTok-specific content can go here */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <DynamicPlatformShowcase
            platform="tiktok"
            showcases={tiktokConfig.showcases}
            primaryColor={tiktokConfig.primaryColor}
          />
        </Suspense>
      </OptimizedPlatformPage>
    </Suspense>
  )
}