import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Gamepad2, Sword, Zap, Trophy, Shield, Star, Wand2, Palette, Download, Share2, Target } from 'lucide-react'

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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-white/80">Game Genres</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">250K+</div>
                <div className="text-sm text-white/80">Games Designed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">Steam</div>
                <div className="text-sm text-white/80">Ready Format</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4K</div>
                <div className="text-sm text-white/80">Ultra HD</div>
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
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Custom Artwork
              </h3>
              <p className="text-gray-600">
                Unique visuals that represent your game
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Player-Focused Design
              </h3>
              <p className="text-gray-600">
                Covers that attract your target audience
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Multi-Format Export
              </h3>
              <p className="text-gray-600">
                Ready for all platforms and marketing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Game Genres Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Game Cover Styles
            </h2>
            <p className="text-lg text-gray-600">
              Covers designed for every gaming genre and platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">⚔️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Action/Adventure</h3>
              <p className="text-sm text-gray-600">Dynamic heroes, epic battles</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="font-semibold text-gray-900 mb-2">Indie Games</h3>
              <p className="text-sm text-gray-600">Creative, artistic, unique styles</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🧙</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fantasy RPG</h3>
              <p className="text-sm text-gray-600">Magic, dragons, medieval themes</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-900 mb-2">Sci-Fi</h3>
              <p className="text-sm text-gray-600">Futuristic, space, technology</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🔫</div>
              <h3 className="font-semibold text-gray-900 mb-2">FPS/Shooter</h3>
              <p className="text-sm text-gray-600">Intense combat, military themes</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-semibold text-gray-900 mb-2">Sports</h3>
              <p className="text-sm text-gray-600">Athletic, competitive, energetic</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile Games</h3>
              <p className="text-sm text-gray-600">Casual, colorful, accessible</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎲</div>
              <h3 className="font-semibold text-gray-900 mb-2">Strategy</h3>
              <p className="text-sm text-gray-600">Tactical, intelligent, complex</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Launch Your Game?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Create game covers that make players click "Buy Now"
          </p>
          <Link href="#generator">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Design Game Cover Now
            </Button>
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Professional Game Cover Art That Sells</h2>
            <p>
              In the competitive gaming industry, your cover art is often the first and most important interaction 
              potential players have with your game. Whether you're an indie developer launching on Steam, a mobile 
              game studio targeting app stores, or creating physical box art, our AI-powered game cover art creator 
              helps you design compelling visuals that capture your game's essence and attract your target audience.
            </p>
            
            <h3>Optimized for Every Gaming Platform</h3>
            <p>
              Different platforms have different requirements and audiences. Our game cover art creator understands 
              these nuances, generating Steam-optimized covers that work well as small thumbnails, mobile game icons 
              that pop on app stores, console box art that stands out on retail shelves, and promotional materials 
              perfect for social media marketing. Each design maintains your game's visual identity while meeting 
              platform-specific technical requirements.
            </p>
            
            <h3>Genre-Specific Visual Language</h3>
            <p>
              Gaming audiences have specific expectations for different genres. Our AI has been trained on thousands 
              of successful game covers across all genres. Fantasy RPGs get epic, magical aesthetics with rich 
              fantasy elements. FPS games receive bold, action-packed designs with military themes. Indie games get 
              unique, artistic treatments that reflect their creative nature. Horror games feature atmospheric, 
              chilling designs that promise thrills.
            </p>
            
            <h3>Psychology-Driven Design Elements</h3>
            <p>
              Successful game covers use specific psychological triggers to attract players. Our AI incorporates 
              proven design principles: character positioning that draws the eye, color schemes that evoke the right 
              emotions, typography that matches the game's tone, and composition that works at any size. The result 
              is cover art that not only looks professional but also performs well in converting browsers into buyers.
            </p>
            
            <h3>From Concept to Market-Ready</h3>
            <p>
              Game development is time-intensive, and marketing materials often come as an afterthought. Our tool 
              bridges this gap by creating market-ready cover art in minutes, not weeks. Generate multiple concepts 
              for A/B testing, create variations for different regions or platforms, and maintain consistent branding 
              across all your game's promotional materials. Perfect for developers who need professional results 
              without the professional budget.
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
                  What platforms are the covers optimized for?
                </h3>
                <p className="text-gray-600">
                  Our game covers work perfectly for Steam (460x215, 616x353), Epic Games Store, mobile app stores 
                  (iOS App Store, Google Play), console platforms (PlayStation, Xbox, Nintendo), and physical box art. 
                  We also provide social media sizes for marketing campaigns.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I include my game's characters and logo?
                </h3>
                <p className="text-gray-600">
                  Yes! Upload your game's logo, character artwork, screenshots, or concept art. Our AI will integrate 
                  these elements seamlessly into professional cover designs. You can also describe your characters 
                  or game world, and the AI will generate appropriate artwork.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What game genres does the tool support?
                </h3>
                <p className="text-gray-600">
                  All major genres are supported: Action, Adventure, RPG, FPS, Strategy, Puzzle, Horror, Sci-Fi, 
                  Fantasy, Sports, Racing, Simulation, Indie, Mobile, and more. Each genre has specialized templates 
                  and AI training to ensure authentic visual styling that appeals to genre fans.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I create covers for game series or DLC?
                </h3>
                <p className="text-gray-600">
                  Absolutely! Create consistent branding across your entire game franchise. Design main game covers, 
                  DLC/expansion covers, sequel covers, and special edition artwork that maintains visual cohesion. 
                  Perfect for building recognizable game series branding.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What resolution and formats are available?
                </h3>
                <p className="text-gray-600">
                  Free users get HD quality suitable for most digital platforms. Pro users get 4K resolution (3840x2160) 
                  and print-ready formats with CMYK color profiles for physical distribution. All major formats are 
                  supported: PNG, JPG, PDF, and vector formats for scalability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}