'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/header'
import MobileHeader from '@/components/mobile-header'
import ImageGenerator from '@/components/image-generator'
import PricingSection from '@/components/pricing-section'
import FeedbackModal from '@/components/feedback-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { useAnalytics } from '@/lib/analytics'
import { 
  Sparkles, 
  Zap, 
  Globe, 
  Shield,
  Youtube,
  Twitch,
  Music,
  MessageSquare,
  Instagram,
  Facebook,
  Linkedin,
  // Add more platform icons as needed
} from 'lucide-react'

const platformIcons = [
  { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { name: 'Twitch', icon: Twitch, color: 'text-purple-500' },
  { name: 'TikTok', icon: MessageSquare, color: 'text-black' },
  { name: 'Spotify', icon: Music, color: 'text-green-500' },
  { name: 'Bilibili', icon: Globe, color: 'text-sky-500' },
  { name: 'Xiaohongshu', icon: Sparkles, color: 'text-rose-500' },
]

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Advanced AI creates multiple cover options in seconds, maintaining your brand consistency'
  },
  {
    icon: Globe,
    title: 'Multi-Platform Support',
    description: 'Optimized for YouTube, Instagram, Facebook, LinkedIn, TikTok, Spotify, and 10+ platforms'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate professional covers in under 10 seconds with our optimized AI pipeline'
  },
  {
    icon: Shield,
    title: 'Compliant & Safe',
    description: 'All AI-generated content includes watermarks for transparency and regulation compliance'
  }
]

