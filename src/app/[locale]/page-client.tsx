'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import ImageGenerator from '@/components/image-generator'
import PricingSection from '@/components/pricing-section'
import FeedbackModal from '@/components/feedback-modal'
import AIShowcase from '@/components/ai-showcase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { useAnalytics } from '@/lib/analytics'
import { useAuth } from '@/contexts/AuthContext'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'
import PageSkeleton from '@/components/ui/page-skeleton'
import { usePaymentReturn } from '@/hooks/usePaymentReturn'
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
  Video,
} from 'lucide-react'
import { TikTokIcon, SpotifyIcon, TwitterXIcon, FacebookIcon } from '@/components/icons/brand-icons'
import { Locale } from '@/lib/i18n/config'
import { PRICING_CONFIG } from '@/config/pricing.config'

interface HomePageClientProps {
  locale: Locale
  translations: any
}

const platformIcons = [
  { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { name: 'TikTok', icon: TikTokIcon, color: 'text-black' },
  { name: 'Facebook', icon: FacebookIcon, color: 'text-blue-600' },
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
  console.log('[HomePageClient] Starting render with:', { locale, hasTranslations: !!t })
  
  // Check if returning from payment and trigger refresh
  usePaymentReturn()
  
  const [isPageReady, setIsPageReady] = useState(false)
  
  // Initialize page after mount to prevent hydration mismatch
  useEffect(() => {
    console.log('[HomePageClient] Page mounted, setting ready state')
    setIsPageReady(true)
  }, [])
  
  // Handle hash navigation on page load
  useEffect(() => {
    // Only run after page is ready
    if (!isPageReady) return
    
    // Check if there's a hash in the URL
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.slice(1) // Remove the #
      
      // Small delay to ensure all elements are rendered
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          // Calculate the offset to account for sticky header
          // Desktop header is 64px (h-16), mobile header is 80px (h-20)
          const isMobile = window.innerWidth < 1024 // lg breakpoint
          const headerHeight = isMobile ? 80 : 64
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - headerHeight - 20 // Extra 20px for padding
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [isPageReady])
  
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
  
  // Get subscription configuration
  const config = getClientSubscriptionConfig()
  const trialDays = config.trialDays

  // Log auth state for debugging (without causing reloads)
  useEffect(() => {
    console.log('[PageClient] Auth state:', {
      authUser: authUser?.email,
      hasAuthCookies: typeof window !== 'undefined' && document.cookie.includes('sb-')
    })
  }, [authUser])

  // Handle OAuth errors
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    
    if (error) {
      console.error('[HomePage] OAuth error:', errorDescription || error)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])
  
  // Handle post-OAuth redirect
  useEffect(() => {
    if (authUser) {
      // Check for stored redirect
      const storedRedirect = sessionStorage.getItem('oauth_redirect')
      if (storedRedirect) {
        console.log('[HomePage] User authenticated, redirecting to:', storedRedirect)
        sessionStorage.removeItem('oauth_redirect')
        window.location.href = storedRedirect
      }
    }
  }, [authUser])

  // Handle hash navigation (e.g., #pricing from platform pages)
  useEffect(() => {
    if (isPageReady && window.location.hash) {
      // Wait for all components to render
      setTimeout(() => {
        const targetId = window.location.hash.substring(1)
        const targetElement = document.getElementById(targetId)
        
        if (targetElement) {
          // Calculate header height based on screen size
          const headerHeight = window.innerWidth >= 1024 ? 64 : 80 // desktop: 64px, mobile: 80px
          const scrollPosition = targetElement.offsetTop - headerHeight - 20 // extra padding
          
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          })
        }
      }, 100) // Small delay to ensure everything is rendered
    }
  }, [isPageReady])

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

  // Show skeleton while page is initializing
  if (!isPageReady) {
    return <PageSkeleton />
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="animate-in fade-in duration-300">
        {/* Hero Section */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-base md:text-lg lg:text-xl text-gray-600 mb-4 max-w-4xl mx-auto px-4 font-light leading-relaxed">
                Generate creative AI videos and professional thumbnails across all platforms.
              </h1>
              
              <p className="text-2xl md:text-3xl lg:text-5xl font-thin tracking-tight mb-6 md:mb-8 text-gray-900 leading-[4rem]">
                Next-Gen Storytelling: Videos with{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent font-semibold">Sora 2</span>
                , Images with{' '}
                <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 bg-clip-text text-transparent font-semibold">Nano Banana</span>
              </p>

              
              {/* Platform Icons - show 6 initially, scroll to reveal all */}
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  {/* Container that shows 6 icons width */}
                  <div className="relative overflow-hidden" style={{ width: 'min(95vw, 780px)' }}>
                    {/* Gradient overlays for fade in/out effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/70 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/70 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div 
                      className="flex gap-4 md:gap-5 lg:gap-6 py-2 transition-transform duration-300"
                      tabIndex={0}
                      style={{
                        width: 'max-content',
                        animation: 'scroll-icons 20s linear infinite paused',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.animationPlayState = 'running'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.animationPlayState = 'paused'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.animationPlayState = 'running'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.animationPlayState = 'paused'
                      }}
                    >
                      {/* Duplicate icons for seamless scrolling */}
                      {[...platformIcons, ...platformIcons, ...platformIcons].map((platform, index) => (
                        <div key={`${platform.name}-${index}`} className="flex flex-col items-center gap-2 group flex-shrink-0">
                          <div className="p-4 md:p-5 lg:p-6 rounded-2xl bg-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 border border-gray-100">
                            <platform.icon className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 ${platform.color}`} />
                          </div>
                          <span className="text-sm md:text-base font-normal text-gray-700">{platform.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <style jsx>{`
                @keyframes scroll {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
              `}</style>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
                <Button 
                  size="lg" 
                  className="text-lg md:text-xl px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-0"
                  onClick={() => {
                    trackInteraction('homepage_cta', 'click', undefined)
                    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                  {ctaText}
                </Button>
                
                <Button 
                  size="lg" 
                  className="text-lg md:text-xl px-10 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-0"
                  onClick={() => {
                    trackInteraction('sora_cta', 'click', undefined)
                    window.location.href = `/${locale}/sora`
                  }}
                >
                  <Video className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                  Try Sora 2
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Generation Section */}
        <section id="generator" className="py-20 bg-gray-50 scroll-mt-20">
          <div className="container mx-auto px-4">
            <ImageGenerator />
          </div>
        </section>

        {/* AI Showcase Section */}
        <AIShowcase />

        {/* Technology Section - Nano Banana */}
        <section className="py-20 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="text-6xl">🍌</div>
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extralight mb-6 text-gray-900">
                Powered by Google's Advanced AI
              </h2>
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-yellow-200">
                <h3 className="text-xl font-medium text-gray-800 mb-4">
                  Google Gemini 2.5 Flash <span className="text-yellow-600">("Nano Banana")</span>
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We use Google's latest and powerful image generation model - Gemini 2.5 Flash, 
                  affectionately known as "Nano Banana" in the AI community. This cutting-edge technology delivers:
                </p>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6">
                    <h4 className="font-medium text-gray-800 mb-2">⚡ Lightning Fast</h4>
                    <p className="text-gray-600">Generate high-quality images in seconds, not minutes</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6">
                    <h4 className="font-medium text-gray-800 mb-2">🎨 Superior Quality</h4>
                    <p className="text-gray-600">State-of-the-art AI understanding for perfect compositions</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6">
                    <h4 className="font-medium text-gray-800 mb-2">🌐 Multi-Language</h4>
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
        <section id="features" className="py-20 bg-white scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extralight mb-6 text-gray-900">Why Choose CoverGen Pro?</h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto font-normal leading-relaxed">
                Built for content creators who want <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">professional results</span> without the complexity
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
                    <h3 className="text-base font-medium mb-4 text-gray-800">{feature.title}</h3>
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
                  <div className="text-2xl md:text-3xl font-medium mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">10s</div>
                  <div className="text-base font-normal text-blue-700">{t.stats.generationTime}</div>
                </div>
              </div>
              <div className="group">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-purple-200">
                  <div className="text-2xl md:text-3xl font-medium mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">6+</div>
                  <div className="text-base font-normal text-purple-700">{t.stats.platforms}</div>
                </div>
              </div>
              <div className="group">
                <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-pink-200">
                  <div className="text-2xl md:text-3xl font-medium mb-2 bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-base font-normal text-pink-700">{t.stats.uptime}</div>
                </div>
              </div>
              <div className="group">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-orange-200">
                  <div className="text-2xl md:text-3xl font-medium mb-2 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">70%</div>
                  <div className="text-base font-normal text-orange-700">{t.stats.timeSaved}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
                Everything you need to know about CoverGen Pro. Can't find the answer you're looking for? 
                <a href="mailto:contact@covergen.pro" className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 hover:underline ml-1 font-semibold">Contact us</a>.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  How does AI cover generation work?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI analyzes your reference image and prompt to understand the style, composition, and requirements. 
                  It then generates a new cover image that matches your selected platform's dimensions while maintaining 
                  visual consistency and professional quality.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  Which social media platforms are supported?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We support all major platforms including YouTube, TikTok, Instagram, Twitter, LinkedIn, Facebook, 
                  and more. Each platform has optimized dimensions and design guidelines built-in.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  What's the difference between free and Pro plans?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Free users get {PRICING_CONFIG.plans[0].credits.onSignup} credits on signup (up to {Math.floor(PRICING_CONFIG.plans[0].credits.onSignup! / PRICING_CONFIG.generationCosts.nanoBananaImage)} Nano Banana images) for personal use only, with a daily limit of {PRICING_CONFIG.plans[0].features.find(f => f.text.includes('images per day'))?.text.split(' ')[0]} images. 
                  Pro (${PRICING_CONFIG.plans[1].price.monthly.toFixed(1)}/month or ${PRICING_CONFIG.plans[1].price.yearly.toFixed(2)}/year) includes {PRICING_CONFIG.plans[1].credits.monthly.toLocaleString()} credits/month ({PRICING_CONFIG.plans[1].credits.yearly.toLocaleString()}/year) for up to {Math.floor(PRICING_CONFIG.plans[1].credits.monthly / PRICING_CONFIG.generationCosts.nanoBananaImage)} images or {Math.floor(PRICING_CONFIG.plans[1].credits.monthly / PRICING_CONFIG.generationCosts.sora2Video)} Sora 2 videos per month with commercial rights. 
                  Pro+ (${PRICING_CONFIG.plans[2].price.monthly.toFixed(1)}/month or ${PRICING_CONFIG.plans[2].price.yearly.toFixed(2)}/year) includes {PRICING_CONFIG.plans[2].credits.monthly.toLocaleString()} credits/month ({PRICING_CONFIG.plans[2].credits.yearly.toLocaleString()}/year) for up to {Math.floor(PRICING_CONFIG.plans[2].credits.monthly / PRICING_CONFIG.generationCosts.nanoBananaImage)} images or {Math.floor(PRICING_CONFIG.plans[2].credits.monthly / PRICING_CONFIG.generationCosts.sora2Video)} Sora 2 videos per month, plus Sora 2 Pro quality.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  Can I use the generated images commercially?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  All plans include watermark-free images! Free plan is for personal use only. 
                  Pro and Pro+ plans include commercial usage rights for businesses, content creators, and client work. 
                  Both paid plans also include watermark-free Sora 2 videos.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  How long does image generation take?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Most images are generated within 10-30 seconds. Generation time depends on complexity and 
                  current server load. Pro users get priority processing for faster results.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  Is my content safe and private?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! We take privacy seriously. Your reference images are processed securely and deleted 
                  after generation. We never store or share your content with third parties.
                </p>
              </div>

              {/* Sora 2 Video Generation FAQs */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🎬</span>
                  What is Sora 2 video generation?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sora 2 is OpenAI's latest AI video generation model that creates realistic videos from text descriptions. 
                  Our platform integrates Sora 2 to help you generate professional video content for your social media, 
                  presentations, or marketing materials. Simply describe what you want to see, and Sora 2 brings it to life 
                  with stunning visual quality and natural motion.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  How long does Sora 2 video generation take?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sora 2 video generation typically takes 2-5 minutes depending on video length and complexity. 
                  The process involves multiple AI processing steps to ensure high-quality output with smooth motion, 
                  accurate scene composition, and natural lighting. You'll receive a notification when your video is ready, 
                  and Pro users get priority processing for faster results.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  What video formats and quality does Sora 2 support?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sora 2 generates videos in MP4 format with two quality options: Standard (720p) and HD (1080p). 
                  You can choose between landscape (16:9) and portrait (9:16) aspect ratios to perfectly match your platform needs. 
                  All videos include natural camera movements, realistic lighting, and professional-grade visual quality 
                  suitable for social media, presentations, and commercial use.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  How do credits work for images vs videos?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Credits are used for all generation types. Nano Banana images cost {PRICING_CONFIG.generationCosts.nanoBananaImage} credits each, Sora 2 videos cost {PRICING_CONFIG.generationCosts.sora2Video} credits, 
                  and Sora 2 Pro videos cost {PRICING_CONFIG.generationCosts.sora2ProVideo} credits. Free users get {PRICING_CONFIG.plans[0].credits.onSignup} signup bonus credits (up to {Math.floor(PRICING_CONFIG.plans[0].credits.onSignup! / PRICING_CONFIG.generationCosts.nanoBananaImage)} images, no video access). 
                  Pro users get {PRICING_CONFIG.plans[1].credits.monthly.toLocaleString()} credits/month (up to {Math.floor(PRICING_CONFIG.plans[1].credits.monthly / PRICING_CONFIG.generationCosts.nanoBananaImage)} images or {Math.floor(PRICING_CONFIG.plans[1].credits.monthly / PRICING_CONFIG.generationCosts.sora2Video)} videos). Pro+ users get {PRICING_CONFIG.plans[2].credits.monthly.toLocaleString()} credits/month 
                  (up to {Math.floor(PRICING_CONFIG.plans[2].credits.monthly / PRICING_CONFIG.generationCosts.nanoBananaImage)} images or {Math.floor(PRICING_CONFIG.plans[2].credits.monthly / PRICING_CONFIG.generationCosts.sora2Video)} videos) with access to Sora 2 Pro quality.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  What makes a good Sora 2 video prompt?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Great Sora 2 prompts are specific and descriptive. Include details about: <strong>scene description</strong> 
                  (what's happening), <strong>camera movement</strong> (pan, zoom, static), <strong>lighting</strong> 
                  (daylight, golden hour, neon), <strong>mood</strong> (energetic, calm, dramatic), and <strong>style</strong> 
                  (cinematic, documentary, artistic). For example: "A slow pan across a bustling Tokyo street at night, 
                  neon signs reflecting on wet pavement, cinematic lighting, vibrant colors."
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-medium mb-4 text-gray-900">
                  Can I use Sora 2 videos commercially?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Free plan videos are for personal use only. Pro plan (${PRICING_CONFIG.plans[1].price.monthly.toFixed(1)}/month) includes commercial usage rights 
                  for small businesses and content creators, perfect for social media content, YouTube videos, and 
                  marketing materials. Pro+ plan (${PRICING_CONFIG.plans[2].price.monthly.toFixed(1)}/month) offers full commercial license with team and enterprise 
                  usage rights, ideal for agencies and larger organizations.
                </p>
              </div>
              
            </div>
          </div>
        </section>

        {/* Testimonials Section - Hidden */}
        {/* <section className="py-24 bg-gradient-to-br from-purple-50 via-white to-pink-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-gray-900">
                What Creators Are Saying
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
                Join thousands of satisfied creators who've transformed their content with <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">AI-powered covers</span>
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300"
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
        <section id="pricing" className="scroll-mt-20 lg:scroll-mt-24 pt-4">
          <PricingSection locale={locale} />
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extralight mb-6 text-white">
              Ready to Transform Your Content?
            </h2>
            <p className="text-lg md:text-xl mb-12 text-white/90 max-w-3xl mx-auto font-normal">
              Join thousands of creators who save hours every week with AI-powered cover generation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button 
                size="lg" 
                className="text-lg md:text-xl px-10 py-6 bg-white text-gray-900 hover:bg-gray-100 font-medium rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
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
                className="text-lg md:text-xl px-10 py-6 border-2 border-white bg-white/20 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 rounded-2xl font-medium transition-all duration-300"
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
      </div>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
        context={feedbackModal.context}
      />
    </>
  )
}