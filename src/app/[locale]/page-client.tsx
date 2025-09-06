'use client'

import { useEffect, useState } from 'react'
import MobileHeader from '@/components/mobile-header'
import ImageGenerator from '@/components/image-generator'
import PricingSection from '@/components/pricing-section'
import FeedbackModal from '@/components/feedback-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { useAnalytics } from '@/lib/analytics'
import { useAuth } from '@/contexts/AuthContext'
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
import { TikTokIcon, SpotifyIcon, TwitterXIcon } from '@/components/icons/brand-icons'
import { Locale } from '@/lib/i18n/config'
import { AuthDebugSimple } from '@/components/auth/AuthDebugSimple'
import { SessionRecovery } from '@/components/auth/SessionRecovery'
import { OAuthCallbackDetector } from '@/components/auth/OAuthCallbackDetector'
import { OAuthCodeHandler } from '@/components/auth/OAuthCodeHandler'

interface HomePageClientProps {
  locale: Locale
  translations: any
}

const platformIcons = [
  { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { name: 'TikTok', icon: TikTokIcon, color: 'text-black' },
  { name: 'Spotify', icon: SpotifyIcon, color: 'text-green-500' },
  { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { name: 'X', icon: TwitterXIcon, color: 'text-black' },
]

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Advanced AI creates stunning, professional covers in seconds'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate multiple variations instantly with one click'
  },
  {
    icon: Globe,
    title: 'Multi-Platform',
    description: 'Perfectly sized for YouTube, TikTok, Spotify, and more'
  },
  {
    icon: Shield,
    title: 'Brand Consistent',
    description: 'Maintain your unique style across all platforms'
  }
]

