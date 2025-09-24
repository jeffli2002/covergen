'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, ShoppingBag, Sparkle, TrendingUp, Sparkles, Heart } from 'lucide-react'
import RednoteIcon from '@/components/icons/RednoteIcon'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'

const features = [
  {
    icon: Camera,
    title: 'Aesthetic First',
    description: 'Beautiful, Instagram-worthy designs that fit Rednote style'
  },
  {
    icon: Heart,
    title: 'High Engagement',
    description: 'Covers optimized for likes, saves, and shares'
  },
  {
    icon: ShoppingBag,
    title: 'Shop-Ready',
    description: 'Perfect for product showcases and reviews'
  },
  {
    icon: Sparkle,
    title: 'Trending Styles',
    description: 'AI trained on viral Rednote aesthetics'
  }
]

export default function RednoteCoverMakerClient({ locale, translations }: { locale: string, translations: any }) {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Viral Rednote Covers',
    description: 'Step-by-step guide to creating engaging Rednote (小红书) covers with AI',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Choose content category',
        text: 'Select from beauty, fashion, food, travel, lifestyle, or fitness'
      },
      {
        '@type': 'HowToStep',
        name: 'Upload product/scene photos',
        text: 'Add your product images or lifestyle photos for the cover'
      },
      {
        '@type': 'HowToStep',
        name: 'Add Chinese/English title',
        text: 'Input your post title in Chinese, English, or both'
      },
      {
        '@type': 'HowToStep',
        name: 'Generate aesthetic covers',
        text: 'AI creates multiple cover options in Rednote-optimized formats'
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      
      <div className="min-h-screen bg-background">
        <BreadcrumbWrapper>
          <Breadcrumb items={[
            { name: 'Platforms', href: `/${locale}/platforms` },
            { name: 'Rednote', current: true }
          ]} />
        </BreadcrumbWrapper>
        
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-red-50 via-pink-50 to-red-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl">
                  <RednoteIcon className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Rednote (小红书) Cover Maker
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                Create covers that <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-semibold">go viral</span> on 
                Rednote. AI-powered designs for lifestyle influencers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href={`/${locale}#generator`}>
                  <Button size="lg" className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-6 text-lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Rednote Covers
                  </Button>
                </Link>
                <Link href={`/${locale}#pricing`}>
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white">
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <p className="text-gray-600">
                Perfect for KOLs • Lifestyle bloggers • Brand ambassadors
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Designed for Rednote Success
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl">
                        <feature.icon className="w-8 h-8 text-red-500" />
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

        {/* Content Categories */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Popular Rednote Content Categories
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  '💄 Beauty & Skincare',
                  '👗 Fashion & OOTD',
                  '🍱 Food & Recipe',
                  '✈️ Travel Guides',
                  '🏠 Home Decor',
                  '💪 Fitness & Wellness',
                  '📚 Study & Productivity',
                  '🎨 DIY & Crafts',
                  '🐱 Pet Life',
                  '💍 Wedding Planning',
                  '👶 Parenting Tips',
                  '🛍️ Product Reviews'
                ].map((category) => (
                  <div key={category} className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                    <span className="text-lg font-medium">{category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* XHS Specific Features */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Rednote-Specific Optimization
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-4">📐 Perfect Dimensions</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Square (1:1): 1080 x 1080px</li>
                    <li>• Vertical (3:4): 1080 x 1440px</li>
                    <li>• Horizontal (4:3): 1440 x 1080px</li>
                    <li>• Auto-crop for multi-image posts</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-4">🎨 Style Elements</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Minimal, clean aesthetics</li>
                    <li>• Soft, lifestyle photography</li>
                    <li>• Chinese & English text support</li>
                    <li>• Trending sticker elements</li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="text-3xl mb-2">🌟</div>
                  <h4 className="font-semibold mb-2">Filter Effects</h4>
                  <p className="text-gray-600">AI applies Rednote-popular filters automatically</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-semibold mb-2">Title Cards</h4>
                  <p className="text-gray-600">Eye-catching title overlays that drive clicks</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-semibold mb-2">Tag Optimization</h4>
                  <p className="text-gray-600">Designs that complement trending hashtags</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Rednote Cover Best Practices
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">✨ First Impression Matters</h3>
                    <p className="text-gray-600">
                      Your cover is your hook. Our AI ensures it's visually striking and on-brand for Rednote users.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">🎨 Lifestyle Aesthetic</h3>
                    <p className="text-gray-600">
                      Clean, aspirational visuals perform best. AI creates that perfect lifestyle vibe automatically.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">📱 Mobile-First</h3>
                    <p className="text-gray-600">
                      100% of Rednote users are on mobile. Designs are optimized for small screen impact.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">🌏 Cultural Relevance</h3>
                    <p className="text-gray-600">
                      Designs that resonate with Chinese aesthetics while maintaining global appeal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-red-500 to-pink-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Shine on Rednote?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Create covers that capture hearts and drive engagement
            </p>
            <Link href={`/${locale}#generator`}>
              <Button size="lg" className="bg-white text-red-500 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                Start Creating Rednote Covers
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}