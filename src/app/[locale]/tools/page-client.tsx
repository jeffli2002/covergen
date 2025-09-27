'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Sparkles,
  Image,
  Music,
  Calendar,
  Book,
  Gamepad2,
  Users,
  Video,
  Palette,
  Globe,
  Zap,
  Shield,
  Briefcase,
  TrendingUp,
  Youtube,
  MessageSquare,
  Mic,
  Tablet,
  BarChart3,
  Grid
} from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'

interface ToolsHubClientProps {
  locale: Locale
  translations: any
}

const tools = [
  {
    name: 'Instagram Thumbnail Maker',
    description: 'Create stunning thumbnails for Reels, Feed posts, and Stories',
    icon: Image,
    href: '/tools/instagram-thumbnail-maker',
    color: 'from-pink-500 to-purple-500',
    category: 'Social',
    popular: true,
    new: true,
    kd: 10
  },
  {
    name: 'LinkedIn Banner Maker',
    description: 'Professional profile headers that boost your career visibility',
    icon: Briefcase,
    href: '/tools/linkedin-banner-maker',
    color: 'from-blue-600 to-blue-700',
    category: 'Business',
    popular: true,
    new: true,
    kd: 7
  },
  {
    name: 'YouTube Thumbnail Ideas',
    description: 'Discover proven thumbnail designs that boost CTR and views',
    icon: Youtube,
    href: '/tools/youtube-thumbnail-ideas',
    color: 'from-red-600 to-red-700',
    category: 'Inspiration',
    popular: true,
    new: true,
    kd: 22
  },
  {
    name: 'Wattpad Cover Maker',
    description: 'Design captivating book covers for your Wattpad stories',
    icon: Book,
    href: '/tools/wattpad-cover-maker',
    color: 'from-orange-500 to-red-500',
    category: 'Publishing',
    popular: true,
    new: true,
    kd: 8
  },
  {
    name: 'Discord Banner Maker',
    description: 'Create custom Discord server banners and profile headers',
    icon: MessageSquare,
    href: '/tools/discord-banner-maker',
    color: 'from-indigo-500 to-purple-600',
    category: 'Social',
    popular: true,
    new: true,
    kd: 10
  },
  {
    name: 'Podcast Cover Maker',
    description: 'Professional podcast artwork that attracts listeners',
    icon: Mic,
    href: '/tools/podcast-cover-maker',
    color: 'from-purple-500 to-pink-500',
    category: 'Audio',
    popular: true,
    new: true,
    kd: 23
  },
  {
    name: 'Kindle Cover Creator',
    description: 'Design bestselling book covers for Kindle publishing',
    icon: Tablet,
    href: '/tools/kindle-cover-creator',
    color: 'from-gray-700 to-gray-900',
    category: 'Publishing',
    popular: true,
    new: true,
    kd: 13
  },
  {
    name: 'Thumbnail Tester',
    description: 'Test and compare thumbnail designs for maximum CTR',
    icon: BarChart3,
    href: '/tools/thumbnail-tester',
    color: 'from-green-500 to-teal-500',
    category: 'Analytics',
    popular: true,
    new: true,
    kd: 29
  },
  {
    name: 'Thumbnail Maker Hub',
    description: 'All-in-one thumbnail creation tools for every platform',
    icon: Grid,
    href: '/tools/thumbnail-maker-hub',
    color: 'from-blue-600 to-purple-600',
    category: 'Hub',
    popular: true,
    featured: true
  },
  {
    name: 'Anime Poster Maker',
    description: 'Create stunning anime-style posters with AI-generated artwork',
    icon: Palette,
    href: '/tools/anime-poster-maker',
    color: 'from-pink-500 to-purple-500',
    category: 'Entertainment',
    popular: true
  },
  {
    name: 'Spotify Playlist Cover',
    description: 'Design eye-catching playlist covers that attract listeners',
    icon: Music,
    href: '/tools/spotify-playlist-cover',
    color: 'from-green-500 to-green-600',
    category: 'Music',
    popular: true
  },
  {
    name: 'Facebook Event Cover',
    description: 'Professional event banners that boost attendance',
    icon: Calendar,
    href: '/tools/facebook-event-cover',
    color: 'from-blue-600 to-indigo-600',
    category: 'Events',
    popular: false
  },
  {
    name: 'Social Media Poster',
    description: 'Multi-purpose posters for all social platforms',
    icon: Globe,
    href: '/tools/social-media-poster',
    color: 'from-purple-500 to-pink-500',
    category: 'Social',
    popular: true
  },
  {
    name: 'Book Cover Creator',
    description: 'Professional book covers for authors and publishers',
    icon: Book,
    href: '/tools/book-cover-creator',
    color: 'from-amber-500 to-orange-500',
    category: 'Publishing',
    popular: true
  },
  {
    name: 'Game Cover Art',
    description: 'Epic game covers for indie developers and gamers',
    icon: Gamepad2,
    href: '/tools/game-cover-art',
    color: 'from-red-500 to-purple-600',
    category: 'Gaming',
    popular: false
  },
  {
    name: 'Webinar Poster Maker',
    description: 'Professional webinar posters that drive registrations',
    icon: Users,
    href: '/tools/webinar-poster-maker',
    color: 'from-blue-500 to-teal-500',
    category: 'Business',
    popular: false
  },
  {
    name: 'Event Poster Designer',
    description: 'Create stunning posters for any type of event',
    icon: Calendar,
    href: '/tools/event-poster-designer',
    color: 'from-indigo-500 to-purple-500',
    category: 'Events',
    popular: false
  },
  {
    name: 'Music Album Cover',
    description: 'Professional album artwork for musicians and bands',
    icon: Music,
    href: '/tools/music-album-cover',
    color: 'from-purple-600 to-pink-600',
    category: 'Music',
    popular: true
  }
]

