'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Instagram, Image, Grid3x3, Film, Heart, Sparkles } from 'lucide-react'
import PlatformShowcaseOptimized from '@/components/platform-showcase-optimized'
import { platformShowcases } from '@/lib/platform-showcases'

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

export default function InstagramContentMakerClient({ locale, translations }: { locale: string, translations: any }) {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Viral Instagram Content',
    description: 'Step-by-step guide to creating engaging Instagram posts, stories, and reels with AI',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Select content type',
        text: 'Choose from feed post, story, reel cover, or carousel'
      },
      {
        '@type': 'HowToStep',
        name: 'Upload brand elements',
        text: 'Add your photos, logo, or brand colors for consistency'
      },
      {
        '@type': 'HowToStep',
        name: 'Choose aesthetic',
        text: 'Select your preferred style: minimal, bold, vintage, or modern'
      },
      {
        '@type': 'HowToStep',
        name: 'Generate and customize',
        text: 'AI creates multiple options in perfect Instagram dimensions'
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
        {/* Hero Section */}
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
                  <Button size="lg" variant="outline" className="text-white border-2 border-white hover:bg-white hover:text-pink-600 px-8 py-6 text-lg">
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

        {/* AI Transformation Showcase */}
        <PlatformShowcaseOptimized
          platform="Instagram"
          showcases={platformShowcases.instagram}
          primaryColor="purple"
        />

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Everything You Need for Instagram
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:scale-105 transition-transform">
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

        {/* Content Types & Dimensions */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                All Instagram Formats Covered
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">📷</div>
                    <h3 className="text-xl font-semibold">Feed Posts</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Square: 1080 x 1080px</li>
                    <li>• Portrait: 1080 x 1350px</li>
                    <li>• Landscape: 1080 x 566px</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">📱</div>
                    <h3 className="text-xl font-semibold">Stories & Reels</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Story: 1080 x 1920px</li>
                    <li>• Reel Cover: 1080 x 1920px</li>
                    <li>• Story Highlight: 1080 x 1920px</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">🎠</div>
                    <h3 className="text-xl font-semibold">Carousel Posts</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Up to 10 slides</li>
                    <li>• Consistent design across slides</li>
                    <li>• Swipeable storytelling</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">🛍️</div>
                    <h3 className="text-xl font-semibold">Shopping Posts</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Product tags ready</li>
                    <li>• Clean product showcase</li>
                    <li>• CTA optimized</li>
                  </ul>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-semibold text-center mb-6">Popular Instagram Niches</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    '👗 Fashion',
                    '🍔 Food',
                    '✈️ Travel',
                    '💄 Beauty',
                    '🏋️ Fitness',
                    '🎨 Art',
                    '📸 Photography',
                    '🌿 Lifestyle',
                    '💼 Business',
                    '🐾 Pets',
                    '🎮 Gaming',
                    '📚 Education'
                  ].map((niche) => (
                    <div key={niche} className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-xl p-4 text-center">
                      <span className="font-medium">{niche}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instagram Algorithm */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Optimized for Instagram Algorithm
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                  <div className="text-4xl font-bold text-pink-600 mb-2">87%</div>
                  <p className="text-gray-600">more engagement with consistent aesthetics</p>
                </div>
                <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-8">
                  <div className="text-4xl font-bold text-pink-600 mb-2">3.5x</div>
                  <p className="text-gray-600">higher reach with optimized visuals</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-2xl p-8">
                  <div className="text-4xl font-bold text-pink-600 mb-2">2B+</div>
                  <p className="text-gray-600">active users on Instagram</p>
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
                Instagram Content Best Practices
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">🎨 Consistent Aesthetic</h3>
                    <p className="text-gray-600">
                      Maintain a cohesive look across your feed. Our AI ensures brand consistency automatically.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">📸 High-Quality Visuals</h3>
                    <p className="text-gray-600">
                      Instagram is visual-first. AI creates crisp, professional designs that stand out.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">🎯 Story-Driven Content</h3>
                    <p className="text-gray-600">
                      Tell compelling stories through visuals. Designs that encourage engagement and shares.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">#️⃣ Hashtag Ready</h3>
                    <p className="text-gray-600">
                      Clean designs that complement your hashtag strategy for maximum discoverability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
      </div>
    </>
  )
}