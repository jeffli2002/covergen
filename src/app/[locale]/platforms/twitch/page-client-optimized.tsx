'use client'

import { lazy, Suspense } from 'react'
import { Twitch, Gamepad2, Users, Zap, TrendingUp, Sparkles } from 'lucide-react'
import { getLightweightKeywords } from '@/lib/seo/lightweight-keywords'
import { platformShowcases } from '@/lib/platform-showcases'

// Lazy load heavy components for better performance
const OptimizedPlatformPage = lazy(() => import('@/components/seo/OptimizedPlatformPage'))
const DynamicPlatformShowcase = lazy(() => import('@/components/seo/DynamicPlatformShowcase'))

const features = [
  {
    icon: Gamepad2,
    "title": "Gaming Optimized",
    "description": "Designs perfect for gaming content"
  },
  {
    icon: Users,
    "title": "Community Ready",
    "description": "Builds your streaming brand"
  },
  {
    icon: Zap,
    "title": "Stream Ready",
    "description": "Professional overlays and thumbnails"
  },
  {
    icon: TrendingUp,
    "title": "Viewer Magnet",
    "description": "Thumbnails that boost viewership"
  }
]

const twitchConfig = {
  name: 'Twitch',
  icon: Twitch,
  gradientColors: 'from-purple-600 to-purple-700',
  features,
  showcases: platformShowcases.twitch || [],
  primaryColor: '#9146FF'
}

// Simple loading component for better perceived performance
function TwitchLoadingSkeleton() {
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

export default function TwitchContentMakerClient({ 
  locale, 
  translations 
}: { 
  locale: string, 
  translations: any 
}) {
  // Use lightweight keywords for initial render
  const lightweightKeywords = getLightweightKeywords('twitch')

  return (
    <Suspense fallback={<TwitchLoadingSkeleton />}>
      <OptimizedPlatformPage
        config={twitchConfig}
        locale={locale}
      >
        {/* Additional Twitch-specific content can go here */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <DynamicPlatformShowcase
            platform="twitch"
            showcases={twitchConfig.showcases}
            primaryColor={twitchConfig.primaryColor}
          />
        </Suspense>
      </OptimizedPlatformPage>
    </Suspense>
  )
}