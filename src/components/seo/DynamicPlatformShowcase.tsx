'use client'

import { lazy, Suspense } from 'react'
import { Card } from '@/components/ui/card'

// Dynamic import with loading fallback
const PlatformShowcaseOptimized = lazy(() => 
  import('@/components/platform-showcase-optimized').then(module => ({
    default: module.default
  }))
)

interface DynamicPlatformShowcaseProps {
  platform: string
  showcases: any[]
  primaryColor?: string
}

function ShowcaseLoadingSkeleton() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 animate-pulse rounded-md max-w-lg mx-auto mb-4" />
            <div className="h-5 bg-gray-200 animate-pulse rounded-md max-w-md mx-auto" />
          </div>

          {/* Main Showcase Skeleton */}
          <Card className="p-6 md:p-8">
            <div className="flex justify-center mb-6">
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-full" />
            </div>
            
            {/* Image Container Skeleton */}
            <div className="relative mx-auto aspect-video max-w-3xl bg-gray-200 animate-pulse rounded-xl mb-8" />
            
            {/* Buttons Skeleton */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-md" />
            </div>
            
            {/* Navigation Skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-gray-200 animate-pulse rounded-full" />
                ))}
              </div>
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full" />
            </div>
          </Card>
          
          {/* CTA Section Skeleton */}
          <div className="text-center mt-12">
            <div className="h-6 bg-gray-200 animate-pulse rounded-md max-w-md mx-auto mb-4" />
            <div className="h-4 bg-gray-200 animate-pulse rounded-md max-w-sm mx-auto mb-6" />
            <div className="h-12 w-48 bg-gray-200 animate-pulse rounded-md mx-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function DynamicPlatformShowcase(props: DynamicPlatformShowcaseProps) {
  return (
    <Suspense fallback={<ShowcaseLoadingSkeleton />}>
      <PlatformShowcaseOptimized {...props} />
    </Suspense>
  )
}