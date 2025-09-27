'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, Instagram, Users, Image, Camera, Play, Shield } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

// Lazy load the Instagram Thumbnail Tool
const InstagramThumbnailTool = dynamic(
  () => import(/* webpackChunkName: "instagram-thumbnail-tool" */ '@/components/tools/InstagramThumbnailTool'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
  }
)

interface InstagramThumbnailMakerClientProps {
  locale: Locale
  translations: any
}

export default function InstagramThumbnailMakerClient({ locale, translations: t }: InstagramThumbnailMakerClientProps) {
  const breadcrumbItems = [
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Instagram Thumbnail Maker', current: true }
  ]

  // Structured data for this page
  const structuredData = generateStructuredData('howto', {
    title: 'How to Create Instagram Thumbnails with AI',
    description: 'Step-by-step guide to creating professional Instagram thumbnails using AI technology',
    steps: [
      { name: 'Choose Instagram Format', text: 'Select Reels (9:16), Feed (1:1), or Stories format' },
      { name: 'Enter Content Details', text: 'Type your post title, description, and style preferences' },
      { name: 'Generate Thumbnail', text: 'AI creates multiple thumbnail options instantly' },
      { name: 'Customize Design', text: 'Fine-tune colors, text, and visual elements' },
      { name: 'Download', text: 'Export in perfect dimensions for Instagram' }
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
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full text-purple-700 text-sm font-medium mb-6">
                <Instagram className="w-4 h-4" />
                Optimized for Instagram
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Instagram Thumbnail Maker
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create eye-catching thumbnails for Reels, Feed posts, and Stories. Use AI to design 
                thumbnails that stop scrollers and boost your engagement rate.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                  onClick={() => {
                    const generator = document.getElementById('generator')
                    if (generator) {
                      generator.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Instagram Thumbnail
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">9:16</div>
                  <div className="text-sm text-gray-600">Reels Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">1:1</div>
                  <div className="text-sm text-gray-600">Feed Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">HD</div>
                  <div className="text-sm text-gray-600">High Quality</div>
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
            <InstagramThumbnailTool />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Instagram-Optimized Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create thumbnails that perform on Instagram
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Reels Optimization
                </h3>
                <p className="text-gray-600">
                  Perfect 9:16 vertical format for Reels with eye-catching designs that boost play rates
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Image className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Feed-Perfect Squares
                </h3>
                <p className="text-gray-600">
                  1:1 square thumbnails that look stunning in your feed grid and carousel posts
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Story Highlights
                </h3>
                <p className="text-gray-600">
                  Create cohesive story highlight covers that enhance your profile aesthetic
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Algorithm-Friendly
                </h3>
                <p className="text-gray-600">
                  Designs optimized for Instagram's algorithm to maximize reach and engagement
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Instagram className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Trending Styles
                </h3>
                <p className="text-gray-600">
                  Stay current with Instagram's latest design trends and aesthetic preferences
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Brand Consistency
                </h3>
                <p className="text-gray-600">
                  Maintain your visual identity across all Instagram content formats
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Content Types */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Popular Instagram Content Styles
              </h2>
              <p className="text-lg text-gray-600">
                Get inspired by these trending Instagram thumbnail categories
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">👗</div>
                <h3 className="font-semibold mb-2">Fashion & Outfit</h3>
                <p className="text-sm text-gray-600">Stylish, trendy, aesthetic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🍕</div>
                <h3 className="font-semibold mb-2">Food & Recipe</h3>
                <p className="text-sm text-gray-600">Appetizing, vibrant, mouth-watering</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💪</div>
                <h3 className="font-semibold mb-2">Fitness & Health</h3>
                <p className="text-sm text-gray-600">Motivational, energetic, inspiring</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">✈️</div>
                <h3 className="font-semibold mb-2">Travel & Adventure</h3>
                <p className="text-sm text-gray-600">Wanderlust, scenic, captivating</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💄</div>
                <h3 className="font-semibold mb-2">Beauty & Makeup</h3>
                <p className="text-sm text-gray-600">Glamorous, tutorial, transformative</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="font-semibold mb-2">Home & DIY</h3>
                <p className="text-sm text-gray-600">Creative, cozy, inspirational</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="font-semibold mb-2">Art & Design</h3>
                <p className="text-sm text-gray-600">Creative, aesthetic, eye-catching</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-semibold mb-2">Educational</h3>
                <p className="text-sm text-gray-600">Informative, clear, engaging</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Create Scroll-Stopping Thumbnails?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Design Instagram thumbnails that drive engagement in seconds
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => {
                const generator = document.getElementById('generator')
                if (generator) {
                  generator.scrollIntoView({ behavior: 'smooth' })
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
              <h2 className="text-3xl font-bold mb-6 text-center">The Ultimate Instagram Thumbnail Maker</h2>
              <p>
                In the fast-paced world of Instagram, your thumbnail is your first impression. Whether 
                it's a Reel cover, feed post preview, or story highlight, a compelling thumbnail can 
                make the difference between a scroll-past and a click. Our AI-powered Instagram thumbnail 
                maker helps you create professional, engaging thumbnails that stop thumbs and drive engagement.
              </p>
              
              <h3>Why Instagram Thumbnails Matter</h3>
              <p>
                Instagram's algorithm prioritizes content that generates engagement. Your thumbnail directly impacts:
              </p>
              <ul>
                <li>Click-through rates on Reels and IGTV videos</li>
                <li>Profile aesthetic and brand consistency</li>
                <li>Story highlight organization and appeal</li>
                <li>Feed grid visual harmony</li>
                <li>Overall content discoverability</li>
              </ul>
              
              <h3>Perfect Instagram Dimensions</h3>
              <p>
                Instagram supports various content formats, each with optimal dimensions:
              </p>
              <ul>
                <li><strong>Reels & IGTV:</strong> 9:16 aspect ratio (1080x1920 pixels)</li>
                <li><strong>Feed Posts:</strong> 1:1 square (1080x1080 pixels)</li>
                <li><strong>Stories:</strong> 9:16 vertical (1080x1920 pixels)</li>
                <li><strong>Carousels:</strong> Can mix square and portrait formats</li>
              </ul>
              <p>
                Our tool automatically generates thumbnails in these exact dimensions, ensuring your 
                content looks perfect across all Instagram placements.
              </p>
              
              <h3>AI-Powered Design Intelligence</h3>
              <p>
                Our AI understands Instagram's visual language. It analyzes trending content styles, 
                color psychology, and engagement patterns to create thumbnails that resonate with your 
                audience. Whether you're creating content for fashion, food, fitness, or any other niche, 
                the AI adapts its design approach to match your content category and target demographic.
              </p>
              
              <h3>Mobile-First Thumbnail Design</h3>
              <p>
                With 98% of Instagram users accessing the platform via mobile, your thumbnails must be 
                optimized for small screens. Our designs ensure text remains readable, visual elements 
                are clear, and the overall impact isn't lost on mobile devices. This mobile-first approach 
                maximizes your content's appeal and accessibility.
              </p>
              
              <h3>Free Instagram Marketing Tool</h3>
              <p>
                Professional Instagram marketing shouldn't require expensive design software or hiring 
                designers. Our Instagram thumbnail maker is completely free to use, with no watermarks 
                or hidden costs. Create unlimited thumbnails for all your Instagram content, whether 
                you're an influencer, business owner, or casual creator looking to improve your Instagram presence.
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
                    What size should my Instagram Reels thumbnail be?
                  </h3>
                  <p className="text-gray-600">
                    Instagram Reels use a 9:16 aspect ratio (1080x1920 pixels). Our tool automatically 
                    creates thumbnails in this exact size, ensuring your Reels covers look perfect and 
                    professional without any cropping issues.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I create thumbnails for Instagram carousel posts?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! Our tool supports all Instagram formats including carousel posts. You can 
                    create cohesive thumbnails for multi-image posts, ensuring your carousel tells a 
                    visually compelling story from the first slide.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    How do I make my thumbnails stand out in the Instagram feed?
                  </h3>
                  <p className="text-gray-600">
                    Use high contrast, bold colors, and clear focal points. Our AI creates thumbnails 
                    with optimal visual hierarchy, ensuring your content catches attention even in a 
                    crowded feed. Include faces when possible, as they naturally draw more engagement.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I maintain brand consistency across all my thumbnails?
                  </h3>
                  <p className="text-gray-600">
                    Yes! You can specify your brand colors, style preferences, and visual themes. The AI 
                    will incorporate these elements while creating thumbnails, helping you maintain a 
                    cohesive Instagram aesthetic that strengthens your brand identity.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Do the thumbnails work for Instagram Story Highlights?
                  </h3>
                  <p className="text-gray-600">
                    Yes, our tool is perfect for creating Instagram Story Highlight covers. You can design 
                    matching covers for all your highlights, creating an organized and professional-looking 
                    profile that encourages visitors to explore your content.
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