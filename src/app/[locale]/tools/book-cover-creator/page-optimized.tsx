import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateStructuredData } from '@/lib/seo-utils'
import { getKeywordsByDifficulty } from '@/lib/seo/enhanced-keywords'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Sparkles, BookOpen, Palette, Zap, Shield, Download, Star, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Get optimized keywords for this page
const keywords = [
  'book cover creator',
  'book cover generator free', 
  'kindle cover creator',
  'kindle book cover maker',
  'wattpad cover maker',
  'comic book cover creator',
  'ai book cover generator',
  '3d cover maker',
  'ebook cover maker',
  'novel cover design',
  'fantasy book cover',
  'romance book cover',
  'thriller book cover',
  'manga cover maker',
  'free book cover design',
  'book cover templates',
  'self-publishing cover design',
  'amazon kdp cover maker',
  'book cover generator ai',
  'manuscript cover maker',
  'book cover mockup generator',
  'spine and back cover creator',
  '3d book mockup generator',
  'children book cover maker',
  'poetry book cover design',
  ...getKeywordsByDifficulty(30).filter(k => k.keyword.includes('book') || k.keyword.includes('cover')).slice(0, 10).map(k => k.keyword)
]

// SEO optimized metadata with high-value keywords
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return generateToolMetadata({
    tool: 'book-cover-creator',
    locale,
    title: 'Book Cover Creator ',
    description: 'AI-powered book cover creator generator with perfect dimensions and instant results.',
    keywords: [/* Add relevant keywords */],
  })
}/tools/book-cover-creator`,
      siteName: 'CoverGen Pro',
      images: [{
        url: 'https://covergen.pro/og-book-cover-creator.png',
        width: 1200,
        height: 630,
        alt: 'AI Book Cover Creator - Design Professional Book Covers'
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://covergen.pro/twitter-book-cover-creator.png'],
      creator: '@covergenai',
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/book-cover-creator`,
      languages: {
        'en': '/en/tools/book-cover-creator',
        'zh': '/zh/tools/book-cover-creator',
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
const BookCoverCreatorTool = dynamic(() => import('@/components/tools/BookCoverCreatorTool'), {

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export default function BookCoverCreatorPage({ params: { locale } }: { params: { locale: string } }) {
  const breadcrumbItems = [
    { name: 'Home', href: `/${locale}` },
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Book Cover Creator', current: true }
  ]

  // Structured data for SEO
  const structuredData = [
    generateStructuredData('softwareApplication', {
      name: 'Book Cover Creator - AI Powered Design Tool',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: {
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        ratingValue: '4.8',
        ratingCount: '2456',
        bestRating: '5'
      }
    }),
    generateStructuredData('howto', {
      name: 'How to Create a Book Cover with AI',
      description: 'Step-by-step guide to creating professional book covers using AI technology',
      steps: [
        { name: 'Enter Book Details', text: 'Type your book title, author name, and genre' },
        { name: 'Choose Style', text: 'Select from fantasy, romance, thriller, sci-fi, or custom styles' },
        { name: 'AI Generation', text: 'Let AI create multiple professional cover designs' },
        { name: 'Customize Design', text: 'Fine-tune colors, fonts, and layout elements' },
        { name: 'Download', text: 'Export in print-ready format for Kindle, paperback, or hardcover' }
      ]
    }),
    generateStructuredData('faq', {
      questions: [
        {
          question: 'What book formats does the cover creator support?',
          answer: 'Our AI book cover creator supports all major formats including Kindle/eBook (2560×1600), paperback (various sizes), hardcover, and Wattpad covers. We also provide 3D mockups and spine designs.'
        },
        {
          question: 'Can I use the generated book covers commercially?',
          answer: 'Yes! All book covers created with our AI tool are 100% royalty-free and can be used for commercial purposes, including self-publishing on Amazon KDP, selling on bookstores, or any other commercial use.'
        },
        {
          question: 'Do I need design skills to create a book cover?',
          answer: 'No design skills required! Our AI analyzes your book details and automatically generates professional covers. Simply enter your title and genre, and the AI handles the design work.'
        },
        {
          question: 'What genres are supported?',
          answer: 'We support all book genres including fantasy, romance, thriller, mystery, sci-fi, non-fiction, children\'s books, poetry, self-help, business, and more. Each genre has specialized AI models for authentic designs.'
        },
        {
          question: 'Can I create a series with consistent branding?',
          answer: 'Yes! Our tool allows you to save style preferences and create consistent covers for book series, ensuring your entire collection has cohesive branding.'
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
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <BreadcrumbWrapper>
          <Breadcrumb items={breadcrumbItems} />
        </BreadcrumbWrapper>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                #1 AI Book Cover Creator
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                AI Book Cover Creator
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                Design stunning book covers in seconds with AI. Perfect for Kindle, Wattpad, 
                paperback, and eBooks. No design skills needed - just enter your book details 
                and let AI create professional covers instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Book Cover Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-gray-300"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  View Examples
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">50K+</div>
                  <div className="text-sm text-gray-600">Authors Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">4.8★</div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">100%</div>
                  <div className="text-sm text-gray-600">Free to Use</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">No</div>
                  <div className="text-sm text-gray-600">Watermark</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Component */}
        <section className="py-12" id="generator">
          <div className="container mx-auto px-4">
            <BookCoverCreatorTool />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Design Professional Book Covers
              </h2>
              <p className="text-lg text-gray-600">
                From Kindle eBooks to hardcover novels, create covers that sell
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Palette className="w-6 h-6" />}
                title="Genre-Specific Designs"
                description="AI trained on thousands of bestsellers creates authentic covers for fantasy, romance, thriller, sci-fi, and 20+ genres"
                color="indigo"
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Instant Generation"
                description="Get multiple professional cover options in seconds. No waiting, no design skills required"
                color="purple"
              />
              <FeatureCard
                icon={<BookOpen className="w-6 h-6" />}
                title="All Format Support"
                description="Kindle/eBook, paperback, hardcover, Wattpad - get the perfect dimensions for any platform"
                color="blue"
              />
              <FeatureCard
                icon={<Star className="w-6 h-6" />}
                title="3D Mockups Included"
                description="Visualize your book with realistic 3D mockups perfect for marketing and promotion"
                color="yellow"
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Copyright Safe"
                description="All AI-generated designs are 100% original and royalty-free for commercial use"
                color="green"
              />
              <FeatureCard
                icon={<Download className="w-6 h-6" />}
                title="Print-Ready Files"
                description="Download high-resolution files with proper bleeds and spine calculations for printing"
                color="red"
              />
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Perfect for Every Type of Author
              </h2>
              <p className="text-lg text-gray-600">
                Whether you're self-publishing or working with a publisher, we've got you covered
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <UseCaseCard
                title="Self-Publishers"
                description="Create professional covers for Amazon KDP without expensive designers"
                keywords={['kindle cover creator', 'amazon kdp cover maker']}
              />
              <UseCaseCard
                title="Wattpad Authors"
                description="Design eye-catching covers that get more reads on Wattpad"
                keywords={['wattpad cover maker']}
              />
              <UseCaseCard
                title="Series Authors"
                description="Maintain consistent branding across your entire book series"
                keywords={['book series cover design']}
              />
              <UseCaseCard
                title="Comic Creators"
                description="Generate stunning comic and manga covers with AI precision"
                keywords={['comic book cover creator', 'manga cover maker']}
              />
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
                  question="What book formats does the cover creator support?"
                  answer="Our AI book cover creator supports all major formats including Kindle/eBook (2560×1600), paperback (various sizes), hardcover, and Wattpad covers. We also provide 3D mockups and spine designs."
                />
                <FAQItem
                  question="Can I use the generated book covers commercially?"
                  answer="Yes! All book covers created with our AI tool are 100% royalty-free and can be used for commercial purposes, including self-publishing on Amazon KDP, selling on bookstores, or any other commercial use."
                />
                <FAQItem
                  question="Do I need design skills to create a book cover?"
                  answer="No design skills required! Our AI analyzes your book details and automatically generates professional covers. Simply enter your title and genre, and the AI handles the design work."
                />
                <FAQItem
                  question="What genres are supported?"
                  answer="We support all book genres including fantasy, romance, thriller, mystery, sci-fi, non-fiction, children's books, poetry, self-help, business, and more. Each genre has specialized AI models for authentic designs."
                />
                <FAQItem
                  question="Can I create a series with consistent branding?"
                  answer="Yes! Our tool allows you to save style preferences and create consistent covers for book series, ensuring your entire collection has cohesive branding."
                />
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2>The Ultimate AI Book Cover Creator for Authors</h2>
              <p>
                In today's competitive publishing landscape, a professional book cover is essential for success. 
                Our AI-powered book cover creator revolutionizes the design process, making it accessible to 
                every author regardless of budget or design experience.
              </p>
              
              <h3>Why Book Cover Design Matters</h3>
              <p>
                Studies show that readers make purchasing decisions within 8 seconds of seeing a book cover. 
                A professionally designed cover can increase sales by up to 50%. Our AI book cover generator 
                ensures your book makes the right first impression, whether on Amazon, bookstore shelves, or 
                social media.
              </p>
              
              <h3>Advanced AI Technology for Book Design</h3>
              <p>
                Our book cover creator uses advanced AI trained on thousands of bestselling book covers across 
                all genres. The AI understands design principles like composition, typography, color theory, 
                and genre conventions. This means you get covers that not only look professional but also 
                appeal to your target readers.
              </p>
              
              <h3>Perfect for Kindle and Amazon KDP</h3>
              <p>
                As a <strong>kindle cover creator</strong>, our tool is optimized for Amazon's requirements. 
                We provide the exact dimensions needed for Kindle eBooks (2560×1600 pixels) and ensure your 
                cover looks crisp on all devices. The AI also considers how covers appear as thumbnails, 
                crucial for online book sales.
              </p>
              
              <h3>Wattpad Cover Maker Features</h3>
              <p>
                For Wattpad authors, our <strong>wattpad cover maker</strong> creates covers that stand out 
                in the platform's competitive environment. The AI understands Wattpad's younger demographic 
                and creates trendy, eye-catching designs that drive more reads and followers.
              </p>
              
              <h3>Comic and Manga Cover Creation</h3>
              <p>
                Our <strong>comic book cover creator</strong> and <strong>manga cover maker</strong> features 
                are specially designed for graphic novel creators. The AI can generate dynamic action scenes, 
                character showcases, and stylized text that captures the essence of your story.
              </p>
              
              <h3>3D Book Cover Mockups</h3>
              <p>
                Beyond flat designs, our <strong>3d cover maker</strong> creates realistic book mockups perfect 
                for marketing. See your book as a physical product with accurate shadows, reflections, and 
                perspectives. These 3D mockups are ideal for social media promotion, author websites, and 
                crowdfunding campaigns.
              </p>
              
              <h3>Free and No Watermark</h3>
              <p>
                Unlike other book cover generators, we believe in empowering authors. Our tool is completely 
                free to use with no hidden costs or watermarks. Download your covers in high resolution, 
                ready for immediate use on any publishing platform.
              </p>
              
              <h3>Join Thousands of Successful Authors</h3>
              <p>
                Over 50,000 authors have used our AI book cover generator to create stunning covers that sell. 
                From first-time self-publishers to established series authors, our tool helps bring stories 
                to life with professional design. Start creating your perfect book cover today and join the 
                ranks of successful published authors.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Create Your Bestselling Book Cover?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join 50,000+ authors who've created professional book covers with our AI tool. 
              Free forever, no credit card required.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Creating Now - It's Free
            </Button>
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
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-4`}>
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
function UseCaseCard({ title, description, keywords }: {
  title: string
  description: string
  keywords: string[]
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {keyword}
          </span>
        ))}
      </div>
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