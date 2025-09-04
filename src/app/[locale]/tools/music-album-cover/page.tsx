import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Music, Disc, Headphones, Mic, Radio } from 'lucide-react'

// Lazy load the tool component
const MusicAlbumCoverTool = dynamic(() => import('@/components/tools/MusicAlbumCoverTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Music Album Cover Maker - AI Album Art Generator | CoverGen Pro',
  description: 'Create professional album covers for Spotify, Apple Music, SoundCloud. Free AI album art generator for musicians, bands, and producers.',
  keywords: 'music album cover maker, album art generator, album cover creator, mixtape cover, spotify album art, band album cover',
  openGraph: {
    title: 'Free Music Album Cover Maker - AI Album Art | CoverGen Pro',
    description: 'Design stunning album covers with AI. Perfect for all music genres and streaming platforms.',
    type: 'website',
  },
}

export default function MusicAlbumCoverPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <Music className="w-4 h-4" />
              Professional Album Art
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Music Album Cover Maker
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Create stunning album covers that capture your music's soul. 
              Perfect for all streaming platforms and physical releases.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#generator">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Album Cover
                </Button>
              </Link>
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

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Music Design Features
            </h2>
            <p className="text-lg text-gray-600">
              Everything musicians need for perfect album art
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Disc className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Genres
              </h3>
              <p className="text-gray-600">
                From hip-hop to classical, we've got you covered
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Streaming Ready
              </h3>
              <p className="text-gray-600">
                Optimized for Spotify, Apple Music, and more
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Artist Focused
              </h3>
              <p className="text-gray-600">
                Designs that represent your unique sound
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}