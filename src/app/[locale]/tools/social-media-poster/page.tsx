import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { generateToolSchema, generateFAQSchema } from '@/lib/seo/schema'

// Supported locales
const supportedLocales = ['en', 'es', 'zh', 'ja', 'ko', 'fr', 'de', 'pt', 'ar', 'hi']

// SEO optimized metadata with high-value keywords
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  if (!supportedLocales.includes(locale)) {
    notFound()
  }

  const title = 'Social Media Poster Maker - Free Instagram Grid & Discord Banner Creator | CoverGen Pro'
  const description = 'Create stunning social media posts, Instagram grids, Discord banners, LinkedIn covers, and Pinterest pins with AI. Free poster maker with no watermarks for all platforms.'

  const metadata: Metadata = {
    title,
    description,
    keywords: 'social media poster maker, instagram grid maker, discord banner maker, linkedin cover creator, pinterest pin maker, facebook post designer, twitter header maker, reddit banner creator, free social media design tool, ai poster generator, instagram post template, social media graphics, social media banner maker, instagram story maker',
    openGraph: {
      title: 'Free Social Media Poster Maker - Create Posts for All Platforms',
      description,
      images: [
        {
          url: '/platform-examples/social-media-poster-showcase.jpg',
          width: 1200,
          height: 630,
          alt: 'AI Social Media Poster Maker - Create Professional Graphics',
        },
      ],
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/platform-examples/social-media-poster-showcase.jpg'],
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/social-media-poster`,
      languages: supportedLocales.reduce((acc, loc) => {
        acc[loc] = `https://covergen.pro/${loc}/tools/social-media-poster`
        return acc
      }, {} as Record<string, string>),
    },
    other: {
      'pinterest-rich-pin': 'true',
      'instagram-grid-maker': 'true',
      'twitter-header-maker': 'true',
      'discord-banner-maker': 'true',
    },
  }

  return metadata
}

// Lazy load the tool component
const SocialMediaPosterTool = dynamic(() => import('@/components/tools/SocialMediaPosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

// Enhanced Content Component
const SocialMediaPosterContent = dynamic(() => import('./enhanced-content'), {
  ssr: true
})

interface Props {
  params: { locale: string }
}

export default async function SocialMediaPosterPage({ params: { locale } }: Props) {
  if (!supportedLocales.includes(locale)) {
    notFound()
  }

  // Generate schema for SEO
  const toolSchema = generateToolSchema({
    name: 'Social Media Poster Maker',
    description: 'Create stunning social media posters, banners, and posts for Instagram, Facebook, LinkedIn, Twitter, Discord, and Pinterest',
    url: `https://covergen.pro/${locale}/tools/social-media-poster`,
    features: ['AI Generation', 'Multiple Platforms', 'Custom Templates', 'Brand Consistency']
  })

  const faqSchema = generateFAQSchema([
    {
      question: 'What social media platforms does the poster maker support?',
      answer: 'Our social media poster maker supports all major platforms including Instagram (posts, stories, reels), Facebook (posts, covers), LinkedIn (posts, banners), Twitter/X (posts, headers), Discord (banners), Pinterest (pins), Reddit (banners), and more. Each platform has optimized dimensions and templates.',
    },
    {
      question: 'Can I create Instagram grid posts with this tool?',
      answer: 'Yes! Our Instagram grid maker feature allows you to create cohesive grid layouts that split a single image across multiple posts. Perfect for creating stunning Instagram profiles with a professional, unified look.',
    },
    {
      question: 'Is the social media poster maker really free?',
      answer: 'Yes, our basic social media poster maker is 100% free with no watermarks. You can create unlimited posts for personal use. Pro features include premium templates, AI-powered design suggestions, and batch creation for multiple platforms.',
    },
    {
      question: 'Can I schedule posts directly from the tool?',
      answer: 'While our tool focuses on creating stunning visuals, you can download your designs and use them with any social media scheduling tool like Buffer, Hootsuite, or native platform schedulers.',
    },
    {
      question: 'What makes this tool unique for social media design?',
      answer: 'Our AI-powered poster maker specializes in social media content with platform-specific optimizations, trending templates updated daily, one-click resizing for all platforms, and no watermarks on free designs. Plus, our Discord banner maker and Pinterest pin maker features are specifically optimized for those platforms.',
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
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Trending: Instagram Grid Layouts
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
                Social Media Poster Maker
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Create stunning posts for Instagram, Facebook, LinkedIn, Discord, Pinterest & more. AI-powered design with perfect dimensions for every platform.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-12">
                <a href="#tool" className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                  Start Creating Free
                </a>
                <a href={`/${locale}#pricing`} className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all">
                  View Pricing
                </a>
              </div>
              
              {/* Platform Icons */}
              <div className="flex flex-wrap gap-6 justify-center items-center">
                <span className="text-sm font-medium">Works with all platforms:</span>
                <div className="flex gap-4">
                  <img src="/icons/instagram.svg" alt="Instagram" className="h-8 w-8" />
                  <img src="/icons/facebook.svg" alt="Facebook" className="h-8 w-8" />
                  <img src="/icons/linkedin.svg" alt="LinkedIn" className="h-8 w-8" />
                  <img src="/icons/twitter.svg" alt="Twitter" className="h-8 w-8" />
                  <img src="/icons/discord.svg" alt="Discord" className="h-8 w-8" />
                  <img src="/icons/pinterest.svg" alt="Pinterest" className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full opacity-20 blur-3xl" />
        </section>

        {/* Tool Section */}
        <section id="tool" className="py-12">
          <div className="container mx-auto px-4">
            <SocialMediaPosterTool />
          </div>
        </section>

        {/* Enhanced Content */}
        <SocialMediaPosterContent locale={locale} />
      </div>
    </>
  )
}