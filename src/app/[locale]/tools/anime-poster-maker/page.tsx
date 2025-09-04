import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateStructuredData } from '@/lib/seo-utils'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Sparkles, Star, Zap, Palette, Download, Share2, Wand2, Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Get optimized keywords for this page
const keywords = [
  'anime poster maker',
  'anime poster generator',
  'anime poster creator',
  'anime poster design',
  'manga poster maker',
  'anime art generator',
  'anime cover maker',
  'japanese poster design',
  'anime poster templates',
  'free anime poster maker',
  'AI anime poster',
  'anime poster maker online',
  'custom anime posters',
  'anime movie poster maker',
  'anime event poster',
  'otaku poster creator',
  'kawaii poster maker',
  'anime wallpaper maker'
]

// SEO optimized metadata
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const title = 'Anime Poster Maker - Create Stunning Anime Posters with AI | CoverGen Pro'
  const description = 'Design professional anime posters in seconds with our AI-powered anime poster maker. Choose from 100+ anime styles, add Japanese text, and create eye-catching designs for your anime content.'
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: 'Free Anime Poster Maker - AI Anime Art Generator | CoverGen Pro',
      description: 'Create stunning anime posters with AI. Perfect for manga covers, anime events, and otaku content.',
      url: `https://covergen.pro/${locale}/tools/anime-poster-maker`,
      siteName: 'CoverGen Pro',
      images: [{
        url: 'https://covergen.pro/og-anime-poster.png',
        width: 1200,
        height: 630,
        alt: 'AI Anime Poster Maker - Create Professional Anime Art'
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://covergen.pro/twitter-anime-poster.png'],
      creator: '@covergenai',
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/anime-poster-maker`,
      languages: {
        'en': '/en/tools/anime-poster-maker',
        'zh': '/zh/tools/anime-poster-maker',
        'ja': '/ja/tools/anime-poster-maker',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Lazy load the tool component
const AnimePosterTool = dynamic(() => import('@/components/tools/AnimePosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export default function AnimePosterMakerPage({ params: { locale } }: { params: { locale: string } }) {
  const breadcrumbItems = [
    { name: 'Home', href: `/${locale}` },
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Anime Poster Maker', current: true }
  ]

  // Structured data for SEO
  const structuredData = [
    generateStructuredData('softwareApplication', {
      name: 'Anime Poster Maker - AI Anime Art Generator',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: {
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        ratingValue: '4.9',
        ratingCount: '1892',
        bestRating: '5'
      }
    }),
    generateStructuredData('howto', {
      name: 'How to Create Anime Posters with AI',
      description: 'Step-by-step guide to creating professional anime posters',
      steps: [
        { name: 'Choose Anime Style', text: 'Select from manga, kawaii, shonen, shojo, or custom anime styles' },
        { name: 'Enter Details', text: 'Add character names, titles, and Japanese text' },
        { name: 'Select Theme', text: 'Pick colors and moods - action, romance, fantasy, or slice of life' },
        { name: 'Generate', text: 'AI creates multiple anime poster designs instantly' },
        { name: 'Download', text: 'Export in high resolution for printing or digital use' }
      ]
    }),
    generateStructuredData('faq', {
      questions: [
        {
          question: 'What anime styles does the poster maker support?',
          answer: 'Our AI anime poster maker supports all popular anime and manga styles including shonen (action), shojo (romance), seinen (mature), kawaii (cute), mecha, isekai, and more. You can also create custom styles by describing your vision.'
        },
        {
          question: 'Can I add Japanese text to my anime posters?',
          answer: 'Yes! Our tool fully supports Japanese text including hiragana, katakana, and kanji. You can add titles, character names, and stylized Japanese typography. We also provide romanization options for international audiences.'
        },
        {
          question: 'Is this suitable for anime event posters?',
          answer: 'Absolutely! Create professional posters for anime conventions, cosplay events, anime club meetings, screening parties, and more. Our templates are optimized for both print and digital promotion.'
        },
        {
          question: 'Can I create manga-style covers?',
          answer: 'Yes, our manga poster maker feature is perfect for creating manga volume covers, doujinshi covers, and webtoon thumbnails. The AI understands manga panel layouts and typography conventions.'
        },
        {
          question: 'Is the anime poster maker free to use?',
          answer: 'Yes, our basic anime poster maker is 100% free with no watermarks. Create unlimited anime posters for personal use. Pro features include premium anime styles and commercial licensing.'
        }
      ]
    })
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <BreadcrumbWrapper>
          <Breadcrumb items={breadcrumbItems} />
        </BreadcrumbWrapper>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 py-20">
          {/* Anime-style decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-white">
              <Star className="w-20 h-20 animate-pulse" />
            </div>
            <div className="absolute top-40 right-20 text-white">
              <Heart className="w-16 h-16 animate-bounce" />
            </div>
            <div className="absolute bottom-20 left-1/3 text-white">
              <Sparkles className="w-24 h-24 animate-spin-slow" />
            </div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
                <Wand2 className="w-4 h-4" />
                100+ Anime Styles Available
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Anime Poster Maker
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                Create stunning anime posters with AI in seconds! Perfect for manga covers, 
                anime events, fan art, and otaku content. Choose from 100+ authentic anime 
                styles with Japanese typography support.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="#generator">
                  <Button 
                    size="lg" 
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 shadow-xl"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Anime Poster
                  </Button>
                </Link>
                <Link href={`/${locale}#pricing`}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-purple-600 bg-white hover:bg-gray-100"
                  >
                    <Palette className="w-5 h-5 mr-2" />
                    Price Viewing
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">100+</div>
                  <div className="text-sm text-white/80">Anime Styles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-sm text-white/80">Posters Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">4.9★</div>
                  <div className="text-sm text-white/80">User Rating</div>
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
            <AnimePosterTool />
          </div>
        </section>


        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Anime Design Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create authentic anime posters
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Palette className="w-6 h-6" />}
                title="100+ Anime Styles"
                description="From classic manga to modern anime, access a vast library of authentic styles"
                color="purple"
              />
              <FeatureCard
                icon={<Star className="w-6 h-6" />}
                title="Japanese Typography"
                description="Add authentic Japanese text with proper fonts for hiragana, katakana, and kanji"
                color="pink"
              />
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title="Special Effects"
                description="Speed lines, cherry blossoms, sparkles, and other classic anime effects"
                color="blue"
              />
              <FeatureCard
                icon={<Wand2 className="w-6 h-6" />}
                title="Character Poses"
                description="AI generates dynamic character poses and expressions true to anime style"
                color="green"
              />
              <FeatureCard
                icon={<Download className="w-6 h-6" />}
                title="HD Export"
                description="Download in high resolution perfect for printing or digital sharing"
                color="orange"
              />
              <FeatureCard
                icon={<Share2 className="w-6 h-6" />}
                title="Multi-Format"
                description="Export for social media, print posters, or convention banners"
                color="red"
              />
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Perfect For Every Anime Fan
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <UseCaseCard
                  title="Content Creators"
                  description="Create eye-catching thumbnails and covers for anime YouTube channels, podcasts, and streaming."
                  benefits={[
                    'Anime reaction video thumbnails',
                    'Manga review covers',
                    'Anime podcast artwork',
                    'Streaming overlays'
                  ]}
                />
                <UseCaseCard
                  title="Event Organizers"
                  description="Design professional posters for anime conventions, cosplay events, and fan meetups."
                  benefits={[
                    'Convention promotional materials',
                    'Cosplay contest posters',
                    'Anime club flyers',
                    'Screening event graphics'
                  ]}
                />
                <UseCaseCard
                  title="Artists & Creators"
                  description="Bring your original characters and stories to life with professional anime-style posters."
                  benefits={[
                    'OC (Original Character) posters',
                    'Doujinshi covers',
                    'Fan art prints',
                    'Commission samples'
                  ]}
                />
                <UseCaseCard
                  title="Businesses"
                  description="Attract anime fans with themed promotional materials for cafes, stores, and services."
                  benefits={[
                    'Anime cafe menus',
                    'Manga store promotions',
                    'Gaming center posters',
                    'Japanese restaurant decor'
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <FAQItem
                  question="What anime styles does the poster maker support?"
                  answer="Our AI anime poster maker supports all popular anime and manga styles including shonen (action), shojo (romance), seinen (mature), kawaii (cute), mecha, isekai, and more. You can also create custom styles by describing your vision."
                />
                <FAQItem
                  question="Can I add Japanese text to my anime posters?"
                  answer="Yes! Our tool fully supports Japanese text including hiragana, katakana, and kanji. You can add titles, character names, and stylized Japanese typography. We also provide romanization options for international audiences."
                />
                <FAQItem
                  question="Is this suitable for anime event posters?"
                  answer="Absolutely! Create professional posters for anime conventions, cosplay events, anime club meetings, screening parties, and more. Our templates are optimized for both print and digital promotion."
                />
                <FAQItem
                  question="Can I create manga-style covers?"
                  answer="Yes, our manga poster maker feature is perfect for creating manga volume covers, doujinshi covers, and webtoon thumbnails. The AI understands manga panel layouts and typography conventions."
                />
                <FAQItem
                  question="Is the anime poster maker free to use?"
                  answer="Yes, our basic anime poster maker is 100% free with no watermarks. Create unlimited anime posters for personal use. Pro features include premium anime styles and commercial licensing."
                />
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create Professional Anime Posters with AI Technology</h2>
              <p>
                In the vibrant world of anime and manga, visual presentation is everything. Our AI-powered 
                anime poster maker revolutionizes how fans, artists, and businesses create stunning anime 
                artwork. Whether you're promoting an anime event, creating fan art, or designing original 
                content, our tool delivers authentic anime aesthetics with professional quality.
              </p>
              
              <h3>Authentic Anime Art Generation</h3>
              <p>
                Our <strong>anime poster generator</strong> is trained on thousands of authentic anime 
                and manga artworks, understanding the nuanced differences between various styles. From the 
                dynamic action lines of shonen manga to the delicate expressions of shojo romance, our AI 
                captures the essence of Japanese animation art.
              </p>
              
              <h3>Perfect for Anime Events and Conventions</h3>
              <p>
                Planning an anime convention or cosplay event? Our <strong>anime event poster</strong> 
                maker creates eye-catching promotional materials that resonate with otaku culture. Include 
                event details in both English and Japanese, add themed graphics, and choose from layouts 
                optimized for social media promotion or large-format printing.
              </p>
              
              <h3>Manga Cover Creation Made Easy</h3>
              <p>
                Aspiring manga artists and doujinshi creators love our <strong>manga poster maker</strong> 
                feature. Design professional-looking volume covers, chapter title pages, and promotional 
                artwork that matches industry standards. The AI understands manga-specific elements like 
                panel layouts, speech bubble placement, and dramatic typography.
              </p>
              
              <h3>Japanese Typography and Text Support</h3>
              <p>
                Authenticity matters in anime design. Our tool fully supports Japanese text rendering with 
                proper fonts for hiragana, katakana, and kanji characters. Create titles that look like 
                they came straight from Tokyo, with options for vertical text layout and stylized logo 
                designs common in anime branding.
              </p>
              
              <h3>Free Anime Poster Maker for Everyone</h3>
              <p>
                We believe creativity shouldn't be limited by budget. Our <strong>free anime poster maker</strong> 
                provides unlimited access to basic features with no watermarks. Create as many anime posters 
                as you want for personal projects, social media, or non-commercial use. Pro users gain access 
                to premium styles, higher resolutions, and commercial licensing.
              </p>
              
              <h3>Join the Anime Art Revolution</h3>
              <p>
                Over 50,000 anime fans, artists, and content creators have discovered the power of AI-assisted 
                anime poster design. From YouTube thumbnail creators to convention organizers, our tool empowers 
                the anime community to produce stunning visuals that capture the magic of Japanese animation. 
                Start creating your perfect anime poster today and bring your vision to life!
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Create Amazing Anime Art?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of anime fans creating stunning posters with AI. 
              Free forever, no credit card required.
            </p>
            <Link href="#generator">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating Anime Posters
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}


// Feature Card Component
function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <div className="text-center">
      <div className={`w-16 h-16 ${colorClasses[color as keyof typeof colorClasses]} rounded-full flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  )
}

// Use Case Card Component
function UseCaseCard({ title, description, benefits }: {
  title: string
  description: string
  benefits: string[]
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✦</span>
            <span className="text-sm text-gray-700">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}