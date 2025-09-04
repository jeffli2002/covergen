import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Facebook, Calendar, Share2, Eye, TrendingUp } from 'lucide-react'

// Lazy load the tool component
const FacebookEventCoverTool = dynamic(() => import('@/components/tools/FacebookEventCoverTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Facebook Event Cover Maker - Create Event Banners | CoverGen Pro',
  description: 'Design perfect Facebook event covers with AI. Optimized 1200x628 dimensions for maximum engagement. Create covers that boost event attendance.',
  keywords: 'facebook event cover, facebook event banner, social media event cover, event cover photo, facebook event image',
  openGraph: {
    title: 'Facebook Event Cover Maker - AI-Powered Design | CoverGen Pro',
    description: 'Create engaging Facebook event covers that drive attendance. Perfect dimensions and designs.',
    type: 'website',
  },
}

export default function FacebookEventCoverPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <Facebook className="w-4 h-4" />
              Optimized for Facebook Events
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Facebook Event Cover Maker
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Create perfect 1200x628 event covers that maximize attendance. 
              Designed specifically for Facebook's event platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#generator">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Event Cover
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Component */}
      <section className="py-12" id="generator">
        <div className="container mx-auto px-4">
          <FacebookEventCoverTool />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Facebook Event Features
            </h2>
            <p className="text-lg text-gray-600">
              Optimized for Facebook's event platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Perfect Dimensions
              </h3>
              <p className="text-gray-600">
                1200x628 pixels optimized for all devices
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Boost Attendance
              </h3>
              <p className="text-gray-600">
                Designs proven to increase event engagement
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Share-Worthy
              </h3>
              <p className="text-gray-600">
                Create covers people want to share
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}