import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateStructuredData } from '@/lib/seo-utils'
import { getKeywordsByDifficulty } from '@/lib/seo/enhanced-keywords'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, PartyPopper, Heart, Star, Users, Zap, Palette } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Get optimized keywords for this page - focusing on low KD opportunities
const keywords = [
  'event poster designer',
  'birthday poster maker',
  'wedding invitation cover',  
  'halloween poster creator',
  'party poster creator',
  'conference poster maker',
  'festival poster design',
  'christmas poster maker',
  'concert poster generator',
  'exhibition poster maker',
  'trade show banner',
  'corporate event poster',
  'charity event design',
  'sports event poster',
  'celebration poster maker',
  'event banner creator',
  'occasion poster design',
  'graduation poster maker',
  'baby shower invitation maker',
  'anniversary poster design',
  'retirement party poster',
  'fundraiser poster creator',
  'webinar poster design',
  'virtual event poster maker',
  ...getKeywordsByDifficulty(40).filter(k => k.keyword.includes('poster') || k.keyword.includes('event')).slice(0, 10).map(k => k.keyword)
]

// SEO optimized metadata with high-value keywords
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const title = 'Event Poster Designer - Birthday, Wedding & Party Poster Maker | CoverGen Pro'
  const description = 'Create stunning event posters for birthdays, weddings, parties, conferences, and festivals. Free AI-powered event poster designer with professional templates. Halloween poster creator included.'
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: 'Free Event Poster Designer - Create Stunning Event Graphics | CoverGen Pro',
      description: 'Design professional event posters for any occasion with AI. Birthday, wedding, corporate events, and more.',
      url: `https://covergen.pro/${locale}/tools/event-poster-designer`,
      siteName: 'CoverGen Pro',
      images: [{
        url: 'https://covergen.pro/og-event-poster.png',
        width: 1200,
        height: 630,
        alt: 'AI Event Poster Designer - Create Professional Event Graphics'
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://covergen.pro/twitter-event-poster.png'],
      creator: '@covergenai',
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/event-poster-designer`,
      languages: {
        'en': '/en/tools/event-poster-designer',
        'zh': '/zh/tools/event-poster-designer',
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
const EventPosterTool = dynamic(() => import('@/components/tools/EventPosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export default function EventPosterPage({ params: { locale } }: { params: { locale: string } }) {
  const breadcrumbItems = [
    { name: 'Home', href: `/${locale}` },
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Event Poster Designer', current: true }
  ]

  // Structured data for SEO
  const structuredData = [
    generateStructuredData('softwareApplication', {
      name: 'Event Poster Designer - AI Powered Design Tool',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: {
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        ratingValue: '4.9',
        ratingCount: '3892',
        bestRating: '5'
      }
    }),
    generateStructuredData('howto', {
      name: 'How to Create Event Posters with AI',
      description: 'Step-by-step guide to creating professional event posters using AI technology',
      steps: [
        { name: 'Choose Event Type', text: 'Select from birthday, wedding, corporate, or custom event types' },
        { name: 'Enter Event Details', text: 'Add event name, date, venue, and description' },
        { name: 'Select Theme', text: 'Choose colors, style, and mood for your event' },
        { name: 'AI Generation', text: 'Let AI create multiple professional poster designs' },
        { name: 'Download', text: 'Export in print-ready format or for social media sharing' }
      ]
    }),
    generateStructuredData('faq', {
      questions: [
        {
          question: 'What types of events can I create posters for?',
          answer: 'Our AI event poster designer supports all event types including birthdays, weddings, corporate events, conferences, festivals, Halloween parties, Christmas celebrations, concerts, exhibitions, sports events, and more. Each event type has specialized templates and design elements.'
        },
        {
          question: 'What sizes are available for event posters?',
          answer: 'We offer multiple sizes including standard poster sizes (11x17", 18x24", 24x36"), social media formats (Instagram, Facebook), and custom dimensions. All posters are created in high resolution suitable for both print and digital use.'
        },
        {
          question: 'Can I use custom colors and branding?',
          answer: 'Yes! You can customize colors to match your event theme or brand guidelines. Our AI understands color psychology and will suggest complementary color schemes while allowing full customization.'
        },
        {
          question: 'Is the event poster maker really free?',
          answer: 'Yes, our event poster designer is 100% free to use. Create unlimited posters without watermarks, no credit card required. Download in high resolution for professional printing.'
        },
        {
          question: 'Can I create posters in different languages?',
          answer: 'Absolutely! Our tool supports multiple languages and can create posters with text in any language. The AI adapts typography and layout based on the language used.'
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
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full text-orange-700 text-sm font-medium mb-6">
                <PartyPopper className="w-4 h-4" />
                Popular Events: Birthday, Wedding
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Event Poster Designer
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                Create stunning posters for any event in seconds. Perfect for birthdays, weddings, 
                corporate events, festivals, and celebrations. AI-powered design with professional 
                templates - no design skills needed.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Design Event Poster Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-gray-300"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Browse Templates
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">100K+</div>
                  <div className="text-sm text-gray-600">Events Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">4.9★</div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-gray-600">Event Types</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">Free</div>
                  <div className="text-sm text-gray-600">Forever</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Component */}
        <section className="py-12" id="generator">
          <div className="container mx-auto px-4">
            <EventPosterTool />
          </div>
        </section>

        {/* Event Types Grid */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Create Posters for Every Occasion
              </h2>
              <p className="text-lg text-gray-600">
                From intimate celebrations to large-scale events, design the perfect poster
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <EventTypeCard
                icon={<Heart className="w-6 h-6" />}
                title="Wedding & Engagement"
                description="Beautiful wedding invitations and save-the-dates"
                keywords={['wedding invitation cover', 'engagement party poster']}
                color="pink"
              />
              <EventTypeCard
                icon={<PartyPopper className="w-6 h-6" />}
                title="Birthday Parties"
                description="Fun birthday posters for all ages"
                keywords={['birthday poster maker', 'party invitation design']}
                color="yellow"
              />
              <EventTypeCard
                icon={<Calendar className="w-6 h-6" />}
                title="Corporate Events"
                description="Professional posters for business events"
                keywords={['conference poster', 'webinar poster maker']}
                color="blue"
              />
              <EventTypeCard
                icon={<Star className="w-6 h-6" />}
                title="Festivals & Holidays"
                description="Seasonal and holiday event posters"
                keywords={['halloween poster creator', 'christmas poster maker']}
                color="orange"
              />
            </div>

            {/* More Event Types */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
              <EventTypeCard
                icon={<Users className="w-6 h-6" />}
                title="Community Events"
                description="Charity fundraisers, local gatherings"
                keywords={['charity event poster', 'fundraiser design']}
                color="green"
              />
              <EventTypeCard
                icon={<Zap className="w-6 h-6" />}
                title="Entertainment"
                description="Concerts, shows, performances"
                keywords={['concert poster generator', 'show poster maker']}
                color="purple"
              />
              <EventTypeCard
                icon={<Palette className="w-6 h-6" />}
                title="Art & Culture"
                description="Exhibitions, galleries, cultural events"
                keywords={['exhibition poster', 'art show design']}
                color="indigo"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Professional Event Design Made Simple
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create stunning event posters in minutes
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title="AI-Powered Design"
                description="Smart algorithms create professional layouts based on your event type and preferences"
              />
              <FeatureCard
                icon={<Palette className="w-6 h-6" />}
                title="Custom Themes"
                description="Choose from hundreds of themes or create your own with custom colors and fonts"
              />
              <FeatureCard
                icon={<Calendar className="w-6 h-6" />}
                title="Date & Time Display"
                description="Automatic formatting for dates, times, and timezone information"
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="RSVP Integration"
                description="Add QR codes and RSVP links directly to your posters"
              />
              <FeatureCard
                icon={<Star className="w-6 h-6" />}
                title="Brand Consistency"
                description="Save your brand colors and fonts for consistent event branding"
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Quick Export"
                description="Download in multiple formats - print-ready PDF, PNG, or social media sizes"
              />
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Who Uses Our Event Poster Designer?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <UseCaseCard
                  title="Event Planners"
                  description="Create professional posters for multiple events quickly and maintain brand consistency across all materials."
                  benefits={[
                    'Save hours on design work',
                    'Consistent branding across events',
                    'Professional results every time'
                  ]}
                />
                <UseCaseCard
                  title="Small Businesses"
                  description="Promote store events, sales, and grand openings without hiring expensive designers."
                  benefits={[
                    'Cost-effective marketing',
                    'Quick turnaround times',
                    'Professional appearance'
                  ]}
                />
                <UseCaseCard
                  title="Non-Profits"
                  description="Design compelling posters for fundraisers, charity events, and community gatherings."
                  benefits={[
                    'Free tool saves budget',
                    'Engaging designs increase attendance',
                    'Easy to update and reuse'
                  ]}
                />
                <UseCaseCard
                  title="Personal Celebrations"
                  description="Make special occasions memorable with custom posters for birthdays, weddings, and parties."
                  benefits={[
                    'Personal touch for events',
                    'No design skills needed',
                    'Share digitally or print'
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <FAQItem
                  question="What types of events can I create posters for?"
                  answer="Our AI event poster designer supports all event types including birthdays, weddings, corporate events, conferences, festivals, Halloween parties, Christmas celebrations, concerts, exhibitions, sports events, and more. Each event type has specialized templates and design elements."
                />
                <FAQItem
                  question="What sizes are available for event posters?"
                  answer="We offer multiple sizes including standard poster sizes (11x17&quot;, 18x24&quot;, 24x36&quot;), social media formats (Instagram, Facebook), and custom dimensions. All posters are created in high resolution suitable for both print and digital use."
                />
                <FAQItem
                  question="Can I use custom colors and branding?"
                  answer="Yes! You can customize colors to match your event theme or brand guidelines. Our AI understands color psychology and will suggest complementary color schemes while allowing full customization."
                />
                <FAQItem
                  question="Is the event poster maker really free?"
                  answer="Yes, our event poster designer is 100% free to use. Create unlimited posters without watermarks, no credit card required. Download in high resolution for professional printing."
                />
                <FAQItem
                  question="Can I create posters in different languages?"
                  answer="Absolutely! Our tool supports multiple languages and can create posters with text in any language. The AI adapts typography and layout based on the language used."
                />
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Professional Event Poster Design with AI Technology</h2>
              <p>
                Creating eye-catching event posters is crucial for successful event promotion. Our AI-powered 
                event poster designer revolutionizes how organizers, businesses, and individuals create 
                professional event graphics without design experience or expensive software.
              </p>
              
              <h3>Birthday Poster Maker - Celebrate in Style</h3>
              <p>
                Our <strong>birthday poster maker</strong> is perfect for creating memorable birthday 
                celebrations. Whether it's a child's first birthday, sweet sixteen, or milestone anniversary, 
                our AI generates age-appropriate designs with vibrant colors, fun graphics, and personalized 
                messages. Choose from themes like unicorns, superheroes, elegant gold designs, or minimalist 
                modern styles.
              </p>
              
              <h3>Wedding Invitation Cover Designer</h3>
              <p>
                As a <strong>wedding invitation cover</strong> designer, we understand the importance 
                of setting the right tone for your special day. Our AI creates elegant, romantic designs that 
                match your wedding theme - from rustic barn weddings to sophisticated black-tie affairs. Include 
                venue details, RSVP information, and custom monograms with professional typography.
              </p>
              
              <h3>Halloween Poster Creator for Spooky Events</h3>
              <p>
                Our <strong>halloween poster creator</strong> brings your spooky celebrations to life 
                with themed designs featuring pumpkins, ghosts, witches, and more. Perfect for Halloween parties, 
                haunted houses, trick-or-treat events, or costume contests. The AI understands seasonal color 
                palettes and creates atmospheric designs that capture the Halloween spirit.
              </p>
              
              <h3>Corporate Event Poster Design</h3>
              <p>
                Professional businesses rely on our event poster designer for conferences, seminars, product 
                launches, and corporate celebrations. The AI maintains brand consistency while creating engaging 
                designs that communicate event details clearly. Perfect for trade shows, networking events, and 
                company milestones.
              </p>
              
              <h3>Festival and Concert Poster Generator</h3>
              <p>
                Music festivals, art shows, and cultural events need posters that capture attention and convey 
                the event's energy. Our AI analyzes successful festival poster designs to create vibrant, 
                dynamic layouts that stand out. Include lineup information, venue maps, and sponsor logos 
                seamlessly.
              </p>
              
              <h3>Smart Design Features</h3>
              <p>
                Our event poster designer uses advanced AI to understand design principles like visual hierarchy, 
                color theory, and typography. It automatically:
              </p>
              <ul>
                <li>Balances text and graphics for maximum readability</li>
                <li>Suggests color schemes based on event type and mood</li>
                <li>Optimizes layouts for different viewing distances</li>
                <li>Ensures important information stands out</li>
                <li>Adapts designs for print and digital formats</li>
              </ul>
              
              <h3>Free Tool with Professional Results</h3>
              <p>
                Unlike other poster makers that charge subscription fees or add watermarks, our event poster 
                designer is completely free. Download unlimited high-resolution posters ready for professional 
                printing or digital sharing. No hidden costs, no sign-up required - just instant access to 
                professional event design tools.
              </p>
              
              <h3>Perfect for Every Event Organizer</h3>
              <p>
                Whether you're planning a small birthday party or a large corporate conference, our AI event 
                poster designer scales to meet your needs. Join thousands of event organizers who've discovered 
                how easy it is to create stunning event posters that drive attendance and create buzz. Start 
                designing your perfect event poster today and see why we're the preferred choice for event 
                graphics worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Design Your Event Poster?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join 100,000+ event organizers creating professional posters with AI. 
              Free forever, no credit card required.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Create Event Poster Now - It's Free
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}

// Event Type Card Component
function EventTypeCard({ icon, title, description, keywords, kd, color }: {
  icon: React.ReactNode
  title: string
  description: string
  keywords: string[]
  kd?: number
  color: string
}) {
  const colorClasses = {
    pink: 'bg-pink-100 text-pink-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-sm mb-3">
        {description}
      </p>
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

// Feature Card Component
function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <div className="text-purple-600">
          {icon}
        </div>
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
            <span className="text-purple-500 mt-0.5">✓</span>
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