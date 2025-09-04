'use client'

import { lazy, Suspense } from 'react'
import { Music, Music, Square, Headphones, Sparkles, Sparkles } from 'lucide-react'
import { getLightweightKeywords } from '@/lib/seo/lightweight-keywords'
import { platformShowcases } from '@/lib/platform-showcases'

// Lazy load heavy components for better performance
const OptimizedPlatformPage = lazy(() => import('@/components/seo/OptimizedPlatformPage'))
const DynamicPlatformShowcase = lazy(() => import('@/components/seo/DynamicPlatformShowcase'))

const features = [
  {
    icon: Music,
    "title": "Album Perfect",
    "description": "Professional album and playlist covers"
  },
  {
    icon: Square,
    "title": "Square Format",
    "description": "Optimized 1:1 aspect ratio for Spotify"
  },
  {
    icon: Headphones,
    "title": "Music Focused",
    "description": "Designs that match your sound"
  },
  {
    icon: Sparkles,
    "title": "Brand Ready",
    "description": "Consistent visual identity"
  }
]

const spotifyConfig = {
  name: 'Spotify',
  icon: Music,
  gradientColors: 'from-green-500 to-green-600',
  features,
  showcases: platformShowcases.spotify || [],
  primaryColor: '#1DB954'
}

// Simple loading component for better perceived performance
function SpotifyLoadingSkeleton() {
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

export default function SpotifyContentMakerClient({ 
  locale, 
  translations 
}: { 
  locale: string, 
  translations: any 
}) {
  // Use lightweight keywords for initial render
  const lightweightKeywords = getLightweightKeywords('spotify')

  return (
    <Suspense fallback={<SpotifyLoadingSkeleton />}>
      <OptimizedPlatformPage
        config={spotifyConfig}
        locale={locale}
      >
        {/* Additional Spotify-specific content can go here */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <DynamicPlatformShowcase
            platform="spotify"
            showcases={spotifyConfig.showcases}
            primaryColor={spotifyConfig.primaryColor}
          />
        </Suspense>
      </OptimizedPlatformPage>
    </Suspense>
  )
}