export default function HomePageClient({ locale, translations: t }: HomePageClientProps) {
  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CoverGen Pro',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    description: 'AI-powered cover and thumbnail generator using Google Gemini 2.5 Flash (Nano Banana) - the latest and powerful AI image generation model. This platform is independent and not affiliated with Google.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '2156'
    },
    featureList: [
      'AI-powered image generation',
      'Google Gemini 2.5 Flash (Nano Banana) technology',
      'Multi-platform support',
      'No sign-in required',
      'Free generation'
    ]
  }
  const { currentTask, user } = useAppStore()
  const { trackPageView, trackInteraction, getVariant } = useAnalytics()
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; context: 'generation' | 'result' | 'general' }>({
    isOpen: false,
    context: 'general'
  })
  const { user: authUser } = useAuth()

  // Debug session state
  useEffect(() => {
    console.log('[PageClient Debug]', {
      authUser: authUser?.email,
      cookies: document.cookie,
      hasAuthCookies: document.cookie.includes('sb-')
    })
  }, [authUser])

  // Handle OAuth errors and codes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    const code = urlParams.get('code')
    
    console.log('[HomePage] OAuth check:', { error, code: code ? code.substring(0, 10) + '...' : null })
    
    if (error) {
      console.error('[HomePage] OAuth error:', errorDescription || error)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    // Handle OAuth code if present (backup for OAuthCodeHandler)
    if (code && !error) {
      console.log('[HomePage] Found OAuth code, attempting exchange...')
      
      import('@/utils/supabase/client').then(async ({ createClient }) => {
        const supabase = createClient()
        
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('[HomePage] Code exchange failed:', exchangeError)
            window.location.href = '/auth/error?error=' + encodeURIComponent(exchangeError.message)
          } else if (data?.session) {
            console.log('[HomePage] Session established!', data.session.user.email)
            
            // Clean URL and reload
            const cleanUrl = new URL(window.location.href)
            cleanUrl.searchParams.delete('code')
            cleanUrl.searchParams.set('auth_callback', 'success')
            window.location.href = cleanUrl.toString()
          }
        } catch (err) {
          console.error('[HomePage] Code exchange error:', err)
        }
      })
    }
  }, [])
  
  // Handle post-OAuth redirect
  useEffect(() => {
    if (user) {
      // Check for stored redirect
      const storedRedirect = sessionStorage.getItem('oauth_redirect')
      if (storedRedirect) {
        console.log('[HomePage] User authenticated, redirecting to:', storedRedirect)
        sessionStorage.removeItem('oauth_redirect')
        window.location.href = storedRedirect
      }
    }
  }, [user])

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
      {/* OAuth detection and session recovery */}
      <OAuthCodeHandler />
      <OAuthCallbackDetector />
      <SessionRecovery />
      
      {/* Debug panel */}
      <AuthDebugSimple />
      
      {/* Temporary debug text */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black p-2 rounded text-sm z-50">
          DEBUG: User = {authUser?.email || 'Not signed in'}
        </div>
      )}
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
              </p>

              
              {/* Platform Icons with animations */}
              <div className="flex justify-center gap-6 md:gap-8 lg:gap-12 mb-8 flex-wrap px-4">
                {platformIcons.map((platform) => (
                  <div key={platform.name} className="flex flex-col items-center gap-2 md:gap-3 group">
                    <div className="p-3 md:p-4 lg:p-5 rounded-3xl bg-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 border border-gray-100">
                      <platform.icon className={`w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 ${platform.color}`} />
                    </div>
                    <span className="text-sm md:text-base lg:text-lg font-medium text-gray-700">{platform.name}</span>
                  </div>
                ))}
              </div>

              {/* Free generation highlight */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl px-6 py-4 mb-8 max-w-3xl mx-auto border border-green-200">
                <p className="text-lg md:text-xl font-semibold text-green-800">
                  🎉 <span className="underline decoration-2 decoration-green-400">TRY FREE TODAY</span> • No Sign-in Required • Unlimited Creativity
                </p>
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

        {/* Technology Section - Nano Banana */}
        <section className="py-16 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="text-6xl">🍌</div>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                Powered by Google's Advanced AI
              </h2>
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-yellow-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Google Gemini 2.5 Flash <span className="text-yellow-600">("Nano Banana")</span>
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We use Google's latest and powerful image generation model - Gemini 2.5 Flash, 
                  affectionately known as "Nano Banana" in the AI community. This cutting-edge technology delivers:
                </p>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-2">⚡ Lightning Fast</h4>
                    <p className="text-gray-600">Generate high-quality images in seconds, not minutes</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-2">🎨 Superior Quality</h4>
                    <p className="text-gray-600">State-of-the-art AI understanding for perfect compositions</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-2">🌐 Multi-Language</h4>
                    <p className="text-gray-600">Understands prompts in 100+ languages naturally</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-100 rounded-xl">
                  <p className="text-sm text-gray-600 text-center italic">
                    This platform is an independent product and is not affiliated with, endorsed by, or sponsored by Google. 
                    We provide access to the Gemini 2.5 Flash model through our custom interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">Why Choose CoverGen Pro?</h2>
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
        <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
              <div className="group">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-blue-200">
                  <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">10s</div>
                  <div className="text-base font-medium text-blue-700">{t.stats.generationTime}</div>
                </div>
              </div>
              <div className="group">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-purple-200">
                  <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">6+</div>
                  <div className="text-base font-medium text-purple-700">{t.stats.platforms}</div>
                </div>
              </div>
              <div className="group">
                <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-pink-200">
                  <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-base font-medium text-pink-700">{t.stats.uptime}</div>
                </div>
              </div>
              <div className="group">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-orange-200">
                  <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">70%</div>
                  <div className="text-base font-medium text-orange-700">{t.stats.timeSaved}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
                Everything you need to know about CoverGen Pro. Can't find the answer you're looking for? 
                <a href="mailto:contact@covergen.pro" className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 hover:underline ml-1 font-bold">Contact us</a>.
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
                  Free users get 10 covers per month (3/day max) for personal use only. Pro ($9/month) includes a 7-day trial and 
                  120 covers per month with commercial rights. Pro+ ($19/month) also includes a 7-day trial and 300 covers per 
                  month with full commercial license and 7-day cloud gallery.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Can I use the generated images commercially?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Free plan is for personal use only. Pro plan includes commercial usage rights for small businesses 
                  and content creators. Pro+ plan offers full commercial license with team and enterprise usage rights.
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
              
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  How does the Pro/Pro+ trial work?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Pro and Pro+ plans come with a 7-day free trial. During the trial, Pro users get 28 covers total 
                  and Pro+ users get 70 covers total. Trial usage doesn't count against your first paid month - you'll 
                  get the full monthly quota when your subscription begins.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Hidden */}
        {/* <section className="py-24 bg-gradient-to-br from-purple-50 via-white to-pink-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
                What Creators Are Saying
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
                Join thousands of satisfied creators who've transformed their content with <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">AI-powered covers</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Testimonial 1 */}
              {/* <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden">
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
              </div> */}

              {/* Testimonial 2 */}
              {/* <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden">
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
              </div> */}

              {/* Testimonial 3 */}
              {/* <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden">
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
              </div> */}

              {/* Testimonial 4 */}
              {/* <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden">
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
              </div> */}

              {/* Testimonial 5 */}
              {/* <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden">
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
              </div> */}

              {/* Testimonial 6 */}
              {/* <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden">
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
            </div> */}

            {/* CTA for Testimonials */}
            {/* <div className="text-center mt-16">
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
        </section> */}

        {/* Pricing Section */}
        <section id="pricing">
          <PricingSection locale={locale} />
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto font-medium">
              Join thousands of creators who save hours every week with AI-powered cover generation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button 
                size="lg" 
                className="text-xl md:text-2xl px-12 py-8 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => {
                  trackInteraction('bottom_cta', 'click', user?.id)
                  document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                Start Creating Free
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-xl px-10 py-8 border-2 border-white bg-white/20 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 rounded-3xl font-semibold transition-all duration-300"
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

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
        context={feedbackModal.context}
      />
    </div>
  )
}