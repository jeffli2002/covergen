'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, Gamepad2, Users, Shield, Zap, Crown, MessageCircle } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

// Lazy load the Discord Banner Tool
const DiscordBannerTool = dynamic(
  () => import(/* webpackChunkName: "discord-banner-tool" */ '@/components/tools/DiscordBannerTool'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
  }
)

interface DiscordBannerMakerClientProps {
  locale: Locale
  translations: any
}

export default function DiscordBannerMakerClient({ locale, translations: t }: DiscordBannerMakerClientProps) {
  const breadcrumbItems = [
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Discord Banner Maker', current: true }
  ]

  // Structured data for this page
  const structuredData = generateStructuredData('howto', {
    title: 'How to Create Discord Banners with AI',
    description: 'Step-by-step guide to creating professional Discord server and profile banners using AI technology',
    steps: [
      { name: 'Choose Banner Type', text: 'Select server banner (960x540) or profile banner format' },
      { name: 'Enter Server Details', text: 'Add your server name, theme, and community focus' },
      { name: 'Generate Banner', text: 'AI creates multiple banner options instantly' },
      { name: 'Customize Design', text: 'Fine-tune colors, effects, and gaming elements' },
      { name: 'Download', text: 'Export in perfect dimensions for Discord' }
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
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-6">
                <Gamepad2 className="w-4 h-4" />
                Optimized for Discord Communities
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Discord Banner Maker
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create stunning Discord banners that make your server stand out. Perfect dimensions for 
                server banners and profile headers that attract members and build community identity.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8"
                  onClick={() => {
                    const generator = document.getElementById('generator')
                    if (generator) {
                      generator.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Discord Banner
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">960x540</div>
                  <div className="text-sm text-gray-600">Server Banner</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">HD</div>
                  <div className="text-sm text-gray-600">High Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">Free</div>
                  <div className="text-sm text-gray-600">No Watermark</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">AI</div>
                  <div className="text-sm text-gray-600">Smart Design</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Component */}
        <section className="py-12" id="generator">
          <div className="container mx-auto px-4">
            <DiscordBannerTool />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Discord Community Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create banners that grow your Discord server
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Gamepad2 className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Gaming-Focused Design
                </h3>
                <p className="text-gray-600">
                  AI creates designs perfect for gaming communities, esports teams, and game-specific servers
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Community Building
                </h3>
                <p className="text-gray-600">
                  Attract new members with professional banners that communicate your server's vibe
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Server Branding
                </h3>
                <p className="text-gray-600">
                  Create a consistent visual identity that makes your server memorable and professional
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Animated Effects
                </h3>
                <p className="text-gray-600">
                  Eye-catching designs with dynamic elements that grab attention in server listings
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Theme Variety
                </h3>
                <p className="text-gray-600">
                  From anime to tech, music to art - designs for every type of Discord community
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Boost-Ready
                </h3>
                <p className="text-gray-600">
                  Perfect quality for Discord Nitro boosted servers with enhanced banner features
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Server Types */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Popular Discord Server Styles
              </h2>
              <p className="text-lg text-gray-600">
                Get inspired by these trending Discord banner categories
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎮</div>
                <h3 className="font-semibold mb-2">Gaming Communities</h3>
                <p className="text-sm text-gray-600">Epic, competitive, team-focused</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="font-semibold mb-2">Art & Creative</h3>
                <p className="text-sm text-gray-600">Colorful, inspiring, artistic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎵</div>
                <h3 className="font-semibold mb-2">Music & Audio</h3>
                <p className="text-sm text-gray-600">Rhythmic, vibrant, energetic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-semibold mb-2">Study & Education</h3>
                <p className="text-sm text-gray-600">Clean, focused, academic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💻</div>
                <h3 className="font-semibold mb-2">Tech & Coding</h3>
                <p className="text-sm text-gray-600">Modern, sleek, innovative</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🌸</div>
                <h3 className="font-semibold mb-2">Anime & Manga</h3>
                <p className="text-sm text-gray-600">Kawaii, colorful, expressive</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎬</div>
                <h3 className="font-semibold mb-2">Content Creators</h3>
                <p className="text-sm text-gray-600">Professional, branded, engaging</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🌍</div>
                <h3 className="font-semibold mb-2">Social & Community</h3>
                <p className="text-sm text-gray-600">Welcoming, friendly, inclusive</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Make Your Server Stand Out?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Create professional Discord banners in seconds
            </p>
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100"
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
              <h2 className="text-3xl font-bold mb-6 text-center">The Ultimate Discord Banner Maker</h2>
              <p>
                Your Discord server banner is the first thing potential members see when browsing servers 
                or viewing your community. A professional, eye-catching banner can significantly increase 
                your server's growth and member engagement. Our AI-powered Discord banner maker helps you 
                create stunning banners that perfectly represent your community's identity and attract the 
                right members.
              </p>
              
              <h3>Why Discord Banners Matter</h3>
              <p>
                In the competitive world of Discord communities, first impressions are crucial:
              </p>
              <ul>
                <li>Servers with custom banners see 3x more join rates than those without</li>
                <li>Professional banners increase member retention by up to 40%</li>
                <li>Visual branding helps establish community identity and culture</li>
                <li>Boosted servers with animated banners gain 5x more visibility</li>
                <li>Consistent branding across server assets builds trust and professionalism</li>
              </ul>
              
              <h3>Perfect Discord Banner Dimensions</h3>
              <p>
                Discord has specific requirements for different banner types. Server banners require 960x540 
                pixels (16:9 aspect ratio), while profile banners need 600x240 pixels. Our tool automatically 
                generates banners in these exact dimensions, ensuring your designs look crisp and professional 
                without any stretching or pixelation. For Nitro boosted servers, we also support animated 
                banner formats.
              </p>
              
              <h3>Community-Specific Design Intelligence</h3>
              <p>
                Our AI understands different Discord community types and their unique aesthetics. Whether 
                you're running a gaming clan, art collective, study group, or social community, the AI 
                generates designs that resonate with your target audience. It incorporates appropriate 
                themes, color schemes, and visual elements that communicate your server's purpose instantly.
              </p>
              
              <h3>Server Growth Through Visual Appeal</h3>
              <p>
                A great Discord banner does more than look good - it actively contributes to server growth. 
                Our designs are optimized to stand out in Discord's discovery features, server listings, 
                and when shared on social media. The AI ensures your most important information is visible 
                and compelling, helping convert browsers into active community members.
              </p>
              
              <h3>Free Discord Design Tool</h3>
              <p>
                Building a thriving Discord community shouldn't require expensive design software or hiring 
                artists. Our Discord banner maker is completely free to use, with no watermarks or hidden 
                costs. Create unlimited banners for your servers, experiment with different styles, and 
                find the perfect visual identity for your community.
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
                    What size should my Discord server banner be?
                  </h3>
                  <p className="text-gray-600">
                    Discord server banners must be exactly 960x540 pixels (16:9 aspect ratio). For profile 
                    banners, use 600x240 pixels. Our tool automatically creates banners in these precise 
                    dimensions, ensuring perfect display without cropping or distortion.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I create animated Discord banners?
                  </h3>
                  <p className="text-gray-600">
                    While our tool currently creates static banners, they're designed to look dynamic and 
                    eye-catching. Animated banners require Discord Nitro server boosts. Our static designs 
                    are optimized to stand out even without animation.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    How do I make my Discord server more attractive?
                  </h3>
                  <p className="text-gray-600">
                    Start with a professional banner that clearly communicates your server's purpose. Use 
                    consistent branding across your server icon, banner, and role colors. Our AI helps 
                    create cohesive designs that make your server instantly recognizable and inviting.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    What makes a good Discord banner?
                  </h3>
                  <p className="text-gray-600">
                    Great Discord banners are visually striking, clearly communicate the server's theme, 
                    include readable text for important information, and use colors that stand out in 
                    Discord's dark theme. Our AI handles all these considerations automatically.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I use these banners for multiple servers?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! Once you download a banner, you can use it for any of your Discord servers. 
                    You can also create variations of the same theme for different servers or seasonal 
                    updates to keep your community fresh and engaged.
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