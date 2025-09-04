'use client'

import { lazy, Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Instagram, Image, Grid3x3, Film, Heart, Sparkles } from 'lucide-react'

// Lazy load heavy components
const DynamicPlatformShowcase = lazy(() => import('@/components/seo/DynamicPlatformShowcase'))
const JsonLdScript = lazy(() => import('@/components/seo/JsonLd').then(mod => ({ default: mod.JsonLd })))

// Lightweight feature data
const features = [
  {
    icon: Grid3x3,
    title: 'Feed Perfect',
    description: 'Maintain a cohesive, aesthetic Instagram grid'
  },
  {
    icon: Image,
    title: 'Multi-Format',
    description: 'Posts, stories, reels, and carousel designs'
  },
  {
    icon: Heart,
    title: 'Engagement Boost',
    description: 'Designs optimized for likes and saves'
  },
  {
    icon: Film,
    title: 'Reel Ready',
    description: 'Eye-catching covers for viral reels'
  }
]

// Lazy-loaded showcase data
const getShowcaseData = () => import('@/lib/platform-showcases').then(m => m.platformShowcases.instagram)

export default function InstagramOptimizedClient({ locale, translations }: { locale: string, translations: any }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Critical above-the-fold content */}
      <section className="py-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-3xl">
                <Instagram className="w-12 h-12 text-pink-600" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Instagram Content Maker
            </h1>
            
            <p className="text-xl md:text-2xl text-white mb-8 leading-relaxed">
              Create content that <span className="bg-white text-pink-600 px-2 py-1 rounded font-semibold">stops the scroll</span>. 
              AI-powered designs for Instagram success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href={`/${locale}#generator`}>
                <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-6 text-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Instagram Content
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
        <DynamicShowcaseLoader />
      </Suspense>

      {/* Features Grid - Immediate load for important content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need for Instagram
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-2xl">
                      <feature.icon className="w-8 h-8 text-pink-600" />
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

      {/* Lazy load remaining content */}
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
        <InstagramFormatsSection />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
        <InstagramAlgorithmSection />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
        <InstagramBestPracticesSection />
      </Suspense>

      {/* CTA Section - Critical */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Grow Your Instagram?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Create content that gets likes, saves, and new followers
          </p>
          <Link href={`/${locale}#generator`}>
            <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
              Start Creating Instagram Content
            </Button>
          </Link>
        </div>
      </section>

      {/* JSON-LD Schema - Lazy loaded */}
      <Suspense fallback={null}>
        <JsonLdScript data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to Create Viral Instagram Content',
          description: 'Step-by-step guide to creating engaging Instagram posts, stories, and reels with AI',
          step: [
            { '@type': 'HowToStep', name: 'Select content type', text: 'Choose from feed post, story, reel cover, or carousel' },
            { '@type': 'HowToStep', name: 'Upload brand elements', text: 'Add your photos, logo, or brand colors for consistency' },
            { '@type': 'HowToStep', name: 'Choose aesthetic', text: 'Select your preferred style: minimal, bold, vintage, or modern' },
            { '@type': 'HowToStep', name: 'Generate and customize', text: 'AI creates multiple options in perfect Instagram dimensions' }
          ]
        }} />
      </Suspense>
    </div>
  )
}

// Lazy-loaded components
function DynamicShowcaseLoader() {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
      <DynamicShowcaseWrapper />
    </Suspense>
  )
}

function DynamicShowcaseWrapper() {
  const [showcases, setShowcases] = useState([])
  
  useEffect(() => {
    getShowcaseData().then(data => {
      if (data && Array.isArray(data)) {
        setShowcases(data)
      }
    })
  }, [])
  
  if (!showcases.length) {
    return <div className="h-96 bg-gray-50 animate-pulse" />
  }
  
  return (
    <DynamicPlatformShowcase
      platform="Instagram"
      showcases={showcases}
      primaryColor="purple"
    />
  )
}

// Lazy-loaded sections
const InstagramFormatsSection = lazy(() => import('./sections/FormatsSection'))
const InstagramAlgorithmSection = lazy(() => import('./sections/AlgorithmSection'))
const InstagramBestPracticesSection = lazy(() => import('./sections/BestPracticesSection'))