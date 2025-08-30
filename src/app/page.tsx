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
  Music,
  MessageSquare,
  Instagram,
  Facebook,
  Linkedin,
} from 'lucide-react'

const platformIcons = [
  { name: 'YouTube', icon: Youtube },
  { name: 'Instagram', icon: Instagram },
  { name: 'Facebook', icon: Facebook },
  { name: 'LinkedIn', icon: Linkedin },
  { name: 'TikTok', icon: Music },
  { name: 'Spotify', icon: Music },
]

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Intelligent generation that understands your brand'
  },
  {
    icon: Globe,
    title: 'All Platforms',
    description: 'Optimized for every social media platform'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Professional results in under 10 seconds'
  },
  {
    icon: Shield,
    title: 'Professional',
    description: 'Commercial-ready, watermark-free content'
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
        <section className="py-20 md:py-32 lg:py-40 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Main Headline - Simplified */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-gray-900">
                AI-Powered Cover Generation
              </h1>
              
              {/* Subtitle - One clear line */}
              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Create professional covers for all your content in seconds.
              </p>
              
              {/* Platform Icons - Simple row */}
              <div className="flex justify-center items-center gap-8 md:gap-12 mb-12">
                {platformIcons.map((platform) => (
                  <platform.icon 
                    key={platform.name} 
                    className="w-8 h-8 md:w-10 md:h-10 text-gray-400 hover:text-gray-600 transition-colors duration-200" 
                  />
                ))}
              </div>
              
              {/* Three key benefits - Text only, no backgrounds */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-16 text-sm md:text-base text-gray-600">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  10-second generation
                </span>
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  All major platforms
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  No login required
                </span>
              </div>

              {/* Single CTA - The only colored element */}
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200"
                onClick={() => {
                  trackInteraction('homepage_cta', 'click', undefined)
                  document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Start Creating
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
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-900">Why CoverGen AI?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Professional results without the complexity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <feature.icon className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <div className="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">10s</div>
                <div className="text-sm text-gray-600">Generation Time</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">6+</div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">70%</div>
                <div className="text-sm text-gray-600">Time Saved</div>
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
                  Free users get 10 generations per day with standard quality. Pro users get unlimited generations, 
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
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-900">Ready to get started?</h2>
            <p className="text-lg mb-8 text-gray-600 max-w-2xl mx-auto">
              Join thousands of creators saving hours every week
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200"
                onClick={() => {
                  trackInteraction('bottom_cta', 'click', user?.id)
                  document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Start Creating
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-6 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
                onClick={() => {
                  setFeedbackModal({ isOpen: true, context: 'general' })
                  trackInteraction('feedback_button', 'click', user?.id)
                }}
              >
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