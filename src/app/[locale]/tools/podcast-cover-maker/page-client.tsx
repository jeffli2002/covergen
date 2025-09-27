'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, Mic, Radio, Headphones, Palette, Download, Shield } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

// Lazy load the Podcast Cover Maker Tool
const PodcastCoverMakerTool = dynamic(
  () => import(/* webpackChunkName: "podcast-cover-maker-tool" */ '@/components/tools/PodcastCoverMakerTool'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
  }
)

interface PodcastCoverMakerClientProps {
  locale: Locale
  translations: any
}

export default function PodcastCoverMakerClient({ locale, translations: t }: PodcastCoverMakerClientProps) {
  const breadcrumbItems = [
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Podcast Cover Maker', current: true }
  ]

  // Structured data for this page
  const structuredData = generateStructuredData('howto', {
    title: 'How to Create Podcast Covers with AI',
    description: 'Step-by-step guide to creating professional podcast covers using AI technology',
    steps: [
      { name: 'Enter Podcast Details', text: 'Type your podcast name and description' },
      { name: 'Choose Genre', text: 'Select from various podcast genre templates' },
      { name: 'Generate Cover', text: 'AI creates multiple cover options instantly' },
      { name: 'Customize Design', text: 'Fine-tune colors, fonts, and layout' },
      { name: 'Download', text: 'Export in perfect 3000x3000 pixels for all platforms' }
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
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full text-purple-700 text-sm font-medium mb-6">
                <Mic className="w-4 h-4" />
                Optimized for All Podcast Platforms
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Podcast Cover Maker
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create professional podcast covers that attract listeners. Perfect 3000x3000 pixel 
                artwork that meets Apple Podcasts, Spotify, and all platform requirements.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8"
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
                  Create Podcast Cover
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">3000x3000</div>
                  <div className="text-sm text-gray-600">Perfect Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">HD</div>
                  <div className="text-sm text-gray-600">High Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">Free</div>
                  <div className="text-sm text-gray-600">No Watermark</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">AI</div>
                  <div className="text-sm text-gray-600">Smart Design</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Component */}
        <section className="py-12" id="generator">
          <div className="container mx-auto px-4">
            <PodcastCoverMakerTool />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Podcast Marketing Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create podcast covers that attract listeners
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Radio className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Platform-Perfect Sizing
                </h3>
                <p className="text-gray-600">
                  Automatic 3000x3000 pixels for Apple Podcasts, Spotify, and all major platforms
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Genre-Specific Design
                </h3>
                <p className="text-gray-600">
                  AI understands podcast genres and creates designs that resonate with your audience
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Brand Consistency
                </h3>
                <p className="text-gray-600">
                  Maintain visual identity across episodes with consistent styling options
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Headphones className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Audience Targeting
                </h3>
                <p className="text-gray-600">
                  Designs optimized to attract your specific podcast audience demographic
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  High Resolution Export
                </h3>
                <p className="text-gray-600">
                  Crystal clear quality that meets all platform specifications and requirements
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Platform Compliance
                </h3>
                <p className="text-gray-600">
                  Automatically follows all major platform guidelines and content policies
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Podcast Types */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Popular Podcast Cover Styles
              </h2>
              <p className="text-lg text-gray-600">
                Get inspired by these trending podcast categories
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💼</div>
                <h3 className="font-semibold mb-2">Business & Finance</h3>
                <p className="text-sm text-gray-600">Professional, trustworthy, corporate</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎭</div>
                <h3 className="font-semibold mb-2">True Crime</h3>
                <p className="text-sm text-gray-600">Dark, mysterious, compelling</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">😄</div>
                <h3 className="font-semibold mb-2">Comedy</h3>
                <p className="text-sm text-gray-600">Bright, fun, energetic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-semibold mb-2">Education</h3>
                <p className="text-sm text-gray-600">Clear, informative, academic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💚</div>
                <h3 className="font-semibold mb-2">Health & Wellness</h3>
                <p className="text-sm text-gray-600">Calming, natural, inspiring</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-semibold mb-2">Technology</h3>
                <p className="text-sm text-gray-600">Modern, sleek, futuristic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎵</div>
                <h3 className="font-semibold mb-2">Music & Arts</h3>
                <p className="text-sm text-gray-600">Creative, vibrant, artistic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🏈</div>
                <h3 className="font-semibold mb-2">Sports</h3>
                <p className="text-sm text-gray-600">Dynamic, competitive, bold</p>
              </div>
            </div>
          </div>
        </section>



        {/* CTA Section */}
        <section className="cta-section py-20 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Launch Your Podcast with Style?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Create professional podcast covers in seconds
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
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
              <h2 className="text-3xl font-bold mb-6 text-center">The Ultimate Podcast Cover Maker</h2>
              <p>
                Creating a professional podcast cover is crucial for success in the competitive podcasting 
                landscape. Your cover art is often the first thing potential listeners see when browsing 
                podcast directories, and it can make or break their decision to hit play. Our AI-powered 
                podcast cover maker helps you design stunning, platform-compliant artwork that attracts 
                listeners and grows your audience.
              </p>
              
              <h3>Why Podcast Cover Art Matters</h3>
              <p>
                In podcast directories filled with thousands of shows, your cover art serves as your primary 
                marketing tool. A compelling podcast cover can:
              </p>
              <ul>
                <li>Increase discovery rates in podcast app searches</li>
                <li>Communicate your podcast's genre and tone instantly</li>
                <li>Build credibility and professionalism</li>
                <li>Improve click-through rates by up to 47%</li>
                <li>Create memorable brand recognition</li>
              </ul>
              
              <h3>Perfect Podcast Cover Dimensions</h3>
              <p>
                All major podcast platforms require square artwork with specific dimensions. Apple Podcasts 
                mandates a minimum of 1400x1400 pixels, but we recommend 3000x3000 pixels for optimal 
                quality across all platforms. Our tool automatically generates covers at this perfect size, 
                ensuring your artwork looks crisp on every device from smartphones to high-resolution displays.
              </p>
              
              <h3>Genre-Specific Design Intelligence</h3>
              <p>
                Different podcast genres attract different audiences with distinct visual preferences. A true 
                crime podcast needs dark, mysterious aesthetics, while a comedy show benefits from bright, 
                playful designs. Our AI understands these nuances and creates covers that resonate with your 
                target listeners, increasing the likelihood they'll give your show a chance.
              </p>
              
              <h3>Platform Compliance Guaranteed</h3>
              <p>
                Each podcast platform has specific requirements beyond dimensions. Apple Podcasts prohibits 
                explicit imagery, requires readable text at small sizes, and favors high contrast designs. 
                Spotify has similar guidelines with additional considerations for mobile display. Our tool 
                ensures your cover meets all platform requirements automatically, preventing rejection and 
                maximizing visibility.
              </p>
              
              <h3>Free Professional Design Tool</h3>
              <p>
                Unlike expensive design software or hiring graphic designers, our podcast cover maker is 
                completely free. Create unlimited professional covers without watermarks, subscriptions, or 
                hidden fees. Whether you're launching your first podcast or refreshing an established show's 
                branding, professional cover art should be accessible to every podcaster.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    What size should my podcast cover be?
                  </h3>
                  <p className="text-gray-600">
                    The recommended size is 3000x3000 pixels. This exceeds all platform requirements and 
                    ensures your cover looks sharp on every device. Our tool automatically creates covers 
                    at this optimal size.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I use the same cover for all podcast platforms?
                  </h3>
                  <p className="text-gray-600">
                    Yes! A 3000x3000 pixel JPG or PNG works perfectly for Apple Podcasts, Spotify, Google 
                    Podcasts, and all other major platforms. We ensure your cover meets universal standards 
                    so you only need one version.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    How do I make my podcast cover stand out?
                  </h3>
                  <p className="text-gray-600">
                    Use bold, readable text for your podcast name, choose colors that contrast well, keep 
                    the design simple but eye-catching, and ensure it looks good at small thumbnail sizes. 
                    Our AI automatically optimizes for these factors.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Should I update my podcast cover design?
                  </h3>
                  <p className="text-gray-600">
                    Your main podcast cover should remain consistent for brand recognition. However, you can 
                    create special covers for seasons, limited series, or special episodes while maintaining 
                    your core visual identity.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    What file format should I use for my podcast cover?
                  </h3>
                  <p className="text-gray-600">
                    Most platforms accept both JPG and PNG formats. JPG is recommended for photographic 
                    images and complex artwork, while PNG is better for designs with text and solid colors. 
                    Our tool exports in both formats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}