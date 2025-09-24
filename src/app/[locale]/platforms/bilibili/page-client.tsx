'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, CheckCircle, Zap, Globe, Palette, Shield } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

interface BilibiliCoverClientProps {
  locale: Locale
  translations: any
}

export default function BilibiliCoverClient({ locale, translations: t }: BilibiliCoverClientProps) {
  const breadcrumbItems = [
    { name: 'Home', href: `/${locale}` },
    { name: 'Platforms', href: `/${locale}/platforms` },
    { name: 'Bilibili', current: true }
  ]

  // Structured data for this page
  const structuredData = generateStructuredData('howto', {
    title: 'How to Create Bilibili Video Covers with AI',
    description: 'Step-by-step guide to creating professional Bilibili video covers using AI technology',
    steps: [
      { name: 'Enter Video Title', text: 'Type your Bilibili video title in Chinese or English' },
      { name: 'Choose Style', text: 'Select from anime, gaming, vlog, or custom styles' },
      { name: 'Generate Cover', text: 'Click generate to create AI-powered cover designs' },
      { name: 'Customize', text: 'Fine-tune colors, text, and elements as needed' },
      { name: 'Download', text: 'Export in perfect 16:10 aspect ratio for Bilibili' }
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
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-full text-pink-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Optimized for B站 Platform
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Bilibili Video Cover Maker
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create eye-catching Bilibili video covers with AI technology. Perfect 16:10 aspect ratio, 
                optimized for anime, gaming, and vlog content on B站.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/${locale}#generator`}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Creating Now
                  </Button>
                </Link>
                <Link href={`/${locale}#pricing`}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-gray-300 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-6 text-lg font-semibold border-2"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">16:10</div>
                  <div className="text-sm text-gray-600">Perfect Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">中文</div>
                  <div className="text-sm text-gray-600">Chinese Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">AI</div>
                  <div className="text-sm text-gray-600">Powered by AI</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">Free</div>
                  <div className="text-sm text-gray-600">No Watermark</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Features Designed for Bilibili Creators
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create professional B站 video covers that drive views
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Anime & ACG Styles
                </h3>
                <p className="text-gray-600">
                  Specialized templates for anime, manga, and gaming content popular on Bilibili
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Bilingual Support
                </h3>
                <p className="text-gray-600">
                  Seamless Chinese and English text support with proper font rendering
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI Enhancement
                </h3>
                <p className="text-gray-600">
                  Smart color matching and composition based on Bilibili trending styles
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Platform Optimized
                </h3>
                <p className="text-gray-600">
                  16:10 aspect ratio with high resolution for perfect Bilibili display
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Trending Elements
                </h3>
                <p className="text-gray-600">
                  Stay updated with latest Bilibili design trends and popular elements
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Copyright Safe
                </h3>
                <p className="text-gray-600">
                  All generated content is original and safe for commercial use
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How to Create Bilibili Covers
              </h2>
              <p className="text-lg text-gray-600">
                Simple steps to create professional B站 video covers
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Enter Your Video Title
                    </h3>
                    <p className="text-gray-600">
                      Type your Bilibili video title in Chinese or English. Our AI understands both languages.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select Content Category
                    </h3>
                    <p className="text-gray-600">
                      Choose from anime, gaming, technology, lifestyle, or education categories for optimized styles.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Generate with AI
                    </h3>
                    <p className="text-gray-600">
                      Let our AI create multiple cover options based on Bilibili's trending design patterns.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Download in HD
                    </h3>
                    <p className="text-gray-600">
                      Export your cover in high resolution, perfectly sized for Bilibili's 16:10 aspect ratio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Create Amazing Bilibili Covers?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of B站 creators using our AI-powered cover maker
            </p>
            <Button 
              size="lg" 
              className="bg-white text-pink-600 hover:bg-gray-100"
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
              Create Your Cover Now
            </Button>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Bilibili Cover Maker?</h2>
              <p>
                Creating compelling video covers for Bilibili (B站) is crucial for attracting viewers in the competitive 
                Chinese video platform ecosystem. Our AI-powered Bilibili cover maker is specifically designed to help 
                content creators produce professional-quality covers that align with platform trends and user preferences.
              </p>
              
              <h3>Understanding Bilibili's Unique Requirements</h3>
              <p>
                Bilibili uses a 16:10 aspect ratio for video covers, different from most Western platforms. Our tool 
                automatically generates covers in this exact ratio, ensuring your content looks perfect on both desktop 
                and mobile views. We also support Chinese typography with proper font rendering and spacing.
              </p>
              
              <h3>Popular Bilibili Content Categories</h3>
              <ul>
                <li><strong>Anime & ACG Content:</strong> Covers with anime-style artwork, vibrant colors, and character illustrations</li>
                <li><strong>Gaming Videos:</strong> Dynamic gaming screenshots with bold text overlays</li>
                <li><strong>Technology Reviews:</strong> Clean, modern designs with product highlights</li>
                <li><strong>Lifestyle Vlogs:</strong> Aesthetic covers with lifestyle photography</li>
                <li><strong>Educational Content:</strong> Clear, informative designs that communicate value</li>
              </ul>
              
              <h3>AI-Powered Design Intelligence</h3>
              <p>
                Our AI analyzes trending Bilibili videos to understand what makes covers successful. It considers factors 
                like color psychology, text placement, visual hierarchy, and cultural preferences specific to Chinese audiences. 
                This ensures your covers not only look professional but also resonate with Bilibili's user base.
              </p>
              
              <h3>Bilingual Content Support</h3>
              <p>
                Whether you're creating content in Chinese, English, or both, our Bilibili cover maker handles multilingual 
                text seamlessly. The AI automatically adjusts font sizes, spacing, and layout to accommodate different 
                languages while maintaining visual balance.
              </p>
              
              <h3>Stay Ahead of Trends</h3>
              <p>
                Bilibili's content trends evolve rapidly. Our AI continuously learns from the platform's latest popular 
                videos, ensuring your covers always feel current and engaging. From seasonal themes to emerging memes, 
                we help you stay relevant in the fast-paced B站 community.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}