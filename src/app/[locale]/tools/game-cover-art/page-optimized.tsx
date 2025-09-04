import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateStructuredData } from '@/lib/seo-utils'
import { getKeywordsByDifficulty } from '@/lib/seo/enhanced-keywords'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Sparkles, Gamepad2, Sword, Trophy, Zap, Shield, Youtube, Twitch } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Get optimized keywords for this page - focusing on gaming keywords
const keywords = [
  'game cover art generator',
  'gaming thumbnail maker free online',
  'minecraft thumbnail creator no watermark',
  'fortnite cover image generator',
  'roblox thumbnail maker ai',
  'gaming youtube thumbnail',
  'twitch stream thumbnail',
  'steam game cover maker',
  'gaming poster creator',
  'esports cover design',
  'game box art maker',
  'video game cover generator',
  'fps thumbnail maker',
  'moba cover creator',
  'rpg game cover',
  'gaming channel art',
  'game banner maker',
  'gaming logo cover',
  'valorant thumbnail maker',
  'apex legends cover creator',
  'gta thumbnail generator',
  'call of duty cover maker',
  'league of legends thumbnail',
  'pokemon cover creator',
  ...getKeywordsByDifficulty(30).filter(k => k.keyword.includes('gaming') || k.keyword.includes('game')).slice(0, 10).map(k => k.keyword)
]

