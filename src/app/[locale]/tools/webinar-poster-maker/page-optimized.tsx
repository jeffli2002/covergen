import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { generateToolSchema, generateFAQSchema } from '@/lib/seo/schema'

// Supported locales
const supportedLocales = ['en', 'es', 'zh', 'ja', 'ko', 'fr', 'de', 'pt', 'ar', 'hi']

// SEO optimized metadata with high-value keywords
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return generateToolMetadata({
    tool: 'webinar-poster-maker',
    locale,
    title: 'Webinar Poster Maker ',
    description: 'AI-powered webinar poster maker generator with perfect dimensions and instant results.',
    keywords: [/* Add relevant keywords */],
  })
}

  const title = 'Webinar Poster Maker - Free Professional Event Graphics | CoverGen Pro'
  const description = 'Create stunning webinar posters for Zoom, Teams, and GoToWebinar. Professional registration banners and promotional graphics. Free poster maker with no watermarks.'

  const metadata: Metadata = {
    title,
    description,
    keywords: 'webinar poster maker, zoom webinar poster, teams meeting banner, webinar registration poster, online event poster, virtual event graphics, webinar invitation design, professional webinar banner, conference poster maker, seminar poster creator, workshop poster design, masterclass poster maker, training session poster, webinar promotional graphics, event registration banner',
    openGraph: {
      title: 'Free Webinar Poster Maker - Professional Event Graphics',
      description,
      images: [
        {
          url: '/platform-examples/webinar-poster-showcase.jpg',
          width: 1200,
          height: 630,
          alt: 'Webinar Poster Maker - Create Professional Event Graphics',
        },
      ],
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/platform-examples/webinar-poster-showcase.jpg'],
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/webinar-poster-maker`,
      languages: supportedLocales.reduce((acc, loc) => {
        acc[loc] = `https://covergen.pro/${loc}/tools/webinar-poster-maker`
        return acc
      }, {} as Record<string, string>),
    },
    other: {
      'event-poster-designer': 'true',
      'professional-poster-maker': 'true',
      'zoom-webinar': 'true',
      'teams-meeting': 'true',
    },
  }

  return metadata
}

// Lazy load the tool component
const WebinarPosterTool = dynamic(() => import('@/components/tools/WebinarPosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

// Enhanced Content Component
const WebinarPosterContent = dynamic(() => import('./enhanced-content'), {

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
  ssr: true
})

interface Props {
  params: { locale: string }
}

export default async function WebinarPosterPage({ params: { locale } }: Props) {
  if (!supportedLocales.includes(locale)) {
    notFound()
  }

  // Generate schema for SEO
  const toolSchema = generateToolSchema({
    name: 'Webinar Poster Maker',
    description: 'Create professional webinar posters, registration banners, and promotional graphics for Zoom, Teams, GoToWebinar and other platforms',
    url: `https://covergen.pro/${locale}/tools/webinar-poster-maker`,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    offers: {
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      ratingValue: '4.9',
      ratingCount: '1892',
      bestRating: '5',
      worstRating: '1',
    },
  })

  const faqSchema = generateFAQSchema([
    {
      question: 'What size should a webinar poster be?',
      answer: 'For most platforms, we recommend 1920x1080px (16:9) for webinar posters. Our tool automatically generates posters in multiple formats: LinkedIn (1200x627), Facebook (1200x630), Twitter (1200x675), and email headers (600x200). All optimized for maximum engagement.',
    },
    {
      question: 'Can I create posters for Zoom webinars?',
      answer: 'Yes! Our webinar poster maker is perfect for Zoom webinars. We provide templates specifically designed for Zoom registration pages, email invitations, and social media promotion. The tool ensures your posters meet Zoom\'s recommended dimensions.',
    },
    {
      question: 'Is the webinar poster maker free?',
      answer: 'Yes, our basic webinar poster maker is completely free with no watermarks. Create unlimited posters for your online events. Pro features include premium templates, batch creation for series, and advanced branding options.',
    },
    {
      question: 'Can I add QR codes to my webinar posters?',
      answer: 'Absolutely! Our tool includes a built-in QR code generator that can link directly to your webinar registration page. Perfect for hybrid events where attendees might see your poster both online and offline.',
    },
    {
      question: 'What makes this tool special for webinar graphics?',
      answer: 'Our tool specializes in professional event graphics with features like automatic speaker layout, countdown timers, registration CTAs, platform-specific sizing, and AI-powered design suggestions based on your webinar topic. No design skills needed!',
    },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([toolSchema, faqSchema]) }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                </span>
                Professional Webinar Graphics
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
                Webinar Poster Maker
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Create professional webinar posters that drive registrations. Perfect for Zoom, Teams, GoToWebinar and all virtual events.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-12">
                <a href="#tool" className="bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                  Create Webinar Poster Free
                </a>
                <a href="#templates" className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all">
                  Browse Templates
                </a>
              </div>
              
              {/* Platform Compatibility */}
              <div className="flex flex-wrap gap-6 justify-center items-center">
                <span className="text-sm font-medium">Works with all platforms:</span>
                <div className="flex gap-6 text-sm">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">Zoom</span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">Teams</span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">GoToWebinar</span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">WebEx</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full opacity-20 blur-3xl" />
        </section>

        {/* Tool Section */}
        <section id="tool" className="py-12">
          <div className="container mx-auto px-4">
            <WebinarPosterTool />
          </div>
        </section>

        {/* Enhanced Content */}
        <WebinarPosterContent locale={locale} />
      </div>
    </>
  )
}