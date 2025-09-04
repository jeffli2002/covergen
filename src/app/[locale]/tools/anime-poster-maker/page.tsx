import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Star, Wand2, Heart, Palette, Download, Zap, Share2, Shield } from 'lucide-react'

// Lazy load the tool component
const AnimePosterTool = dynamic(() => import('@/components/tools/AnimePosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Anime Poster Maker - Create Stunning Anime Posters with AI | CoverGen Pro',
  description: 'Design professional anime posters in seconds with our AI-powered anime poster maker. Choose from 100+ anime styles, add Japanese text, and create eye-catching designs for your anime content.',
  keywords: 'anime poster maker, anime poster generator, anime poster creator, anime poster design, manga poster maker, anime art generator, anime cover maker',
  openGraph: {
    title: 'Free Anime Poster Maker - AI Anime Art Generator | CoverGen Pro',
    description: 'Create stunning anime posters with AI. Perfect for manga covers, anime events, and otaku content.',
    type: 'website',
  },
}

export default function AnimePosterMakerPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 py-20">
        <div className="container mx-auto px-4">
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
            </div>
            
            {/* Trust Indicators */}
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
                <div className="text-3xl font-bold text-white">Free</div>
                <div className="text-sm text-white/80">No Watermark</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">HD</div>
                <div className="text-sm text-white/80">Export Quality</div>
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
      <section className="py-20">
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
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                100+ Anime Styles
              </h3>
              <p className="text-gray-600">
                From classic manga to modern anime styles
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Japanese Typography
              </h3>
              <p className="text-gray-600">
                Authentic Japanese text and fonts
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                HD Export
              </h3>
              <p className="text-gray-600">
                High resolution for print and digital use
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Instant Generation
              </h3>
              <p className="text-gray-600">
                AI creates multiple designs in seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Multi-Format Export
              </h3>
              <p className="text-gray-600">
                Perfect for social media, print, or web
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Original Artwork
              </h3>
              <p className="text-gray-600">
                Unique designs with no copyright issues
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Anime Styles Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Anime Poster Styles
            </h2>
            <p className="text-lg text-gray-600">
              Get inspired by these trending anime art styles
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🌸</div>
              <h3 className="font-semibold text-gray-900 mb-2">Shojo Romance</h3>
              <p className="text-sm text-gray-600">Soft pastels, floral elements, dreamy</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">⚔️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Shonen Action</h3>
              <p className="text-sm text-gray-600">Dynamic poses, speed lines, impact</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎌</div>
              <h3 className="font-semibold text-gray-900 mb-2">Traditional Manga</h3>
              <p className="text-sm text-gray-600">Black & white, screentones, classic</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Kawaii Cute</h3>
              <p className="text-sm text-gray-600">Chibi style, bright colors, sparkles</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-semibold text-gray-900 mb-2">Mecha Sci-Fi</h3>
              <p className="text-sm text-gray-600">Metallic textures, tech elements</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🌙</div>
              <h3 className="font-semibold text-gray-900 mb-2">Dark Fantasy</h3>
              <p className="text-sm text-gray-600">Gothic themes, mysterious atmosphere</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="font-semibold text-gray-900 mb-2">Isekai Adventure</h3>
              <p className="text-sm text-gray-600">RPG elements, fantasy worlds</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🍜</div>
              <h3 className="font-semibold text-gray-900 mb-2">Slice of Life</h3>
              <p className="text-sm text-gray-600">Everyday scenes, warm colors</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Amazing Anime Art?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of anime fans creating stunning posters with AI
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
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">The Ultimate Anime Poster Maker</h2>
            <p>
              Creating professional anime posters has never been easier with our AI-powered anime poster maker. 
              Whether you're designing for anime conventions, creating fan art, or producing promotional materials 
              for your manga, our tool delivers authentic anime aesthetics that capture the essence of Japanese animation.
            </p>
            
            <h3>Authentic Anime Art Styles</h3>
            <p>
              Our AI understands the nuanced differences between various anime and manga styles. From the dynamic 
              action lines of shonen manga to the delicate expressions of shojo romance, from the cute chibi 
              characters to the detailed mecha designs, our anime poster generator captures it all. Each style 
              is carefully trained to maintain authenticity while allowing for creative customization.
            </p>
            
            <h3>Japanese Typography Support</h3>
            <p>
              What sets our anime poster maker apart is full support for Japanese text. Add authentic hiragana, 
              katakana, and kanji characters to your posters. Our system includes proper Japanese fonts and 
              typography rules, ensuring your text looks professional whether you're creating titles, character 
              names, or stylized logos common in anime branding.
            </p>
            
            <h3>Perfect for Every Anime Fan</h3>
            <p>
              Whether you're a content creator making YouTube thumbnails, an event organizer promoting anime 
              conventions, an artist showcasing original characters, or a business targeting the otaku market, 
              our tool provides everything you need. Create posters for cosplay events, anime club meetings, 
              manga reviews, or fan merchandise - all with professional quality that rivals official anime artwork.
            </p>
            
            <h3>Free Anime Poster Creation</h3>
            <p>
              We believe creativity shouldn't be limited by budget. Our anime poster maker is completely free 
              with no watermarks on your creations. Generate unlimited anime posters for personal projects, 
              social media, or non-commercial use. Pro users gain access to premium styles, higher resolutions, 
              and commercial licensing for professional projects.
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
                  What anime styles does the poster maker support?
                </h3>
                <p className="text-gray-600">
                  Our AI anime poster maker supports all popular anime and manga styles including shonen (action), 
                  shojo (romance), seinen (mature), kawaii (cute), mecha, isekai, and more. You can also create 
                  custom styles by describing your vision.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I add Japanese text to my anime posters?
                </h3>
                <p className="text-gray-600">
                  Yes! Our tool fully supports Japanese text including hiragana, katakana, and kanji. You can add 
                  titles, character names, and stylized Japanese typography. We also provide romanization options 
                  for international audiences.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is this suitable for anime event posters?
                </h3>
                <p className="text-gray-600">
                  Absolutely! Create professional posters for anime conventions, cosplay events, anime club meetings, 
                  screening parties, and more. Our templates are optimized for both print and digital promotion.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I use the generated posters commercially?
                </h3>
                <p className="text-gray-600">
                  Free users can create unlimited posters for personal use. For commercial use, including selling 
                  merchandise or using in paid promotions, you'll need a Pro subscription which includes commercial 
                  licensing rights.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What resolution are the exported posters?
                </h3>
                <p className="text-gray-600">
                  Free users can export posters in HD quality (1920x1080). Pro users get access to 4K resolution 
                  (3840x2160) and print-ready formats with 300 DPI for professional printing needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}