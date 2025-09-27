'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, Disc3, Headphones, Radio, BarChart3, Sparkles } from 'lucide-react'
import PlatformShowcaseOptimized from '@/components/platform-showcase-optimized'
import { platformShowcases } from '@/lib/platform-showcases'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { SpotifyEnhancedContent } from './enhanced-content'

const features = [
  {
    icon: Music,
    title: 'Genre-Specific',
    description: 'Designs tailored to your music genre and mood'
  },
  {
    icon: Disc3,
    title: 'Perfect Square',
    description: 'Optimized 640x640px for crisp Spotify display'
  },
  {
    icon: BarChart3,
    title: 'Algorithm Boost',
    description: 'Eye-catching art that improves discoverability'
  },
  {
    icon: Headphones,
    title: 'Mood Matching',
    description: "Visuals that capture your playlist's vibe"
  }
]

export default function SpotifyPlaylistCoverMakerClient({ locale, translations }: { locale: string, translations: any }) {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Viral Spotify Playlist Covers',
    description: 'Step-by-step guide to creating engaging Spotify playlist and podcast covers with AI',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Select music genre',
        text: 'Choose your playlist genre: Pop, Hip-Hop, EDM, Chill, Rock, etc.'
      },
      {
        '@type': 'HowToStep',
        name: 'Describe the mood',
        text: "Input keywords that capture your playlist's vibe and energy"
      },
      {
        '@type': 'HowToStep',
        name: 'Add playlist title',
        text: 'Enter your playlist name for contextual design generation'
      },
      {
        '@type': 'HowToStep',
        name: 'Generate covers',
        text: 'AI creates multiple cover options in perfect Spotify dimensions'
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
            { name: 'Spotify', current: true }
          ]} />
        </BreadcrumbWrapper>
        
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-green-500 to-green-700">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-900 rounded-3xl">
                  <Music className="w-12 h-12 text-green-500" />
                </div>
              </div>
              
              <h1 className="text-hero-title text-white">
                Spotify Cover Art Maker
              </h1>
              
              <p className="text-hero-subtitle text-green-50 mb-8">
                Create playlist covers that <span className="text-green-100 font-light">get discovered</span>. 
                AI-powered art that makes your music stand out.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href={`/${locale}#generator`}>
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    className="bg-gray-900 hover:bg-gray-800 px-8 py-6 text-lg shadow-lg font-light" 
                    style={{color: 'white'}}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Spotify Covers
                  </Button>
                </Link>
                <Link href={`/${locale}#pricing`}>
                  <Button size="lg" variant="ghost" className="text-white border-2 border-white hover:bg-white hover:text-green-600 px-8 py-6 text-lg font-light transition-colors">
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <p className="text-green-100">
                Perfect for playlists • Podcast covers • Artist profiles
              </p>
            </div>
          </div>
        </section>


        {/* AI Transformation Showcase */}
        <PlatformShowcaseOptimized
          platform="Spotify"
          showcases={platformShowcases.spotify}
          primaryColor="green"
        />

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-section-title text-center mb-12">
              Optimized for Spotify Success
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-green-100 rounded-2xl">
                        <feature.icon className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-feature-title mb-2">{feature.title}</h3>
                    <p className="text-feature-description">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Genre Styles */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-section-title text-center mb-12">
                Cover Art for Every Genre
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  '🎵 Pop & Hits',
                  '🎤 Hip-Hop & Rap',
                  '🎸 Rock & Alternative',
                  '🎹 Classical & Jazz',
                  '🎧 EDM & Electronic',
                  '☕ Lo-fi & Chill',
                  '🏃 Workout & Energy',
                  '🧘 Meditation & Yoga',
                  '🎭 Podcast Covers',
                  '❤️ Romance & Slow',
                  '🌍 World Music',
                  '🎉 Party & Dance'
                ].map((genre) => (
                  <div key={genre} className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                    <span className="text-lg font-medium">{genre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Spotify Stats */}
        <section className="py-16 bg-black text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-section-title text-center mb-12 text-green-400">
                Why Great Cover Art Matters
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="bg-gray-900 rounded-2xl p-8">
                  <div className="text-4xl font-thin text-green-400 mb-2">85%</div>
                  <p className="text-gray-300">of listeners judge playlists by their covers</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-8">
                  <div className="text-4xl font-thin text-green-400 mb-2">3x</div>
                  <p className="text-gray-300">more likely to save playlists with pro covers</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-8">
                  <div className="text-4xl font-thin text-green-400 mb-2">60M+</div>
                  <p className="text-gray-300">playlists created on Spotify</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-section-title text-center mb-12">
                Spotify Cover Best Practices
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-2xl p-6">
                    <h3 className="text-feature-title mb-3">🎨 Bold & Simple</h3>
                    <p className="text-gray-600">
                      Covers appear small on mobile. Our AI ensures designs are clear and impactful at any size.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-2xl p-6">
                    <h3 className="text-feature-title mb-3">🌈 Genre-Appropriate Colors</h3>
                    <p className="text-gray-600">
                      Each genre has visual expectations. AI matches colors to your music style automatically.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-2xl p-6">
                    <h3 className="text-feature-title mb-3">📱 Mobile-First Design</h3>
                    <p className="text-gray-600">
                      80% of Spotify usage is mobile. Designs are optimized for small screen visibility.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-2xl p-6">
                    <h3 className="text-feature-title mb-3">✨ Stand Out in Browse</h3>
                    <p className="text-gray-600">
                      Unique covers get featured. Our AI creates distinctive art that catches the algorithm's eye.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section py-20 bg-gradient-to-br from-green-600 to-black text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-hero-title mb-6">
              Ready to Make Your Playlists Pop?
            </h2>
            <p className="text-hero-subtitle mb-8 opacity-90">
              Join creators making viral playlist covers with AI
            </p>
            <Link href={`/${locale}#generator`}>
              <Button 
                size="lg" 
                variant="ghost" 
                className="bg-green-400 hover:bg-green-300 px-8 py-6 text-lg font-light shadow-lg" 
                style={{color: 'black'}}
              >
                Start Creating Spotify Covers
              </Button>
            </Link>
          </div>
        </section>

        {/* Enhanced Content for SEO and AdSense */}
        <SpotifyEnhancedContent />
      </div>
    </>
  )
}