export default function HomePage() {
  const { currentTask, user } = useAppStore()
  const { trackPageView, trackInteraction, getVariant } = useAnalytics()
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; context: 'generation' | 'result' | 'general' }>({
    isOpen: false,
    context: 'general'
  })

  // Track page view and A/B test variants
  useEffect(() => {
    trackPageView('homepage', user?.id)
    
    // Show feedback modal after user completes first generation
    if (currentTask?.status === 'completed' && !localStorage.getItem('feedback_shown')) {
      setTimeout(() => {
        setFeedbackModal({ isOpen: true, context: 'result' })
        localStorage.setItem('feedback_shown', 'true')
      }, 2000)
    }
  }, [trackPageView, user?.id, currentTask])

  // A/B test for CTA button text
  const ctaVariant = getVariant('homepage_cta', user?.id)
  const ctaTexts = {
    'Get Started Free': 'Start Free - No Login Required',
    'Create Your First Cover': 'Create Free Cover Now',
    'Start Generating': 'Generate Free - No Sign Up'
  }
  const ctaText = ctaTexts[ctaVariant as keyof typeof ctaTexts] || 'Start Free - No Login Required'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-6 md:mb-8 text-gray-900 leading-tight">
                Create Stunning Covers with{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">AI Magic</span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto px-4 font-medium leading-relaxed">
                Generate professional covers and posters for your content across all platforms. 
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-semibold">Save 70% of your time</span> while maintaining perfect brand consistency.
              </p>
              
              {/* Free generation highlight */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl px-6 py-4 mb-8 max-w-3xl mx-auto border border-green-200">
                <p className="text-lg md:text-xl font-semibold text-green-800">
                  🎉 <span className="underline decoration-2 decoration-green-400">100% FREE Generation</span> • No Sign-in Required • Unlimited Creativity
                </p>
              </div>
              
              {/* Use cases */}
              <div className="text-base md:text-lg text-gray-600 mb-8 max-w-4xl mx-auto px-4">
                <p className="font-medium mb-2">Perfect for creating:</p>
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">📱 Social Media Covers</span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">🎨 Marketing Posters</span>
                  <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full font-medium">📢 Ad Campaigns</span>
                  <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-medium">✨ Lifestyle Content</span>
                  <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-full font-medium">🎯 Product Launches</span>
                </div>
              </div>
              
              {/* Platform Icons */}
              <div className="flex justify-center gap-6 md:gap-8 lg:gap-12 mb-12 md:mb-16 flex-wrap px-4">
                {platformIcons.map((platform) => (
                  <div key={platform.name} className="flex flex-col items-center gap-2 md:gap-3 group">
                    <div className="p-3 md:p-4 lg:p-5 rounded-3xl bg-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 border border-gray-100">
                      <platform.icon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-gray-700" />
                    </div>
                    <span className="text-sm md:text-base lg:text-lg font-medium text-gray-700">{platform.name}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="text-xl md:text-2xl px-12 py-8 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
                onClick={() => {
                  trackInteraction('homepage_cta', 'click', undefined)
                  document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                {ctaText}
              </Button>
            </div>
          </div>
        </section>

        {/* Generation Section */}
        <section id="generator" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <ImageGenerator />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">Why Choose CoverGen AI?</h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
                Built for content creators who want <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">professional results</span> without the complexity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              {features.map((feature, index) => (
                <Card key={feature.title} className="text-center hover:scale-105 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-lg bg-white group hover:-translate-y-2 rounded-3xl">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className={`p-4 rounded-3xl ${
                        index === 0 ? 'bg-gradient-to-br from-orange-100 to-red-100' :
                        index === 1 ? 'bg-gradient-to-br from-blue-100 to-purple-100' :
                        index === 2 ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                        'bg-gradient-to-br from-purple-100 to-pink-100'
                      } group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className={`w-8 h-8 ${
                          index === 0 ? 'text-orange-600' :
                          index === 1 ? 'text-blue-600' :
                          index === 2 ? 'text-green-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                    <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900 relative overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">10s</div>
                <div className="text-lg md:text-xl font-medium text-gray-600">Average Generation Time</div>
              </div>
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">8+</div>
                <div className="text-lg md:text-xl font-medium text-gray-600">Platforms Supported</div>
              </div>
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">99.9%</div>
                <div className="text-lg md:text-xl font-medium text-gray-600">Uptime SLA</div>
              </div>
              <div className="group hover:-translate-y-2 transition-all duration-300">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">70%</div>
                <div className="text-lg md:text-xl font-medium text-gray-600">Time Savings</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to know about CoverGen AI. Can't find the answer you're looking for? 
                <a href="mailto:jefflee2002@gmail.com" className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 hover:underline ml-1">Contact us</a>.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  How does AI cover generation work?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI analyzes your reference image and prompt to understand the style, composition, and requirements. 
                  It then generates a new cover image that matches your selected platform's dimensions while maintaining 
                  visual consistency and professional quality.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Which social media platforms are supported?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We support all major platforms including YouTube, TikTok, Instagram, Twitter, LinkedIn, Facebook, 
                  and more. Each platform has optimized dimensions and design guidelines built-in.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  What's the difference between free and Pro plans?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Free users get 3 generations per day with standard quality. Pro users get unlimited generations, 
                  higher resolution outputs, priority processing, and commercial usage rights.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Can I use the generated images commercially?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Free users have limited usage rights. Pro+ subscribers get full commercial usage rights for 
                  all generated images, perfect for business and marketing purposes.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  How long does image generation take?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Most images are generated within 10-30 seconds. Generation time depends on complexity and 
                  current server load. Pro users get priority processing for faster results.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Is my content safe and private?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! We take privacy seriously. Your reference images are processed securely and deleted 
                  after generation. We never store or share your content with third parties.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                What Creators Are Saying
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of satisfied creators who've transformed their content with AI-powered covers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    S
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah Chen</h4>
                    <p className="text-sm text-gray-600">YouTube Creator</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  "CoverGen AI has completely transformed my workflow. I used to spend hours designing thumbnails, 
                  now I get professional covers in minutes. My click-through rates have improved by 40%!"
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    M
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mike Rodriguez</h4>
                    <p className="text-sm text-gray-600">TikTok Influencer</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  "The platform-specific optimization is incredible. My TikTok covers now look perfect every time, 
                  and the AI understands exactly what makes content engaging for each platform."
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    E
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Emma Wilson</h4>
                    <p className="text-sm text-gray-600">Instagram Business</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  "As a small business owner, I can't afford a designer. CoverGen AI gives me professional-quality 
                  covers that match my brand perfectly. It's like having a designer on demand!"
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    D
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">David Kim</h4>
                    <p className="text-sm text-gray-600">Podcast Host</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  "The consistency across all my podcast covers is amazing. Each episode looks professional 
                  and maintains my brand identity. My audience immediately recognizes my content now."
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 5 */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    L
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Lisa Thompson</h4>
                    <p className="text-sm text-gray-600">LinkedIn Professional</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  "Professional networking requires consistent branding. CoverGen AI helps me create 
                  LinkedIn covers that reflect my expertise and attract the right opportunities."
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 6 */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    A
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Alex Johnson</h4>
                    <p className="text-sm text-gray-600">Marketing Agency</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  "We use CoverGen AI for all our client campaigns. The quality and speed allow us to 
                  deliver results faster than ever. Our clients love the professional look!"
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA for Testimonials */}
            <div className="text-center mt-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  trackInteraction('testimonials_cta', 'click', user?.id)
                  document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Start Creating Amazing Covers
              </Button>
              <p className="text-gray-600 mt-4">
                Join thousands of satisfied creators today
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing">
          <PricingSection />
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Ready to Transform Your Content?</h2>
            <p className="text-xl md:text-2xl mb-12 text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
              Join thousands of creators who save <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold">hours every week</span> with AI-powered cover generation
            </p>
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              <Button 
                size="lg" 
                className="text-xl px-12 py-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
                onClick={() => {
                  trackInteraction('bottom_cta', 'click', user?.id)
                  document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Sparkles className="w-6 h-6 mr-3" />
                {ctaText}
              </Button>
              
              <Button 
                size="lg" 
                className="text-xl px-10 py-8 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-3xl font-semibold transform hover:scale-105 transition-all duration-300"
                onClick={() => {
                  setFeedbackModal({ isOpen: true, context: 'general' })
                  trackInteraction('feedback_button', 'click', user?.id)
                }}
              >
                <MessageSquare className="w-6 h-6 mr-3" />
                Share Feedback
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t bg-background">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div>
                          <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CoverGen AI</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              AI-powered cover generation for creators. Transform your content with intelligent design.
            </p>
              <div className="flex gap-4">
                <a href="https://twitter.com/jeffli2002" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 hover:bg-blue-200 rounded-2xl transition-all duration-300 hover:scale-110">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="mailto:jefflee2002@gmail.com" className="p-2 bg-green-100 hover:bg-green-200 rounded-2xl transition-all duration-300 hover:scale-110">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
              </div>
              

            </div>


          </div>

          {/* Product, Resources, Legal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-base text-gray-600">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="/tutorials" className="hover:text-blue-600 transition-colors">Tutorials</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-3 text-base text-gray-600">
                <li><a href="/help" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="/blog" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="/community" className="hover:text-blue-600 transition-colors">Community</a></li>
                <li><a href="/feedback" className="hover:text-blue-600 transition-colors">Feature Requests</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-base text-gray-600">
                <li><a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-blue-600 transition-colors">Cookie Policy</a></li>
                <li><a href="/accessibility" className="hover:text-blue-600 transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>



          {/* Bottom Footer */}
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>&copy; 2025 CoverGen AI. All rights reserved.</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Made with ❤️ for creators worldwide</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <a href="/sitemap.xml" className="hover:text-blue-600 transition-colors">Sitemap</a>
                <a href="/accessibility" className="hover:text-blue-600 transition-colors">Accessibility</a>
                <a href="/security" className="hover:text-blue-600 transition-colors">Security</a>
                <div className="flex items-center gap-2">
                  <span>🌍</span>
                  <select className="bg-transparent border-none text-sm focus:outline-none">
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
        context={feedbackModal.context}
      />
    </div>
  )
}