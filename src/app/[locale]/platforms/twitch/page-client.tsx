'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Twitch, Users, Zap, Shield, Gamepad2, Sparkles } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'

const features = [
  {
    icon: Gamepad2,
    title: 'Gaming-Focused',
    description: 'Designs optimized for gaming streams and esports'
  },
  {
    icon: Users,
    title: 'Community Building',
    description: 'Graphics that help grow and engage your audience'
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Get multiple design options in seconds'
  },
  {
    icon: Shield,
    title: 'Brand Consistent',
    description: 'Maintain your unique streaming identity'
  }
]

export default function TwitchGraphicsMakerClient({ locale, translations }: { locale: string, translations: any }) {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Professional Twitch Graphics',
    description: 'Step-by-step guide to creating Twitch overlays, banners, and panels with AI',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Select graphic type',
        text: 'Choose from overlay, banner, panel, or other Twitch graphic formats'
      },
      {
        '@type': 'HowToStep',
        name: 'Upload brand assets',
        text: 'Add your logo, avatar, or brand colors for consistency'
      },
      {
        '@type': 'HowToStep',
        name: 'Customize style',
        text: 'Select gaming genre and aesthetic preferences'
      },
      {
        '@type': 'HowToStep',
        name: 'Generate and download',
        text: 'AI creates multiple options in proper Twitch dimensions'
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
            { name: 'Twitch', current: true }
          ]} />
        </BreadcrumbWrapper>
        
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-purple-900 to-purple-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-purple-800 rounded-3xl">
                  <Twitch className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Twitch Graphics Maker
              </h1>
              
              <p className="text-xl md:text-2xl text-purple-100 mb-8 leading-relaxed">
                Level up your stream with <span className="bg-white text-purple-800 px-2 py-1 rounded font-semibold">professional graphics</span>. 
                AI-powered overlays, banners, and panels that make you stand out.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href={`/${locale}#generator`}>
                  <Button size="lg" className="bg-white text-purple-800 hover:bg-gray-100 px-8 py-6 text-lg shadow-lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Twitch Graphics
                  </Button>
                </Link>
                <Link href={`/${locale}#pricing`}>
                  <Button size="lg" variant="ghost" className="text-white border-2 border-white hover:bg-white hover:text-purple-800 px-8 py-6 text-lg font-semibold">
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <p className="text-purple-200">
                Used by 10K+ streamers • Perfect dimensions • Stream-ready designs
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Built for Twitch Streamers
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-purple-100 rounded-2xl">
                        <feature.icon className="w-8 h-8 text-purple-600" />
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

        {/* Graphic Types */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                All Twitch Graphics You Need
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">🎮</div>
                  <h3 className="text-xl font-semibold mb-2">Stream Overlays</h3>
                  <p className="text-gray-600">Webcam frames, alerts, and HUD elements</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">🖼️</div>
                  <h3 className="text-xl font-semibold mb-2">Channel Banners</h3>
                  <p className="text-gray-600">Profile banner, video player banner, offline screen</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">Info Panels</h3>
                  <p className="text-gray-600">About, schedule, donation, and social panels</p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <h3 className="text-2xl font-semibold mb-6">Popular Streaming Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    '🎮 Gaming',
                    '💬 Just Chatting',
                    '🎨 Art & Creative',
                    '🎵 Music & DJ',
                    '🍳 Cooking',
                    '🏋️ Fitness',
                    '📚 Education',
                    '🎲 Tabletop RPG'
                  ].map((category) => (
                    <div key={category} className="bg-purple-50 rounded-xl p-4">
                      <span className="font-medium">{category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dimensions Guide */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Perfect Twitch Dimensions
              </h2>
              
              <div className="bg-purple-50 rounded-2xl p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Banner Sizes</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Profile Banner: 1200 x 480px</li>
                      <li>• Video Player Banner: 1920 x 480px</li>
                      <li>• Offline Screen: 1920 x 1080px</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Panel & Overlay Sizes</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Info Panels: 320 x 100px</li>
                      <li>• Webcam Overlay: 1920 x 1080px</li>
                      <li>• Alert Box: 800 x 600px</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-6 text-center text-gray-600">
                  Our AI automatically generates graphics in all correct dimensions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-800 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Level Up Your Stream?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Join thousands of streamers creating professional graphics with AI
            </p>
            <Link href={`/${locale}#generator`}>
              <Button size="lg" className="bg-white text-purple-800 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-lg">
                Start Creating Stream Graphics
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}