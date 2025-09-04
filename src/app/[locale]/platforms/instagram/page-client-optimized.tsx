'use client'

import { lazy, Suspense } from 'react'
import { Instagram, Grid3x3, Image, Heart, Film, Sparkles } from 'lucide-react'
import { getLightweightKeywords } from '@/lib/seo/lightweight-keywords'
import { platformShowcases } from '@/lib/platform-showcases'

// Lazy load heavy components for better performance
const OptimizedPlatformPage = lazy(() => import('@/components/seo/OptimizedPlatformPage'))
const DynamicPlatformShowcase = lazy(() => import('@/components/seo/DynamicPlatformShowcase'))

const features = [
  {
    icon: Grid3x3,
    "title": "Feed Perfect",
    "description": "Maintain a cohesive, aesthetic Instagram grid"
  },
  {
    icon: Image,
    "title": "Multi-Format",
    "description": "Posts, stories, reels, and carousel designs"
  },
  {
    icon: Heart,
    "title": "Engagement Boost",
    "description": "Designs optimized for likes and saves"
  },
  {
    icon: Film,
    "title": "Reel Ready",
    "description": "Eye-catching covers for viral reels"
  }
]

const instagramConfig = {
  name: 'Instagram',
  icon: Instagram,
  gradientColors: 'from-pink-500 via-red-500 to-yellow-500',
  features,
  showcases: platformShowcases.instagram || [],
  primaryColor: '#E1306C'
}

// Simple loading component for better perceived performance
function InstagramLoadingSkeleton() {
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

export default function InstagramContentMakerClient({ 
  locale, 
  translations 
}: { 
  locale: string, 
  translations: any 
}) {
  // Use lightweight keywords for initial render
  const lightweightKeywords = getLightweightKeywords('instagram')

  return (
    <Suspense fallback={<InstagramLoadingSkeleton />}>
      <OptimizedPlatformPage
        config={instagramConfig}
        locale={locale}
      >
        {/* Additional Instagram-specific content can go here */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <DynamicPlatformShowcase
            platform="instagram"
            showcases={instagramConfig.showcases}
            primaryColor={instagramConfig.primaryColor}
          />
        </Suspense>
      </OptimizedPlatformPage>
    </Suspense>
  )
}