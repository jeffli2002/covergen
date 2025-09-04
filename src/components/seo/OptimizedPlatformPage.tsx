'use client'

import { lazy, Suspense, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

// Lazy load heavy components
const DynamicPlatformShowcase = lazy(() => import('./DynamicPlatformShowcase'))

interface PlatformConfig {
  name: string
  icon: React.ComponentType<{ className?: string }>
  gradientColors: string
  features: Array<{
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
  }>
  showcases: any[]
  primaryColor: string
}

interface OptimizedPlatformPageProps {
  config: PlatformConfig
  locale: string
  children?: React.ReactNode
}

// Lightweight loading skeleton for features section
function FeaturesLoadingSkeleton() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="h-8 bg-gray-200 animate-pulse rounded-md max-w-md mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-2xl" />
                </div>
                <div className="h-5 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function OptimizedPlatformPage({ config, locale, children }: OptimizedPlatformPageProps) {
  const { name, icon: Icon, gradientColors, features, showcases, primaryColor } = config

  // Memoize heavy computations
  const memoizedFeatures = useMemo(() => features, [features])
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Always above fold, no lazy loading */}
      <section className={`py-20 ${gradientColors}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-3xl">
                <Icon className="w-12 h-12 text-current" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              {name} Content Maker
            </h1>
            
            <p className="text-xl md:text-2xl text-white mb-8 leading-relaxed">
              Create content that <span className="bg-white text-current px-2 py-1 rounded font-semibold">stops the scroll</span>. 
              AI-powered designs for {name} success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href={`/${locale}#generator`}>
                <Button size="lg" className="bg-white text-current hover:bg-gray-100 px-8 py-6 text-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create {name} Content
                </Button>
              </Link>
              <Link href={`/${locale}#pricing`}>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20 px-8 py-6 text-lg">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <p className="text-white/90">
              Perfect for influencers • Brands • Content creators
            </p>
          </div>
        </div>
      </section>

      {/* AI Transformation Showcase - Lazy loaded */}
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <DynamicPlatformShowcase
          platform={name}
          showcases={showcases}
          primaryColor={primaryColor}
        />
      </Suspense>

      {/* Features Grid - Lazy loaded */}
      <Suspense fallback={<FeaturesLoadingSkeleton />}>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Everything You Need for {name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {memoizedFeatures.map((feature, index) => (
                <Card key={`${feature.title}-${index}`} className="hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-2xl">
                        <feature.icon className="w-8 h-8 text-current" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Suspense>

      {/* Additional content - lazy loaded */}
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
        {children}
      </Suspense>

      {/* CTA Section - Always visible */}
      <section className={`py-20 ${gradientColors} text-white`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Grow Your {name}?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Create content that gets likes, saves, and new followers
          </p>
          <Link href={`/${locale}#generator`}>
            <Button size="lg" className="bg-white text-current hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
              Start Creating {name} Content
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}