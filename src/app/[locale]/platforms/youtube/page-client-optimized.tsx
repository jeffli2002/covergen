'use client'

import { lazy, Suspense } from 'react'
import { Youtube, MousePointer2, TrendingUp, Eye, Zap, Sparkles } from 'lucide-react'
import { getLightweightKeywords } from '@/lib/seo/lightweight-keywords'
import { platformShowcases } from '@/lib/platform-showcases'

// Lazy load heavy components for better performance
const OptimizedPlatformPage = lazy(() => import('@/components/seo/OptimizedPlatformPage'))
const DynamicPlatformShowcase = lazy(() => import('@/components/seo/DynamicPlatformShowcase'))

const features = [
  {
    icon: MousePointer2,
    "title": "Click Magnet",
    "description": "Thumbnails designed for maximum CTR boost"
  },
  {
    icon: TrendingUp,
    "title": "Algorithm Ready",
    "description": "Optimized for YouTube recommendation system"
  },
  {
    icon: Eye,
    "title": "Attention Grabber",
    "description": "Stand out in crowded subscription feeds"
  },
  {
    icon: Zap,
    "title": "Quick Generate",
    "description": "Professional thumbnails in under 10 seconds"
  }
]

const youtubeConfig = {
  name: 'YouTube',
  icon: Youtube,
  gradientColors: 'from-red-600 to-red-500',
  features,
  showcases: platformShowcases.youtube || [],
  primaryColor: '#FF0000'
}

// Simple loading component for better perceived performance
function YouTubeLoadingSkeleton() {
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

export default function YouTubeContentMakerClient({ 
  locale, 
  translations 
}: { 
  locale: string, 
  translations: any 
}) {
  // Use lightweight keywords for initial render
  const lightweightKeywords = getLightweightKeywords('youtube')

  return (
    <Suspense fallback={<YouTubeLoadingSkeleton />}>
      <OptimizedPlatformPage
        config={youtubeConfig}
        locale={locale}
      >
        {/* Additional YouTube-specific content can go here */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <DynamicPlatformShowcase
            platform="youtube"
            showcases={youtubeConfig.showcases}
            primaryColor={youtubeConfig.primaryColor}
          />
        </Suspense>
      </OptimizedPlatformPage>
    </Suspense>
  )
}