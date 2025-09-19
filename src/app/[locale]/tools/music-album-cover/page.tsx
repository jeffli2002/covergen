import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Music, Disc, Headphones, Mic, Radio, Star, Wand2, Palette, Download, Share2, Volume2 } from 'lucide-react'

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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">3000x3000</div>
                <div className="text-sm text-white/80">High Resolution</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1M+</div>
                <div className="text-sm text-white/80">Albums Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">All</div>
                <div className="text-sm text-white/80">Platforms Ready</div>
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
            <p className="text-lg text-gray-900">
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
              <p className="text-gray-900">
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
              <p className="text-gray-900">
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
              <p className="text-gray-900">
                Designs that represent your unique sound
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Custom Artwork
              </h3>
              <p className="text-gray-900">
                Unique designs that match your aesthetic
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Vinyl & CD Ready
              </h3>
              <p className="text-gray-900">
                Perfect for physical releases too
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Trend Aware
              </h3>
              <p className="text-gray-900">
                Styles that resonate with today's listeners
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Music Genres Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Album Cover Styles
            </h2>
            <p className="text-lg text-gray-900">
              Genre-specific designs that connect with your audience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎵</div>
              <h3 className="font-semibold text-gray-900 mb-2">Hip-Hop/Rap</h3>
              <p className="text-sm text-gray-900">Bold typography, urban aesthetics</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎸</div>
              <h3 className="font-semibold text-gray-900 mb-2">Rock/Metal</h3>
              <p className="text-sm text-gray-900">Dark themes, powerful imagery</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎧</div>
              <h3 className="font-semibold text-gray-900 mb-2">Electronic/EDM</h3>
              <p className="text-sm text-gray-900">Neon colors, futuristic vibes</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">💕</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pop</h3>
              <p className="text-sm text-gray-900">Bright colors, trendy aesthetics</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🌾</div>
              <h3 className="font-semibold text-gray-900 mb-2">Country/Folk</h3>
              <p className="text-sm text-gray-900">Natural elements, vintage feels</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎺</div>
              <h3 className="font-semibold text-gray-900 mb-2">Jazz/Blues</h3>
              <p className="text-sm text-gray-900">Sophisticated, artistic designs</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎻</div>
              <h3 className="font-semibold text-gray-900 mb-2">Classical</h3>
              <p className="text-sm text-gray-900">Elegant, timeless aesthetics</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎹</div>
              <h3 className="font-semibold text-gray-900 mb-2">R&B/Soul</h3>
              <p className="text-sm text-gray-900">Smooth, warm, emotional vibes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Release Your Music?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Create album covers that make your music unforgettable
          </p>
          <Link href="#generator">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating Now
            </Button>
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg prose-seo">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Professional Album Cover Design for Every Artist</h2>
            <p className="text-gray-900">
              In today's music landscape, your album cover is more than just artwork – it's your music's first impression, 
              a visual representation of your sound, and often the deciding factor in whether someone clicks play. Our 
              AI-powered music album cover maker helps independent artists, bands, producers, and record labels create 
              professional album artwork that captures their unique sound and attracts listeners across all platforms.
            </p>
            
            <h3 className="text-gray-900 font-semibold">Optimized for All Music Platforms</h3>
            <p className="text-gray-900">
              Different streaming platforms and music stores have specific requirements for album artwork. Our tool creates 
              covers that look perfect on Spotify, Apple Music, Amazon Music, SoundCloud, Bandcamp, and YouTube Music. 
              From the 3000x3000 pixel requirement for streaming platforms to the specific aspect ratios needed for 
              physical releases, every cover is generated with technical specifications in mind.
            </p>
            
            <h3 className="text-gray-900 font-semibold">Genre-Specific Visual Language</h3>
            <p className="text-gray-900">
              Music fans have visual expectations for different genres. Hip-hop albums often feature bold typography 
              and urban aesthetics, while electronic music embraces futuristic, neon-soaked visuals. Jazz covers tend 
              toward sophisticated, artistic designs, and country music often incorporates natural, vintage elements. 
              Our AI understands these genre conventions while helping you create something uniquely yours.
            </p>
            
            <h3 className="text-gray-900 font-semibold">Perfect for Independent Artists</h3>
            <p className="text-gray-900">
              Professional album cover design can cost hundreds of dollars and take weeks to complete. Our tool democratizes 
              music design, allowing independent artists to create professional-quality artwork in minutes. Whether you're 
              releasing a single, EP, or full album, generate multiple concepts, test different styles, and find the 
              perfect visual representation of your music without breaking the bank.
            </p>
            
            <h3 className="text-gray-900 font-semibold">From Digital to Physical</h3>
            <p className="text-gray-900">
              While streaming dominates music consumption, physical releases are experiencing a renaissance. Vinyl sales 
              are at their highest point in decades, and fans love collecting physical music. Our album covers are designed 
              to work beautifully at any size, from tiny streaming thumbnails to large vinyl gatefolds. Create cohesive 
              artwork that works across all formats and marketing materials.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What size should my album cover be?
                </h3>
                <p className="text-gray-900">
                  Most streaming platforms require 3000x3000 pixels at minimum, though we recommend this size as it 
                  works well everywhere. Our tool automatically generates covers at this optimal resolution. For vinyl 
                  or CD releases, we can also provide higher resolutions and print-ready formats with proper color profiles.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I include my band photo or artist image?
                </h3>
                <p className="text-gray-900">
                  Absolutely! Upload your photos, and our AI will incorporate them into professional album cover designs. 
                  Whether you want a prominent artist photo, subtle band imagery, or abstract representations, the tool 
                  can work with your existing visuals or generate completely new artwork based on your music's vibe.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do the covers work for singles, EPs, and albums?
                </h3>
                <p className="text-gray-900">
                  Yes! Our tool creates artwork suitable for any type of release. Whether you're dropping a single, 
                  releasing an EP, or launching a full album, the designs work perfectly. You can also create consistent 
                  artwork for series releases or maintain visual branding across your entire discography.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I use the covers for commercial releases?
                </h3>
                <p className="text-gray-900">
                  Free users can create covers for personal projects and independent releases. For major label releases, 
                  commercial distribution, or merchandise, you'll need a Pro subscription which includes full commercial 
                  licensing rights. This ensures you can use your artwork anywhere without legal concerns.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I make my album stand out on streaming platforms?
                </h3>
                <p className="text-gray-900">
                  Great album covers work at thumbnail size and grab attention in crowded feeds. Our AI creates designs 
                  with strong contrast, readable text even when small, and eye-catching visuals that stop scrollers. 
                  We also recommend testing your cover at different sizes to ensure it's effective across all contexts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}