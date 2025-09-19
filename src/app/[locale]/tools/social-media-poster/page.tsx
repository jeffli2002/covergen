import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Share2, TrendingUp, Heart, MessageCircle, Eye, Star, Wand2, Instagram, Zap, Users, Target } from 'lucide-react'

// Lazy load the tool component
const SocialMediaPosterTool = dynamic(() => import('@/components/tools/SocialMediaPosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Social Media Poster Maker - Create Viral Content | CoverGen Pro',
  description: 'Design eye-catching social media posts with AI. Perfect for Instagram, Facebook, Twitter, LinkedIn. Create content that drives engagement.',
  keywords: 'social media poster maker, instagram post creator, facebook post design, twitter graphic maker, social media content creator',
  openGraph: {
    title: 'Social Media Poster Maker - AI Content Creator | CoverGen Pro',
    description: 'Create stunning social media posts that get noticed. Perfect for all platforms.',
    type: 'website',
  },
}

export default function SocialMediaPosterPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Boost Your Social Presence
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Social Media Poster Maker
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Create scroll-stopping content for all social platforms. 
              Design posts that drive engagement and grow your following.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#generator">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Social Post
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10+</div>
                <div className="text-sm text-white/80">Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">5M+</div>
                <div className="text-sm text-white/80">Posts Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">3x</div>
                <div className="text-sm text-white/80">More Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">Free</div>
                <div className="text-sm text-white/80">No Watermark</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Component */}
      <section className="py-12" id="generator">
        <div className="container mx-auto px-4">
          <SocialMediaPosterTool />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Social Media Features
            </h2>
            <p className="text-lg text-gray-900">
              Tools to maximize your social impact
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Platform Optimized
              </h3>
              <p className="text-gray-900">
                Perfect dimensions for every social network
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Engagement Driven
              </h3>
              <p className="text-gray-900">
                Designs that get likes, shares, and comments
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Brand Consistent
              </h3>
              <p className="text-gray-900">
                Maintain your unique visual identity
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Platforms Ready
              </h3>
              <p className="text-gray-900">
                Instagram, Facebook, Twitter, LinkedIn
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-900">
                Create professional posts in seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Audience Focused
              </h3>
              <p className="text-gray-900">
                Designed to resonate with your followers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Social Media Formats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Social Media Formats
            </h2>
            <p className="text-lg text-gray-900">
              Templates optimized for every platform and content type
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">📷</div>
              <h3 className="font-semibold text-gray-900 mb-2">Instagram Posts</h3>
              <p className="text-sm text-gray-900">Square 1:1, stories, reels</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="font-semibold text-gray-900 mb-2">Facebook Content</h3>
              <p className="text-sm text-gray-900">News feed, cover photos, ads</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🐦</div>
              <h3 className="font-semibold text-gray-900 mb-2">Twitter Graphics</h3>
              <p className="text-sm text-gray-900">Headers, in-feed images</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900 mb-2">LinkedIn Posts</h3>
              <p className="text-sm text-gray-900">Professional content, articles</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎥</div>
              <h3 className="font-semibold text-gray-900 mb-2">YouTube Thumbnails</h3>
              <p className="text-sm text-gray-900">Video previews, channel art</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">📌</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pinterest Pins</h3>
              <p className="text-sm text-gray-900">Vertical designs, boards</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🕺</div>
              <h3 className="font-semibold text-gray-900 mb-2">TikTok Content</h3>
              <p className="text-sm text-gray-900">Vertical videos, covers</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">👻</div>
              <h3 className="font-semibold text-gray-900 mb-2">Snapchat Stories</h3>
              <p className="text-sm text-gray-900">Vertical stories, geofilters</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Go Viral?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Create social media content that stops the scroll and drives engagement
          </p>
          <Link href="#generator">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating Content
            </Button>
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg prose-seo">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Professional Social Media Design That Gets Results</h2>
            <p>
              In today's crowded social media landscape, standing out requires more than just good content – it requires 
              visually compelling posts that capture attention in milliseconds. Our AI-powered social media poster maker 
              helps content creators, businesses, influencers, and marketers design scroll-stopping visuals that drive 
              engagement, increase followers, and build brand awareness across all major platforms.
            </p>
            
            <h3>Optimized for Every Platform's Algorithm</h3>
            <p>
              Each social media platform has unique requirements, audience behaviors, and algorithm preferences. Our tool 
              creates content specifically optimized for Instagram's visual-first feed, Facebook's engagement-focused 
              algorithm, Twitter's fast-paced timeline, LinkedIn's professional network, and TikTok's discovery engine. 
              From aspect ratios to color psychology, every element is designed to perform well on its target platform.
            </p>
            
            <h3>Psychology-Driven Visual Design</h3>
            <p>
              Great social media posts leverage proven psychological triggers to capture and hold attention. Our AI 
              incorporates design principles that work: bold colors that stand out in feeds, strategic text placement 
              that guides the eye, emotional imagery that creates connection, and clear calls-to-action that drive 
              engagement. The result is content that not only looks professional but also converts viewers into followers 
              and followers into customers.
            </p>
            
            <h3>Brand Consistency Across All Platforms</h3>
            <p>
              Successful social media presence requires consistent branding that makes your content instantly recognizable. 
              Our tool helps maintain visual consistency across all platforms while adapting to each platform's unique 
              format requirements. Create templates that can be easily customized for different campaigns while maintaining 
              your brand's distinctive look, colors, fonts, and overall aesthetic.
            </p>
            
            <h3>Content That Drives Business Results</h3>
            <p>
              Social media posts should do more than look good – they should drive measurable business results. Whether 
              you're promoting products, building brand awareness, driving website traffic, or growing your community, 
              our designs incorporate elements that encourage specific actions. From compelling headlines to strategic 
              hashtag placement, every post is designed to align with your broader marketing objectives.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What social media platforms are supported?
                </h3>
                <p className="text-gray-900">
                  We support all major platforms with optimized templates: Instagram (posts, stories, reels), Facebook 
                  (posts, covers, ads), Twitter (posts, headers), LinkedIn (posts, articles), YouTube (thumbnails, 
                  channel art), Pinterest (pins, boards), TikTok (covers), and Snapchat (stories, geofilters).
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I maintain consistent branding across platforms?
                </h3>
                <p className="text-gray-900">
                  Absolutely! Upload your brand colors, fonts, and logos to create consistent templates. Save your 
                  brand kit and apply it across all platforms while automatically adjusting for each platform's 
                  specific requirements. This ensures brand recognition no matter where your content appears.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I create content that gets high engagement?
                </h3>
                <p className="text-gray-900">
                  Our AI creates designs using proven engagement principles: high contrast for visibility, strategic 
                  text placement for readability, emotional color psychology, clear calls-to-action, and platform-specific 
                  optimization. We also provide trending style options based on current social media design trends.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I create content for different campaign types?
                </h3>
                <p className="text-gray-900">
                  Yes! Whether you're running product launches, seasonal campaigns, educational content, promotional 
                  offers, or community building initiatives, our tool provides templates and AI generation options 
                  tailored to each campaign type and objective.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How quickly can I create social media content?
                </h3>
                <p className="text-gray-900">
                  Most users create professional social media posts in under 30 seconds. Simply describe your content, 
                  select your platform and style preferences, and our AI generates multiple options instantly. Perfect 
                  for content creators who need to maintain consistent posting schedules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}