const categories = [
  { name: 'All', count: tools.length },
  { name: 'Social', count: tools.filter(t => t.category === 'Social').length },
  { name: 'Business', count: tools.filter(t => t.category === 'Business').length },
  { name: 'Inspiration', count: tools.filter(t => t.category === 'Inspiration').length },
  { name: 'Entertainment', count: tools.filter(t => t.category === 'Entertainment').length },
  { name: 'Video', count: tools.filter(t => t.category === 'Video').length },
  { name: 'Music', count: tools.filter(t => t.category === 'Music').length },
  { name: 'Events', count: tools.filter(t => t.category === 'Events').length },
  { name: 'Publishing', count: tools.filter(t => t.category === 'Publishing').length },
  { name: 'Gaming', count: tools.filter(t => t.category === 'Gaming').length },
  { name: 'Audio', count: tools.filter(t => t.category === 'Audio').length },
  { name: 'Analytics', count: tools.filter(t => t.category === 'Analytics').length },
  { name: 'Hub', count: tools.filter(t => t.category === 'Hub').length }
]

export default function ToolsHubClient({ locale, translations: t }: ToolsHubClientProps) {
  const breadcrumbItems = [
    { name: 'Tools', current: true }
  ]

  return (
    <>
      <BreadcrumbWrapper>
        <Breadcrumb items={breadcrumbItems} />
      </BreadcrumbWrapper>

      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full text-purple-700 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Free AI-Powered Design Tools
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Professional Design Tools for Every Need
              </h1>
              
              <p className="text-xl text-gray-900 mb-8 leading-relaxed">
                From anime posters to event banners, create stunning designs with our specialized AI tools. 
                All tools are free to use with no watermarks on your final designs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                  onClick={() => {
                    const popularTool = tools.find(t => t.popular)
                    if (popularTool) {
                      window.location.href = `/${locale}${popularTool.href}`
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try Popular Tools
                </Button>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10+</div>
                  <div className="text-sm text-gray-900">Design Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-900">Free to Use</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">HD</div>
                  <div className="text-sm text-gray-900">Quality Export</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 whitespace-nowrap transition-colors"
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Card key={tool.name} className="group hover:shadow-lg transition-shadow relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        {tool.new && (
                          <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                            New
                          </div>
                        )}
                        {tool.trending && (
                          <div className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {tool.growth}
                          </div>
                        )}
                        {tool.popular && !tool.new && !tool.trending && (
                          <div className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                            Popular
                          </div>
                        )}
                        {tool.kd && (
                          <div className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                            KD: {tool.kd}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <Link href={`/${locale}${tool.href}`} className="block">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                            {tool.name}
                          </h3>
                          
                          <p className="text-gray-900 mb-4">
                            {tool.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                              {tool.category}
                            </span>
                            <span className="text-purple-600 group-hover:translate-x-1 transition-transform">
                              →
                            </span>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Use Our Design Tools?
              </h2>
              <p className="text-lg text-gray-900">
                Professional features that make design accessible to everyone
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered</h3>
                <p className="text-sm text-gray-900">Smart design suggestions and instant generation</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">No Watermarks</h3>
                <p className="text-sm text-gray-900">Clean exports for professional use</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Image className="w-6 h-6 text-blue-600" aria-label="HD Quality" />
                </div>
                <h3 className="font-semibold mb-2">HD Quality</h3>
                <p className="text-sm text-gray-900">High-resolution exports for all purposes</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-gray-900">Generate designs in seconds, not hours</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Creating Amazing Designs Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Choose from our collection of specialized design tools
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explore All Tools
            </Button>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg prose-seo">
              <h2>Free AI Design Tools for Content Creators</h2>
              <p>
                In the digital age, visual content is essential for capturing attention and conveying messages 
                effectively. Our collection of AI-powered design tools makes professional-quality design accessible 
                to everyone, regardless of technical skill or budget.
              </p>
              
              <h3>Specialized Tools for Every Need</h3>
              <p>
                Rather than offering a one-size-fits-all solution, we've developed specialized tools for specific 
                design needs. Each tool is optimized for its particular use case:
              </p>
              <ul>
                <li><strong>Anime Poster Maker:</strong> Leverages AI to create authentic anime-style artwork</li>
                <li><strong>Event Cover Tools:</strong> Optimized for driving attendance and RSVPs</li>
                <li><strong>Music Cover Creators:</strong> Designed with music industry standards in mind</li>
                <li><strong>Gaming Art Generators:</strong> Epic designs that capture gaming culture</li>
                <li><strong>Book Cover Designer:</strong> Professional layouts that sell books</li>
              </ul>
              
              <h3>AI Technology That Understands Design</h3>
              <p>
                Our AI doesn't just generate random images. It understands design principles, color theory, 
                typography, and composition. Each tool is trained on successful examples from its specific 
                category, ensuring outputs that not only look good but also serve their intended purpose effectively.
              </p>
              
              <h3>Free Forever, No Compromises</h3>
              <p>
                Unlike many design tools that limit features or add watermarks to free versions, we believe in 
                providing full access to everyone. All our tools are completely free to use, with no watermarks, 
                no quality limitations, and no hidden fees. This democratizes design, allowing students, small 
                businesses, and creators to produce professional content without breaking the bank.
              </p>
              
              <h3>Perfect for Modern Content Creation</h3>
              <p>
                Whether you're a YouTuber needing eye-catching thumbnails, a musician creating playlist covers, 
                an event organizer promoting your next gathering, or an author designing book covers, our tools 
                are built for the modern content ecosystem. Each tool exports in the exact dimensions and formats 
                required by various platforms and use cases.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}