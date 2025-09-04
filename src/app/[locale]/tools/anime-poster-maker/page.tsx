import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Star, Wand2, Heart, Palette, Download } from 'lucide-react'

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
              anime events, fan art, and otaku content.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          </div>
        </div>
      </section>
    </div>
  )
}