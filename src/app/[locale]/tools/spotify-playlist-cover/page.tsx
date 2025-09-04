import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { generateToolSchema, generateFAQSchema } from '@/lib/seo/schema'
import { getHighOpportunityKeywords } from '@/lib/seo/keyword-merger'

// Supported locales
const supportedLocales = ['en', 'es', 'zh', 'ja', 'ko', 'fr', 'de', 'pt', 'ar', 'hi']

// Get optimized keywords for this page including low KD terms
const keywords = [
  'spotify playlist cover maker',
  'spotify playlist cover',
  'spotify canvas maker', // KD: 24
  'spotify cover art generator',
  'playlist cover maker',
  'spotify playlist art',
  'spotify playlist cover generator',
  'custom spotify playlist cover',
  'spotify playlist thumbnail',
  'music playlist cover maker',
  'spotify cover design',
  'playlist artwork creator',
  'spotify playlist image maker',
  'free spotify playlist cover',
  'spotify playlist cover size',
  'spotify cover maker free',
  'apple music playlist cover', // Related keyword
  'music cover art generator',
  'album cover maker',
  ...getHighOpportunityKeywords().filter(k => k.keyword.includes('music') || k.keyword.includes('album')).map(k => k.keyword)
]

// SEO optimized metadata
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  if (!supportedLocales.includes(locale)) {
    notFound()
  }

  const title = 'Spotify Playlist Cover Maker - Free Canvas & Cover Art Generator | CoverGen Pro'
  const description = 'Create perfect 300x300 Spotify playlist covers with AI. Free playlist cover maker with Spotify Canvas support. Design stunning artwork for your music playlists in seconds.'

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: 'Free Spotify Playlist Cover Maker - AI Cover Art Generator',
      description,
      images: [
        {
          url: '/platform-examples/spotify-playlist-showcase.jpg',
          width: 1200,
          height: 630,
          alt: 'Spotify Playlist Cover Maker - Create Professional Music Artwork',
        },
      ],
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/platform-examples/spotify-playlist-showcase.jpg'],
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/spotify-playlist-cover`,
      languages: supportedLocales.reduce((acc, loc) => {
        acc[loc] = `https://covergen.pro/${loc}/tools/spotify-playlist-cover`
        return acc
      }, {} as Record<string, string>),
    },
    other: {
      'spotify-canvas': 'true',
      'music-cover-art': 'true',
      'playlist-generator': 'true',
    },
  }

  return metadata
}

// Lazy load components
const SpotifyPlaylistCoverClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

const SpotifyPlaylistCoverContent = dynamic(() => import('./enhanced-content'), {
  ssr: true
})

interface Props {
  params: { locale: string }
}

export default async function SpotifyPlaylistCoverPage({ params: { locale } }: Props) {
  if (!supportedLocales.includes(locale)) {
    notFound()
  }

  // Generate schema for SEO
  const toolSchema = generateToolSchema({
    name: 'Spotify Playlist Cover Maker',
    description: 'Create stunning Spotify playlist covers with AI. Perfect 300x300 pixel artwork for your music playlists. Also works as a Spotify Canvas maker.',
    url: `https://covergen.pro/${locale}/tools/spotify-playlist-cover`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      ratingValue: '4.8',
      ratingCount: '3521',
      bestRating: '5',
      worstRating: '1',
    },
  })

  const faqSchema = generateFAQSchema([
    {
      question: 'What size should a Spotify playlist cover be?',
      answer: 'Spotify playlist covers should be exactly 300x300 pixels in JPG or PNG format. Our Spotify playlist cover maker automatically generates images in the perfect dimensions with optimal file size under 4MB.',
    },
    {
      question: 'Can I use this tool to create Spotify Canvas videos?',
      answer: 'While our primary focus is static playlist covers, we also offer a Spotify Canvas maker feature that creates 3-8 second looping videos in the required 9:16 vertical format for Spotify Canvas.',
    },
    {
      question: 'Is the Spotify playlist cover maker free to use?',
      answer: 'Yes! Our basic Spotify playlist cover maker is completely free with no watermarks. You can create unlimited playlist covers for personal use. Pro features include advanced AI styles and batch creation.',
    },
    {
      question: 'Can I use the covers commercially for my music?',
      answer: 'Absolutely! All covers created with our tool are royalty-free and can be used commercially for your music releases, whether on Spotify, Apple Music, or any other platform.',
    },
    {
      question: 'How do I upload my custom playlist cover to Spotify?',
      answer: 'After creating your cover: 1) Open Spotify on desktop, 2) Right-click your playlist, 3) Select "Edit details", 4) Click the cover image, 5) Upload your new 300x300px cover. Changes sync across all devices.',
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
        <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-black text-white">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative container mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                Featured: Spotify Canvas Maker
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
                Spotify Playlist Cover Maker
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Create stunning 300x300 playlist covers with AI. Perfect for Spotify, Apple Music, and all streaming platforms.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-12">
                <a href="#tool" className="bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition-all transform hover:scale-105">
                  Create Playlist Cover Free
                </a>
                <a href="#examples" className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all">
                  View Examples
                </a>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-green-400">300x300</div>
                  <div className="text-sm text-white/70">Perfect Size</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">100K+</div>
                  <div className="text-sm text-white/70">Covers Created</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">Free</div>
                  <div className="text-sm text-white/70">No Watermark</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Spotify Wave Pattern */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-20">
              <path fill="white" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
            </svg>
          </div>
        </section>

        {/* Tool Section */}
        <section id="tool" className="py-12">
          <div className="container mx-auto px-4">
            <SpotifyPlaylistCoverClient locale={locale} translations={{}} />
          </div>
        </section>

        {/* Enhanced Content */}
        <SpotifyPlaylistCoverContent locale={locale} />
      </div>
    </>
  )
}