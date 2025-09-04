import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Share2, TrendingUp, Heart, MessageCircle, Eye } from 'lucide-react'

// Lazy load the tool component
const SocialMediaPosterTool = dynamic(() => import('@/components/tools/SocialMediaPosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Social Media Poster Maker - Create Viral Content | CoverGen Pro',
  description: 'Design eye-catching social media posts with AI. Perfect for Instagram, Facebook, Twitter, LinkedIn. Create content that drives engagement.',
  keywords: 'social media poster maker, instagram post creator, facebook post design, twitter graphic maker, social media content creator',
  openGraph: {
    title: 'Social Media Poster Maker - AI Content Creator | CoverGen Pro',
    description: 'Create stunning social media posts that get noticed. Perfect for all platforms.',
    type: 'website',
  },
}

export default function SocialMediaPosterPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Boost Your Social Presence
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Social Media Poster Maker
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Create scroll-stopping content for all social platforms. 
              Design posts that drive engagement and grow your following.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#generator">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Social Post
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Component */}
      <section className="py-12" id="generator">
        <div className="container mx-auto px-4">
          <SocialMediaPosterTool />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Social Media Features
            </h2>
            <p className="text-lg text-gray-600">
              Tools to maximize your social impact
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Platform Optimized
              </h3>
              <p className="text-gray-600">
                Perfect dimensions for every social network
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Engagement Driven
              </h3>
              <p className="text-gray-600">
                Designs that get likes, shares, and comments
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Brand Consistent
              </h3>
              <p className="text-gray-600">
                Maintain your unique visual identity
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}