'use client'

import { lazy, Suspense } from 'react'
import { Linkedin, Briefcase, Users, TrendingUp, Award, Sparkles } from 'lucide-react'
import { getLightweightKeywords } from '@/lib/seo/lightweight-keywords'
import { platformShowcases } from '@/lib/platform-showcases'

// Lazy load heavy components for better performance
const OptimizedPlatformPage = lazy(() => import('@/components/seo/OptimizedPlatformPage'))
const DynamicPlatformShowcase = lazy(() => import('@/components/seo/DynamicPlatformShowcase'))

const features = [
  {
    icon: Briefcase,
    "title": "Professional",
    "description": "Corporate-ready cover designs"
  },
  {
    icon: Users,
    "title": "Network Ready",
    "description": "Builds your professional brand"
  },
  {
    icon: TrendingUp,
    "title": "Career Boost",
    "description": "Stand out to recruiters and connections"
  },
  {
    icon: Award,
    "title": "Authority Builder",
    "description": "Establish thought leadership"
  }
]

const linkedinConfig = {
  name: 'LinkedIn',
  icon: Linkedin,
  gradientColors: 'from-blue-600 to-blue-700',
  features,
  showcases: platformShowcases.linkedin || [],
  primaryColor: '#0077B5'
}

// Simple loading component for better perceived performance
function LinkedInLoadingSkeleton() {
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

export default function LinkedInContentMakerClient({ 
  locale, 
  translations 
}: { 
  locale: string, 
  translations: any 
}) {
  // Use lightweight keywords for initial render
  const lightweightKeywords = getLightweightKeywords('linkedin')

  return (
    <Suspense fallback={<LinkedInLoadingSkeleton />}>
      <OptimizedPlatformPage
        config={linkedinConfig}
        locale={locale}
      >
        {/* Additional LinkedIn-specific content can go here */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <DynamicPlatformShowcase
            platform="linkedin"
            showcases={linkedinConfig.showcases}
            primaryColor={linkedinConfig.primaryColor}
          />
        </Suspense>
      </OptimizedPlatformPage>
    </Suspense>
  )
}