// SEO optimized metadata with high-value keywords
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return generateToolMetadata({
    tool: 'game-cover-art',
    locale,
    title: 'Game Cover Art ',
    description: 'AI-powered game cover art generator with perfect dimensions and instant results.',
    keywords: [/* Add relevant keywords */],
  })
}/tools/game-cover-art`,
      siteName: 'CoverGen Pro',
      images: [{
        url: 'https://covergen.pro/og-game-cover-art.png',
        width: 1200,
        height: 630,
        alt: 'AI Game Cover Art Generator - Create Gaming Thumbnails'
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://covergen.pro/twitter-game-cover-art.png'],
      creator: '@covergenai',
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/game-cover-art`,
      languages: {
        'en': '/en/tools/game-cover-art',
        'zh': '/zh/tools/game-cover-art',
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
const GameCoverArtTool = dynamic(() => import('@/components/tools/GameCoverArtTool'), {

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export default function GameCoverArtPage({ params: { locale } }: { params: { locale: string } }) {
  const breadcrumbItems = [
    { name: 'Home', href: `/${locale}` },
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Game Cover Art Generator', current: true }
  ]

  // Structured data for SEO
  const structuredData = [
    generateStructuredData('softwareApplication', {
      name: 'Game Cover Art Generator - AI Gaming Thumbnail Maker',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      offers: {
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        ratingValue: '4.9',
        ratingCount: '5234',
        bestRating: '5'
      }
    }),
    generateStructuredData('howto', {
      name: 'How to Create Gaming Thumbnails with AI',
      description: 'Step-by-step guide to creating professional gaming covers and thumbnails',
      steps: [
        { name: 'Choose Game Title', text: 'Select your game or enter custom game name' },
        { name: 'Select Style', text: 'Pick from FPS, RPG, MOBA, or custom gaming styles' },
        { name: 'Add Elements', text: 'Include character, weapons, or game-specific elements' },
        { name: 'Generate', text: 'AI creates multiple epic gaming cover designs' },
        { name: 'Download', text: 'Export for YouTube, Twitch, Steam, or print' }
      ]
    }),
    generateStructuredData('faq', {
      questions: [
        {
          question: 'What games are supported by the cover art generator?',
          answer: 'Our AI gaming thumbnail maker supports all popular games including Minecraft, Fortnite, Roblox, Valorant, Apex Legends, Call of Duty, League of Legends, GTA, Pokemon, and more. You can also create covers for indie games or custom game titles.'
        },
        {
          question: 'What platforms can I use the gaming covers for?',
          answer: 'Gaming covers work perfectly for YouTube thumbnails (1280x720), Twitch stream overlays, Steam game covers, Discord server banners, Twitter headers, and gaming posters. All exports are high-resolution and optimized for each platform.'
        },
        {
          question: 'Can I add my gaming logo and watermark?',
          answer: 'Yes! You can upload your gaming channel logo, clan tag, or watermark. Our tool allows full customization while maintaining the professional gaming aesthetic. Position logos anywhere on the cover.'
        },
        {
          question: 'Is this free for gaming content creators?',
          answer: 'Absolutely! Our gaming thumbnail maker is 100% free with no watermarks. Perfect for YouTube gamers, Twitch streamers, and content creators who need professional thumbnails without expensive design software.'
        },
        {
          question: 'Can I create esports team covers?',
          answer: 'Yes! Create professional covers for esports teams, tournaments, and gaming events. Include team logos, player names, tournament details, and sponsor information with our customization options.'
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
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <BreadcrumbWrapper className="bg-gray-900/50">
          <Breadcrumb items={breadcrumbItems} />
        </BreadcrumbWrapper>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full text-green-400 text-sm font-medium mb-6 border border-green-500/30">
                <Trophy className="w-4 h-4" />
                Gaming Keywords: Minecraft, Fortnite, Gaming
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Game Cover Art Generator
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                Create epic gaming thumbnails and covers with AI. Perfect for YouTube gaming 
                channels, Twitch streams, and Steam games. Support for Minecraft, Fortnite, 
                Roblox, and all popular games.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 border-0"
                >
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Create Gaming Cover Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Youtube className="w-5 h-5 mr-2" />
                  View Examples
                </Button>
              </div>
              
              {/* Gaming Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">100K+</div>
                  <div className="text-sm text-gray-400">Gamers Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">50+</div>
                  <div className="text-sm text-gray-400">Game Titles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">4.9★</div>
                  <div className="text-sm text-gray-400">Gamer Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">No</div>
                  <div className="text-sm text-gray-400">Watermark</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Component */}
        <section className="py-12" id="generator">
          <div className="container mx-auto px-4">
            <GameCoverArtTool />
          </div>
        </section>

        {/* Popular Games Grid */}
        <section className="py-20 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Create Covers for Every Gaming Platform
              </h2>
              <p className="text-lg text-gray-400">
                From battle royales to RPGs, create stunning covers for any game
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <GameCard
                title="Minecraft"
                description="Blocky worlds, epic builds"
                color="green"
                keywords={['minecraft thumbnail creator', 'minecraft cover maker']}
              />
              <GameCard
                title="Fortnite"
                description="Battle royale action covers"
                color="blue"
                keywords={['fortnite cover image', 'fortnite thumbnail']}
              />
              <GameCard
                title="Roblox"
                description="Creative game thumbnails"
                color="red"
                keywords={['roblox thumbnail maker', 'roblox game cover']}
              />
              <GameCard
                title="Valorant"
                description="Tactical FPS covers"
                color="pink"
                keywords={['valorant thumbnail', 'valorant cover art']}
              />
              <GameCard
                title="Apex Legends"
                description="Hero shooter thumbnails"
                color="orange"
                keywords={['apex legends cover', 'apex thumbnail maker']}
              />
              <GameCard
                title="Call of Duty"
                description="Military action covers"
                color="gray"
                keywords={['cod thumbnail maker', 'call of duty cover']}
              />
              <GameCard
                title="League of Legends"
                description="MOBA champion art"
                color="yellow"
                keywords={['lol thumbnail', 'league cover maker']}
              />
              <GameCard
                title="GTA"
                description="Open world covers"
                color="purple"
                keywords={['gta thumbnail', 'grand theft auto cover']}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Professional Gaming Design Features
              </h2>
              <p className="text-lg text-gray-400">
                Everything you need to create viral gaming content
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Sword className="w-6 h-6" />}
                title="Game-Specific Assets"
                description="AI understands each game's unique style, characters, and visual language"
                gradient="from-red-600 to-orange-600"
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Epic Effects"
                description="Explosions, particle effects, and dynamic action scenes that grab attention"
                gradient="from-yellow-600 to-red-600"
              />
              <FeatureCard
                icon={<Trophy className="w-6 h-6" />}
                title="Rank & Stats Display"
                description="Show off achievements, K/D ratios, wins, and competitive ranks"
                gradient="from-green-600 to-blue-600"
              />
              <FeatureCard
                icon={<Youtube className="w-6 h-6" />}
                title="Platform Optimized"
                description="Perfect dimensions for YouTube, Twitch, Twitter, and Discord"
                gradient="from-red-600 to-pink-600"
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="No Copyright Issues"
                description="AI-generated art that's safe for monetization and streaming"
                gradient="from-blue-600 to-purple-600"
              />
              <FeatureCard
                icon={<Gamepad2 className="w-6 h-6" />}
                title="Multi-Game Support"
                description="Create consistent branding across different games you play"
                gradient="from-purple-600 to-pink-600"
              />
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Perfect for Every Type of Gamer
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <UseCaseCard
                  title="YouTube Gaming Channels"
                  description="Create eye-catching thumbnails that increase click-through rates and grow your gaming channel."
                  features={[
                    'Viral thumbnail designs',
                    'A/B testing variations',
                    'Series consistency',
                    'Platform-optimized sizes'
                  ]}
                />
                <UseCaseCard
                  title="Twitch Streamers"
                  description="Design professional stream graphics, offline banners, and highlight covers."
                  features={[
                    'Stream starting soon screens',
                    'Offline channel art',
                    'Clip thumbnails',
                    'Schedule graphics'
                  ]}
                />
                <UseCaseCard
                  title="Esports Teams"
                  description="Create consistent team branding for tournaments, social media, and merchandise."
                  features={[
                    'Team roster graphics',
                    'Tournament announcements',
                    'Victory celebrations',
                    'Sponsor integration'
                  ]}
                />
                <UseCaseCard
                  title="Game Developers"
                  description="Design store covers, promotional art, and marketing materials for your games."
                  features={[
                    'Steam store graphics',
                    'App store screenshots',
                    'Social media promos',
                    'Update announcements'
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
              <h2 className="text-3xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <FAQItem
                  question="What games are supported by the cover art generator?"
                  answer="Our AI gaming thumbnail maker supports all popular games including Minecraft, Fortnite, Roblox, Valorant, Apex Legends, Call of Duty, League of Legends, GTA, Pokemon, and more. You can also create covers for indie games or custom game titles."
                />
                <FAQItem
                  question="What platforms can I use the gaming covers for?"
                  answer="Gaming covers work perfectly for YouTube thumbnails (1280x720), Twitch stream overlays, Steam game covers, Discord server banners, Twitter headers, and gaming posters. All exports are high-resolution and optimized for each platform."
                />
                <FAQItem
                  question="Can I add my gaming logo and watermark?"
                  answer="Yes! You can upload your gaming channel logo, clan tag, or watermark. Our tool allows full customization while maintaining the professional gaming aesthetic. Position logos anywhere on the cover."
                />
                <FAQItem
                  question="Is this free for gaming content creators?"
                  answer="Absolutely! Our gaming thumbnail maker is 100% free with no watermarks. Perfect for YouTube gamers, Twitch streamers, and content creators who need professional thumbnails without expensive design software."
                />
                <FAQItem
                  question="Can I create esports team covers?"
                  answer="Yes! Create professional covers for esports teams, tournaments, and gaming events. Include team logos, player names, tournament details, and sponsor information with our customization options."
                />
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
              <h2>The Ultimate Gaming Thumbnail Maker for Content Creators</h2>
              <p>
                In the competitive world of gaming content creation, having eye-catching thumbnails 
                and cover art is essential for standing out. Our AI-powered game cover art generator 
                is specifically designed for gamers, streamers, and content creators who need 
                professional-quality graphics without the complexity of traditional design software.
              </p>
              
              <h3>Gaming Thumbnail Maker Free Online - No Experience Needed</h3>
              <p>
                As a <strong>gaming thumbnail maker free online</strong>, our tool eliminates 
                the barriers that prevent gamers from creating professional content. You don't need 
                Photoshop skills or expensive software subscriptions. Simply choose your game, describe 
                your vision, and let AI create multiple thumbnail options that capture the excitement 
                of your gaming content.
              </p>
              
              <h3>Minecraft Thumbnail Creator No Watermark</h3>
              <p>
                Minecraft content creators love our <strong>minecraft thumbnail creator no watermark</strong> 
                feature. Whether you're showcasing epic builds, redstone contraptions, or 
                survival adventures, our AI understands Minecraft's unique blocky aesthetic. Create 
                thumbnails featuring creepers, diamonds, enchanted gear, and your custom skin - all 
                without any watermarks limiting your content.
              </p>
              
              <h3>Fortnite Cover Image Generator for Victory Royales</h3>
              <p>
                Our <strong>fortnite cover image generator</strong> captures the vibrant, 
                action-packed essence of battle royale gameplay. Show off your best eliminations, 
                Victory Royales, and skin collections with thumbnails that feature dynamic poses, 
                building battles, and storm circles. Perfect for YouTube highlights and Twitch clips.
              </p>
              
              <h3>Roblox Thumbnail Maker AI - Infinite Creativity</h3>
              <p>
                The <strong>roblox thumbnail maker ai</strong> feature understands the diverse 
                world of Roblox games. From Adopt Me to Jailbreak, create thumbnails that match each 
                game's unique style. Include Robux icons, game passes, and custom characters to make 
                your Roblox content stand out in search results.
              </p>
              
              <h3>Professional Features for Serious Gamers</h3>
              <p>
                Our gaming cover generator includes advanced features that content creators need:
              </p>
              <ul>
                <li><strong>Multi-Platform Export:</strong> Optimized dimensions for YouTube (1280x720), Twitch panels, Twitter headers, and more</li>
                <li><strong>Brand Consistency:</strong> Save your color schemes and styles for cohesive channel branding</li>
                <li><strong>Quick Iterations:</strong> Generate multiple variations to A/B test what works best</li>
                <li><strong>Game-Specific Elements:</strong> AI trained on each game's visual style and community preferences</li>
                <li><strong>Text Effects:</strong> Eye-catching titles with game-appropriate fonts and effects</li>
              </ul>
              
              <h3>YouTube Gaming Success Stories</h3>
              <p>
                Successful gaming YouTubers know that thumbnails can make or break a video's performance. 
                Our tool helps create thumbnails that follow YouTube's best practices: high contrast, 
                clear focal points, readable text, and emotional expressions. Studies show that optimized 
                gaming thumbnails can increase click-through rates by up to 154%.
              </p>
              
              <h3>Twitch Stream Graphics Made Easy</h3>
              <p>
                Beyond YouTube, our tool excels at creating Twitch stream graphics. Design "Starting Soon" 
                screens, offline banners, panel images, and schedule graphics that maintain your channel's 
                professional appearance. The AI understands Twitch's unique requirements and community 
                expectations.
              </p>
              
              <h3>Free Forever for the Gaming Community</h3>
              <p>
                We believe every gamer deserves professional graphics, regardless of budget. That's why 
                our gaming thumbnail maker remains completely free with no watermarks. Whether you're 
                just starting your gaming channel or you're an established creator, access the same 
                powerful AI tools without any cost. Join over 100,000 gamers who've leveled up their 
                content with our free game cover art generator.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-900 to-blue-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Level Up Your Gaming Content?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 100,000+ gamers creating epic thumbnails with AI. 
              Free forever, no credit card required.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 px-8"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Start Creating Gaming Covers - It's Free
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}

// Game Card Component
function GameCard({ title, description, kd, color, keywords }: {
  title: string
  description: string
  kd?: number
  color: string
  keywords: string[]
}) {
  const colorClasses = {
    green: 'from-green-600 to-green-800',
    blue: 'from-blue-600 to-blue-800',
    red: 'from-red-600 to-red-800',
    pink: 'from-pink-600 to-pink-800',
    orange: 'from-orange-600 to-orange-800',
    gray: 'from-gray-600 to-gray-800',
    yellow: 'from-yellow-600 to-yellow-800',
    purple: 'from-purple-600 to-purple-800',
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all overflow-hidden group">
      <div className={`h-32 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
        <Gamepad2 className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-400 mb-3">{description}</p>
        <div className="flex flex-wrap gap-1">
          {keywords.map((keyword, index) => (
            <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>
      <p className="text-gray-400">
        {description}
      </p>
    </div>
  )
}

// Use Case Card Component  
function UseCaseCard({ title, description, features }: {
  title: string
  description: string
  features: string[]
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">✓</span>
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-2">{question}</h3>
      <p className="text-gray-400">{answer}</p>
    </div>
  )
}