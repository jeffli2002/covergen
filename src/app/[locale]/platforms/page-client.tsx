'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Youtube, 
  Music, 
  Camera, 
  Linkedin, 
  MessageSquare,
  Twitch,
  Facebook,
  Twitter,
  Sparkles,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react'
import RednoteIcon from '@/components/icons/RednoteIcon'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'

interface PlatformsHubClientProps {
  locale: Locale
  translations: any
}

const platforms = [
  {
    name: 'YouTube',
    description: 'Create eye-catching thumbnails that boost CTR by 40%',
    icon: Youtube,
    href: '/platforms/youtube',
    color: 'from-red-500 to-red-600',
    stats: '2.7B users',
    keywords: ['thumbnail maker', 'youtube cover', 'video thumbnail']
  },
  {
    name: 'TikTok',
    description: 'Design viral covers for the fastest-growing platform',
    icon: Music,
    href: '/platforms/tiktok',
    color: 'from-black to-gray-800',
    stats: '1.2B users',
    keywords: ['tiktok cover', 'viral design', 'short video cover']
  },
  {
    name: 'Instagram',
    description: 'Perfect square posts and story covers',
    icon: Camera,
    href: '/platforms/instagram',
    color: 'from-purple-500 to-pink-500',
    stats: '2B users',
    keywords: ['instagram post', 'story cover', 'square design']
  },
  {
    name: 'Spotify',
    description: 'Professional album and playlist covers',
    icon: Music,
    href: '/platforms/spotify',
    color: 'from-green-500 to-green-600',
    stats: '551M users',
    keywords: ['album cover', 'playlist art', 'music cover']
  },
  {
    name: 'LinkedIn',
    description: 'Professional covers for business networking',
    icon: Linkedin,
    href: '/platforms/linkedin',
    color: 'from-blue-600 to-blue-700',
    stats: '950M users',
    keywords: ['linkedin banner', 'professional cover', 'business design']
  },
  {
    name: 'Twitch',
    description: 'Gaming-focused stream thumbnails',
    icon: Twitch,
    href: '/platforms/twitch',
    color: 'from-purple-600 to-purple-700',
    stats: '140M users',
    keywords: ['stream thumbnail', 'gaming cover', 'twitch overlay']
  },
  {
    name: 'WeChat',
    description: 'Covers for China\'s super app',
    icon: MessageSquare,
    href: '/platforms/wechat',
    color: 'from-green-600 to-green-700',
    stats: '1.3B users',
    keywords: ['wechat cover', 'moments cover', '微信封面']
  },
  {
    name: 'Rednote',
    description: 'Aesthetic covers for lifestyle content',
    icon: RednoteIcon,
    href: '/platforms/rednote',
    color: 'from-red-500 to-pink-500',
    stats: '300M users',
    keywords: ['rednote cover', 'RED note', '小红书封面']
  }
]

export default function PlatformsHubClient({ locale, translations: t }: PlatformsHubClientProps) {
  const breadcrumbItems = [
    { name: 'Platforms', current: true }
  ]

  return (
    <>
      <BreadcrumbWrapper>
        <Breadcrumb items={breadcrumbItems} />
      </BreadcrumbWrapper>

      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Design for Every Platform
              </div>
              
              <h1 className="text-hero-title text-gray-900 mb-6">
                Cover Makers for All Social Platforms
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create professional covers and thumbnails optimized for every major social media platform. 
                Our AI understands each platform's unique requirements and design trends.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
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
                  Start Creating
                </Button>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-heading-2 text-gray-900">25+</div>
                  <div className="text-sm text-gray-600">Platforms Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-heading-2 text-gray-900">5B+</div>
                  <div className="text-sm text-gray-600">Combined Users</div>
                </div>
                <div className="text-center">
                  <div className="text-heading-2 text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Perfect Dimensions</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platforms Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <Card key={platform.name} className="group hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <Link href={`/${locale}${platform.href}`} className="block">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${platform.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          
                          <h3 className="text-feature-title text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {platform.name}
                          </h3>
                          
                          <p className="text-gray-600 mb-4">
                            {platform.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                              {platform.stats}
                            </span>
                            <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                              →
                            </span>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-section-title text-gray-900 mb-4">
                Why Use Platform-Specific Cover Makers?
              </h2>
              <p className="text-lg text-gray-600">
                Each platform has unique requirements and audience expectations
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-feature-title text-gray-900 mb-2">Perfect Dimensions</h3>
                <p className="text-sm text-gray-600">Each platform requires specific sizes and ratios</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-feature-title text-gray-900 mb-2">Audience Optimization</h3>
                <p className="text-sm text-gray-600">Designs tailored to platform demographics</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-feature-title text-gray-900 mb-2">Trending Styles</h3>
                <p className="text-sm text-gray-600">Stay current with platform-specific trends</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-feature-title text-gray-900 mb-2">Global Reach</h3>
                <p className="text-sm text-gray-600">Support for international platforms</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-section-title text-white mb-4">
              Ready to Create Platform-Perfect Covers?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Choose your platform and start designing in seconds
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
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
              Get Started Free
            </Button>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2>Complete Guide to Social Media Cover Makers</h2>
              <p>
                In today's digital landscape, visual content is king. Whether you're a YouTuber, TikTok creator, 
                Instagram influencer, or LinkedIn professional, having eye-catching covers and thumbnails is 
                essential for standing out in crowded feeds and search results.
              </p>
              
              <h3>Platform-Specific Design Requirements</h3>
              <p>
                Each social media platform has unique technical requirements and aesthetic preferences:
              </p>
              <ul>
                <li><strong>YouTube:</strong> 1280x720 pixels, 16:9 ratio, high contrast for mobile viewing</li>
                <li><strong>TikTok:</strong> 1080x1920 pixels, 9:16 vertical format, dynamic and trendy</li>
                <li><strong>Instagram:</strong> 1080x1080 square posts, 1080x1920 stories</li>
                <li><strong>Spotify:</strong> 300x300 minimum, 3000x3000 recommended for crisp display</li>
                <li><strong>LinkedIn:</strong> 1128x191 banner, professional and clean aesthetic</li>
                <li><strong>Facebook:</strong> 1200x630 for posts, 820x312 for page covers</li>
              </ul>
              
              <h3>The Importance of Platform Optimization</h3>
              <p>
                Using the wrong dimensions or style can severely impact your content's performance. Platform-optimized 
                covers ensure your content looks professional, loads quickly, and displays correctly across all devices. 
                Our AI understands these nuances and automatically adjusts designs for each platform's requirements.
              </p>
              
              <h3>Multi-Platform Content Strategy</h3>
              <p>
                Many creators publish content across multiple platforms. While repurposing content is efficient, 
                using the same cover design everywhere is a mistake. Each platform's audience has different 
                expectations and behaviors. Our platform-specific generators help you maintain brand consistency 
                while optimizing for each platform's unique culture and technical requirements.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}