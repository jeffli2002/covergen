'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, Music, Palette, Download, Zap, Shield } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

// Lazy load the Spotify Playlist Cover Tool
const SpotifyPlaylistCoverTool = dynamic(
  () => import(/* webpackChunkName: "spotify-playlist-cover-tool" */ '@/components/tools/SpotifyPlaylistCoverTool'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
  }
)

interface SpotifyPlaylistCoverClientProps {
  locale: Locale
  translations: any
}

export default function SpotifyPlaylistCoverClient({ locale, translations: t }: SpotifyPlaylistCoverClientProps) {
  const breadcrumbItems = [
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Spotify Playlist Cover', current: true }
  ]

  // Structured data for this page
  const structuredData = generateStructuredData('howto', {
    title: 'How to Create Spotify Playlist Covers with AI',
    description: 'Step-by-step guide to creating professional Spotify playlist covers using AI technology',
    steps: [
      { name: 'Enter Playlist Name', text: 'Type your playlist name and mood/genre' },
      { name: 'Select Style', text: 'Choose from various music-inspired design styles' },
      { name: 'Generate Cover', text: 'AI creates multiple cover options instantly' },
      { name: 'Customize Colors', text: 'Fine-tune colors to match your playlist vibe' },
      { name: 'Download', text: 'Export in perfect 300x300 pixels for Spotify' }
    ]
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <BreadcrumbWrapper>
        <Breadcrumb items={breadcrumbItems} />
      </BreadcrumbWrapper>

      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full text-green-700 text-sm font-medium mb-6">
                <Music className="w-4 h-4" />
                Perfect for Spotify Playlists
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Spotify Playlist Cover Maker
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Design eye-catching playlist covers with AI. Create professional 300x300 pixel artwork 
                that makes your Spotify playlists stand out and attract more listeners.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8"
                  onClick={() => {
                    const generator = document.getElementById('generator')
                    if (generator) {
                      generator.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      window.location.href = `/${locale}#generator`
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Playlist Cover
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">300x300</div>
                  <div className="text-sm text-gray-600">Perfect Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">HD</div>
                  <div className="text-sm text-gray-600">High Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">Free</div>
                  <div className="text-sm text-gray-600">No Watermark</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">AI</div>
                  <div className="text-sm text-gray-600">Smart Design</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Component */}
        <section className="py-12" id="generator">
          <div className="container mx-auto px-4">
            <SpotifyPlaylistCoverTool />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Features for Music Lovers
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create playlist covers that capture your music's essence
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Music className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Genre-Based Styles
                </h3>
                <p className="text-gray-600">
                  AI adapts designs to match your playlist genre - from lo-fi to metal, pop to classical
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Mood Matching
                </h3>
                <p className="text-gray-600">
                  Colors and designs that reflect your playlist's mood - energetic, chill, romantic, or focused
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Instant Generation
                </h3>
                <p className="text-gray-600">
                  Create multiple cover options in seconds with our AI-powered design engine
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Perfect Resolution
                </h3>
                <p className="text-gray-600">
                  Automatically exports at 300x300 pixels - Spotify's required playlist cover dimensions
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Trending Aesthetics
                </h3>
                <p className="text-gray-600">
                  Stay current with popular playlist cover trends and visual styles on Spotify
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Original Artwork
                </h3>
                <p className="text-gray-600">
                  All covers are uniquely generated - no copyright issues or duplicate designs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Playlist Types */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Popular Playlist Cover Styles
              </h2>
              <p className="text-lg text-gray-600">
                Get inspired by these trending playlist cover categories
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎵</div>
                <h3 className="font-semibold mb-2">Chill Vibes</h3>
                <p className="text-sm text-gray-600">Soft gradients, minimalist designs</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🏃‍♂️</div>
                <h3 className="font-semibold mb-2">Workout Mix</h3>
                <p className="text-sm text-gray-600">Bold colors, energetic patterns</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-semibold mb-2">Study Focus</h3>
                <p className="text-sm text-gray-600">Clean, organized, calming tones</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🌅</div>
                <h3 className="font-semibold mb-2">Morning Mood</h3>
                <p className="text-sm text-gray-600">Bright, uplifting, fresh designs</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-semibold mb-2">Party Hits</h3>
                <p className="text-sm text-gray-600">Vibrant, dynamic, fun visuals</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💔</div>
                <h3 className="font-semibold mb-2">Sad Songs</h3>
                <p className="text-sm text-gray-600">Moody, artistic, emotional depth</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎸</div>
                <h3 className="font-semibold mb-2">Rock Classics</h3>
                <p className="text-sm text-gray-600">Edgy, vintage, bold typography</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">☕</div>
                <h3 className="font-semibold mb-2">Coffee Shop</h3>
                <p className="text-sm text-gray-600">Warm, cozy, acoustic vibes</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Make Your Playlists Shine?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Create professional Spotify playlist covers in seconds
            </p>
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => {
                const generator = document.getElementById('generator')
                if (generator) {
                  generator.scrollIntoView({ behavior: 'smooth' })
                } else {
                  window.location.href = `/${locale}#generator`
                }
              }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating Now
            </Button>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg prose-seo">
              <h2 className="text-3xl font-bold mb-6 text-center">The Ultimate Spotify Playlist Cover Maker</h2>
              <p>
                Creating the perfect Spotify playlist cover is essential for attracting listeners and expressing 
                your musical taste. Our AI-powered Spotify playlist cover maker helps you design professional, 
                eye-catching covers that make your playlists stand out in the crowded Spotify ecosystem.
              </p>
              
              <h3>Why Playlist Covers Matter on Spotify</h3>
              <p>
                A compelling playlist cover is often the first thing potential listeners see. It can be the 
                difference between someone clicking play or scrolling past. Great playlist covers:
              </p>
              <ul>
                <li>Increase playlist discovery and follows</li>
                <li>Communicate the mood and genre instantly</li>
                <li>Build your personal brand as a curator</li>
                <li>Make your playlists more shareable on social media</li>
              </ul>
              
              <h3>Perfect Spotify Playlist Dimensions</h3>
              <p>
                Spotify requires playlist covers to be exactly 300x300 pixels in a 1:1 square ratio. Our tool 
                automatically generates covers in this precise dimension, ensuring your artwork looks crisp on 
                all devices - from desktop to mobile, from standard to retina displays.
              </p>
              
              <h3>AI-Powered Design Intelligence</h3>
              <p>
                Our AI analyzes millions of successful Spotify playlists to understand what makes covers engaging. 
                It considers color psychology, typography trends, and visual hierarchy to create designs that not 
                only look professional but also psychologically appeal to your target audience.
              </p>
              
              <h3>Genre-Specific Design Adaptation</h3>
              <p>
                Different music genres have distinct visual languages. Our AI understands these nuances:
              </p>
              <ul>
                <li><strong>Lo-fi & Chill:</strong> Soft pastels, anime aesthetics, minimalist illustrations</li>
                <li><strong>EDM & Dance:</strong> Neon colors, geometric patterns, high energy visuals</li>
                <li><strong>Hip-Hop:</strong> Bold typography, urban aesthetics, high contrast</li>
                <li><strong>Classical:</strong> Elegant fonts, sophisticated colors, timeless designs</li>
                <li><strong>Indie:</strong> Vintage filters, artistic photography, authentic feel</li>
              </ul>
              
              <h3>Free Spotify Playlist Cover Creation</h3>
              <p>
                Unlike other design tools that require subscriptions or leave watermarks, our Spotify playlist 
                cover maker is completely free. Create unlimited playlist covers without any hidden costs or 
                branding on your final designs. Your creativity shouldn't be limited by paywalls.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}