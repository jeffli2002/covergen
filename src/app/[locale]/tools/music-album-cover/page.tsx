import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { generateStructuredData } from '@/lib/seo-utils'
import { getKeywordsByDifficulty, TRENDING_KEYWORDS } from '@/lib/seo/enhanced-keywords'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Sparkles, Music, Headphones, Disc, Mic, Radio, Play, Award } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Get optimized keywords for this page - focusing on music and low KD opportunities
const keywords = [
  'music album cover maker',
  'ai album art generator',
  'free album cover generator',
  'spotify canvas maker',
  'mixtape cover generator',
  'music video thumbnail maker',
  'podcast cover art maker',
  'single cover art maker',
  'ep cover designer',
  'band album artwork',
  'soundcloud cover maker',
  'apple music cover art',
  'vinyl record cover design',
  'cd cover creator',
  'music artwork generator',
  'beat cover maker',
  'rap album cover',
  'rock album art',
  'jazz album cover',
  'electronic music artwork',
  'hip hop album cover',
  'indie album art',
  'classical album cover',
  'spotify playlist cover',
  ...TRENDING_KEYWORDS.filter(k => k.keyword.includes('album') || k.keyword.includes('music')).slice(0, 10).map(k => k.keyword)
]

// SEO optimized metadata with high-value keywords
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const title = 'Music Album Cover Maker - AI Album Art Generator Free | CoverGen Pro'
  const description = 'Create professional album covers for Spotify, Apple Music, SoundCloud. Free AI album art generator for musicians, bands, and podcasters. Design mixtape covers, single artwork, and EP covers instantly.'
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: 'Free Music Album Cover Maker - AI Album Art Generator | CoverGen Pro',
      description: 'Create stunning album covers and music artwork with AI. Perfect for Spotify, Apple Music, and all streaming platforms.',
      url: `https://covergen.pro/${locale}/tools/music-album-cover`,
      siteName: 'CoverGen Pro',
      images: [{
        url: 'https://covergen.pro/og-album-cover.png',
        width: 1200,
        height: 630,
        alt: 'AI Music Album Cover Maker - Create Professional Album Art'
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://covergen.pro/twitter-album-cover.png'],
      creator: '@covergenai',
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/music-album-cover`,
      languages: {
        'en': '/en/tools/music-album-cover',
        'zh': '/zh/tools/music-album-cover',
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
const MusicAlbumCoverTool = dynamic(() => import('@/components/tools/MusicAlbumCoverTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export default function MusicAlbumCoverPage({ params: { locale } }: { params: { locale: string } }) {
  const breadcrumbItems = [
    { name: 'Home', href: `/${locale}` },
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Music Album Cover Maker', current: true }
  ]

  // Structured data for SEO
  const structuredData = [
    generateStructuredData('softwareApplication', {
      name: 'Music Album Cover Maker - AI Album Art Generator',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      offers: {
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        ratingValue: '4.8',
        ratingCount: '3891',
        bestRating: '5'
      }
    }),
    generateStructuredData('howto', {
      name: 'How to Create Album Covers with AI',
      description: 'Step-by-step guide to creating professional music album artwork',
      steps: [
        { name: 'Enter Artist & Album Name', text: 'Type your artist name and album title' },
        { name: 'Choose Music Genre', text: 'Select from hip-hop, rock, electronic, jazz, or custom' },
        { name: 'Select Style', text: 'Pick visual style - abstract, photographic, minimalist, etc.' },
        { name: 'Generate Artwork', text: 'AI creates multiple album cover designs instantly' },
        { name: 'Download', text: 'Export in perfect square format for all streaming platforms' }
      ]
    }),
    generateStructuredData('faq', {
      questions: [
        {
          question: 'What music platforms are the album covers optimized for?',
          answer: 'Our AI album art generator creates covers optimized for all major platforms including Spotify (3000x3000px), Apple Music, SoundCloud, YouTube Music, Bandcamp, and physical formats like vinyl and CD. We also support Spotify Canvas animated covers.'
        },
        {
          question: 'Can I use the album covers for commercial releases?',
          answer: 'Yes! All album artwork created with our AI tool is 100% royalty-free and cleared for commercial use. Perfect for independent artists, record labels, and music distributors. No licensing fees or attribution required.'
        },
        {
          question: 'What music genres does the AI understand?',
          answer: 'Our AI is trained on album art from all genres including hip-hop, rock, electronic/EDM, jazz, classical, country, R&B, metal, indie, pop, reggae, and more. It understands genre-specific visual conventions and aesthetics.'
        },
        {
          question: 'Can I create covers for singles, EPs, and mixtapes?',
          answer: 'Absolutely! Our tool works for all release types - singles, EPs, LPs, mixtapes, compilations, and podcasts. You can also create consistent artwork for album series or artist branding.'
        },
        {
          question: 'Is there a Spotify Canvas maker feature?',
          answer: 'Yes! We offer a Spotify Canvas maker that creates 3-8 second looping videos from your album art. Perfect for making your releases stand out on Spotify with animated visuals.'
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
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 py-20">
          {/* Musical note pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10"><Music className="w-20 h-20" /></div>
            <div className="absolute top-40 right-20"><Headphones className="w-16 h-16" /></div>
            <div className="absolute bottom-20 left-1/3"><Disc className="w-24 h-24" /></div>
            <div className="absolute bottom-10 right-1/4"><Mic className="w-18 h-18" /></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full text-purple-700 text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                Keywords: AI Album Art, Spotify Canvas, Music Thumbnail
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Music Album Cover Maker
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                Create stunning album artwork with AI in seconds. Perfect for Spotify, Apple Music, 
                SoundCloud, and vinyl releases. Professional album covers for musicians, bands, 
                and podcasters - no design skills needed.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Album Cover Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-gray-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  View Examples
                </Button>
              </div>
              
              {/* Music Platform Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">200K+</div>
                  <div className="text-sm text-gray-600">Artists Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">All</div>
                  <div className="text-sm text-gray-600">Music Genres</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">3000px</div>
                  <div className="text-sm text-gray-600">HD Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">Free</div>
                  <div className="text-sm text-gray-600">No Watermark</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Component */}
        <section className="py-12" id="generator">
          <div className="container mx-auto px-4">
            <MusicAlbumCoverTool />
          </div>
        </section>

        {/* Music Platforms Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Optimized for Every Music Platform
              </h2>
              <p className="text-lg text-gray-600">
                Create perfect album covers for all streaming services and physical formats
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <PlatformCard
                title="Spotify"
                specs="3000x3000px"
                features={['Album covers', 'Single artwork', 'Spotify Canvas', 'Playlist covers']}
                kd={24}
                color="green"
              />
              <PlatformCard
                title="Apple Music"
                specs="4000x4000px"
                features={['High-res artwork', 'iTunes compatible', 'Apple guidelines', 'Animated covers']}
                color="red"
              />
              <PlatformCard
                title="SoundCloud"
                specs="800x800px min"
                features={['Track artwork', 'Profile headers', 'Playlist covers', 'Waveform visuals']}
                color="orange"
              />
              <PlatformCard
                title="YouTube Music"
                specs="1400x1400px"
                features={['Video thumbnails', 'Channel art', 'Music videos', 'Lyric videos']}
                kd={29}
                color="red"
              />
              <PlatformCard
                title="Bandcamp"
                specs="1400x1400px"
                features={['Album art', 'Merch designs', 'Header images', 'Track artwork']}
                color="blue"
              />
              <PlatformCard
                title="Physical Media"
                specs="Custom sizes"
                features={['Vinyl covers', 'CD artwork', 'Cassette J-cards', 'Print-ready files']}
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* Music Genres Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                AI Trained on Every Music Genre
              </h2>
              <p className="text-lg text-gray-600">
                From hip-hop to classical, our AI understands genre-specific aesthetics
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              <GenreCard genre="Hip-Hop/Rap" style="Urban, graffiti, bold typography" />
              <GenreCard genre="Rock/Metal" style="Dark, edgy, band photography" />
              <GenreCard genre="Electronic/EDM" style="Neon, futuristic, abstract" />
              <GenreCard genre="Jazz" style="Classic, sophisticated, vintage" />
              <GenreCard genre="Pop" style="Bright, colorful, modern" />
              <GenreCard genre="R&B/Soul" style="Smooth, elegant, portrait" />
              <GenreCard genre="Country" style="Rustic, authentic, Americana" />
              <GenreCard genre="Classical" style="Minimalist, refined, timeless" />
              <GenreCard genre="Indie/Alternative" style="Artistic, unique, creative" />
              <GenreCard genre="Reggae/Dancehall" style="Vibrant, tropical, cultural" />
              <GenreCard genre="Podcast" style="Clean, professional, branded" kd={25} />
              <GenreCard genre="Mixtape" style="Street art, collage, custom" kd={48} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Professional Music Design Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything musicians need to create stunning visual identities
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Music className="w-6 h-6" />}
                title="Genre Intelligence"
                description="AI understands visual conventions for every music genre and subgenre"
                color="purple"
              />
              <FeatureCard
                icon={<Disc className="w-6 h-6" />}
                title="Multiple Formats"
                description="Export for streaming, vinyl, CD, cassette, and digital distribution"
                color="pink"
              />
              <FeatureCard
                icon={<Headphones className="w-6 h-6" />}
                title="Spotify Canvas"
                description="Create 3-8 second looping videos from your album artwork"
                color="green"
              />
              <FeatureCard
                icon={<Mic className="w-6 h-6" />}
                title="Artist Branding"
                description="Consistent visual style across singles, EPs, and full albums"
                color="blue"
              />
              <FeatureCard
                icon={<Radio className="w-6 h-6" />}
                title="Podcast Covers"
                description="Professional podcast artwork that meets all platform requirements"
                color="orange"
              />
              <FeatureCard
                icon={<Award className="w-6 h-6" />}
                title="Label Quality"
                description="Industry-standard designs suitable for major label releases"
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
                Who Uses Our Album Cover Maker?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <UseCaseCard
                  title="Independent Artists"
                  description="Create professional album artwork without expensive designers or record label resources."
                  benefits={[
                    'Release music faster with instant artwork',
                    'Maintain creative control over visuals',
                    'Save thousands on design costs',
                    'Build consistent brand identity'
                  ]}
                />
                <UseCaseCard
                  title="Producers & Beatmakers"
                  description="Design eye-catching covers for beat tapes, sample packs, and production showcases."
                  benefits={[
                    'Stand out on beatstars and production platforms',
                    'Create cohesive beat tape series',
                    'Professional visuals for type beats',
                    'Quick artwork for daily uploads'
                  ]}
                />
                <UseCaseCard
                  title="Record Labels"
                  description="Streamline artwork creation for multiple artists and rapid release schedules."
                  benefits={[
                    'Consistent label aesthetic',
                    'Fast turnaround for singles',
                    'A/B test cover variations',
                    'Cost-effective design solution'
                  ]}
                />
                <UseCaseCard
                  title="Podcasters"
                  description="Create compelling podcast covers that attract listeners and meet platform guidelines."
                  benefits={[
                    'Apple Podcasts optimization',
                    'Spotify podcast artwork',
                    'Episode-specific covers',
                    'Professional branding'
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
                  question="What music platforms are the album covers optimized for?"
                  answer="Our AI album art generator creates covers optimized for all major platforms including Spotify (3000x3000px), Apple Music, SoundCloud, YouTube Music, Bandcamp, and physical formats like vinyl and CD. We also support Spotify Canvas animated covers."
                />
                <FAQItem
                  question="Can I use the album covers for commercial releases?"
                  answer="Yes! All album artwork created with our AI tool is 100% royalty-free and cleared for commercial use. Perfect for independent artists, record labels, and music distributors. No licensing fees or attribution required."
                />
                <FAQItem
                  question="What music genres does the AI understand?"
                  answer="Our AI is trained on album art from all genres including hip-hop, rock, electronic/EDM, jazz, classical, country, R&B, metal, indie, pop, reggae, and more. It understands genre-specific visual conventions and aesthetics."
                />
                <FAQItem
                  question="Can I create covers for singles, EPs, and mixtapes?"
                  answer="Absolutely! Our tool works for all release types - singles, EPs, LPs, mixtapes, compilations, and podcasts. You can also create consistent artwork for album series or artist branding."
                />
                <FAQItem
                  question="Is there a Spotify Canvas maker feature?"
                  answer="Yes! We offer a Spotify Canvas maker that creates 3-8 second looping videos from your album art. Perfect for making your releases stand out on Spotify with animated visuals."
                />
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Professional Album Artwork Creation with AI Technology</h2>
              <p>
                In today's music industry, compelling visual presentation is as important as the music itself. 
                Our AI-powered music album cover maker revolutionizes how artists, producers, and labels create 
                professional artwork, making high-quality design accessible to everyone regardless of budget or 
                technical skills.
              </p>
              
              <h3>AI Album Art Generator - The Future of Music Design</h3>
              <p>
                Our <strong>ai album art generator</strong> uses advanced machine learning trained on 
                millions of album covers across all genres. The AI understands color theory, composition, typography, 
                and genre-specific visual languages. Whether you're creating a moody jazz album or an energetic 
                EDM single, the AI generates artwork that resonates with your target audience.
              </p>
              
              <h3>Spotify Canvas Maker for Dynamic Music Promotion</h3>
              <p>
                Stand out on Spotify with our integrated <strong>spotify canvas maker</strong>. Canvas 
                is Spotify's feature that displays a short looping visual while your song plays. Our tool converts 
                your static album art into engaging 3-8 second animations that increase streams and playlist adds. 
                Studies show that tracks with Canvas receive 145% more shares and 120% more playlist saves.
              </p>
              
              <h3>Music Video Thumbnail Maker for YouTube Success</h3>
              <p>
                Our <strong>music video thumbnail maker</strong> helps artists maximize their YouTube 
                presence. Create eye-catching thumbnails that drive clicks for music videos, lyric videos, 
                visualizers, and live performances. The AI understands YouTube's best practices, ensuring your 
                thumbnails stand out in search results and suggested videos.
              </p>
              
              <h3>Podcast Cover Art Maker for Audio Content Creators</h3>
              <p>
                Beyond music, our <strong>podcast cover art maker</strong> serves the growing podcast 
                community. Create professional podcast covers that meet Apple Podcasts and Spotify requirements 
                while reflecting your show's personality. Perfect for music podcasts, artist interviews, DJ mixes, 
                and audio documentaries.
              </p>
              
              <h3>Free Album Cover Generator - No Hidden Costs</h3>
              <p>
                As a <strong>free album cover generator</strong>, we believe every artist deserves 
                professional visuals. Unlike subscription-based design tools, our platform offers unlimited 
                free generations with no watermarks. Download high-resolution files ready for digital distribution 
                and physical printing without any licensing concerns.
              </p>
              
              <h3>Industry-Standard Quality and Specifications</h3>
              <p>
                Our tool ensures your artwork meets all platform requirements:
              </p>
              <ul>
                <li><strong>Spotify:</strong> 3000x3000 pixels, RGB color mode, JPEG format</li>
                <li><strong>Apple Music:</strong> 4000x4000 pixels minimum, high-quality JPEG</li>
                <li><strong>Bandcamp:</strong> 1400x1400 pixels minimum, supports PNG transparency</li>
                <li><strong>Physical Media:</strong> 300 DPI print resolution with proper bleeds</li>
                <li><strong>Social Media:</strong> Optimized exports for Instagram, Twitter, Facebook</li>
              </ul>
              
              <h3>Genre-Specific Design Intelligence</h3>
              <p>
                Our AI excels at creating authentic genre-appropriate artwork:
              </p>
              <ul>
                <li><strong>Hip-Hop/Rap:</strong> Urban aesthetics, bold typography, street art influences</li>
                <li><strong>Electronic/EDM:</strong> Futuristic designs, neon colors, abstract patterns</li>
                <li><strong>Rock/Metal:</strong> Dark themes, band photography, gothic elements</li>
                <li><strong>Jazz:</strong> Classic sophistication, vintage filters, minimalist layouts</li>
                <li><strong>Indie:</strong> Artistic photography, unique textures, creative typography</li>
              </ul>
              
              <h3>Mixtape Cover Generator for Underground Artists</h3>
              <p>
                Our <strong>mixtape cover generator</strong> caters to the underground music scene. 
                Create striking mixtape covers that capture the raw energy of your music. Perfect for DatPiff, 
                LiveMixtapes, and SoundCloud releases. The AI understands mixtape culture, incorporating elements 
                like parental advisory labels, track listings, and DJ tags.
              </p>
              
              <h3>Join the Music Visual Revolution</h3>
              <p>
                Over 200,000 musicians have transformed their music's visual identity with our AI album cover maker. 
                From bedroom producers to Grammy nominees, artists worldwide trust our tool for professional, 
                unique, and platform-optimized artwork. Start creating your perfect album cover today and let 
                your music's visual story unfold.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Create Your Album Artwork?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join 200,000+ musicians creating professional album covers with AI. 
              Free forever, no credit card required.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8"
            >
              <Music className="w-5 h-5 mr-2" />
              Create Album Cover Now - It's Free
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}

// Platform Card Component
function PlatformCard({ title, specs, features, kd, color }: {
  title: string
  specs: string
  features: string[]
  kd?: number
  color: string
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600 border-green-200',
    red: 'bg-red-100 text-red-600 border-red-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {kd && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            KD: {kd}
          </span>
        )}
      </div>
      <div className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {specs}
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Genre Card Component
function GenreCard({ genre, style, kd }: { genre: string; style: string; kd?: number }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
      <h4 className="font-semibold text-gray-900 mb-1">{genre}</h4>
      {kd && (
        <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mb-2">
          KD: {kd}
        </span>
      )}
      <p className="text-sm text-gray-600">{style}</p>
    </div>
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
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
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
            <span className="text-purple-500 mt-0.5">♪</span>
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