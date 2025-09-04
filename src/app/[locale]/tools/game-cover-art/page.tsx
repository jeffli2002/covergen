import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Gamepad2, Sword, Zap, Trophy, Shield } from 'lucide-react'

// Lazy load the tool component
const GameCoverArtTool = dynamic(() => import('@/components/tools/GameCoverArtTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Game Cover Art Creator - AI Game Art Generator | CoverGen Pro',
  description: 'Create stunning game cover art with AI. Perfect for indie games, Steam, mobile games, board games. Design professional game artwork in minutes.',
  keywords: 'game cover art, game cover creator, steam game cover, indie game art, game box art, video game cover',
  openGraph: {
    title: 'Game Cover Art Creator - Professional Game Design | CoverGen Pro',
    description: 'Design epic game covers for Steam, mobile, and indie games. AI-powered game art generation.',
    type: 'website',
  },
}

export default function GameCoverArtPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <Gamepad2 className="w-4 h-4" />
              Epic Game Artwork
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Game Cover Art Creator
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Create stunning game covers that capture your game's essence. 
              Perfect for Steam, mobile games, and indie titles.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#generator">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Game Cover
                </Button>
              </Link>
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

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Game Art Features
            </h2>
            <p className="text-lg text-gray-600">
              Professional tools for game developers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sword className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Genre-Specific Styles
              </h3>
              <p className="text-gray-600">
                From RPG to FPS, perfect for any game genre
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AAA Quality
              </h3>
              <p className="text-gray-600">
                Professional artwork that rivals big studios
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Platform Ready
              </h3>
              <p className="text-gray-600">
                Optimized for Steam, Epic, mobile stores
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}