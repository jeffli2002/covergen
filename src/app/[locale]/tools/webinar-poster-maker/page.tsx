import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Video, Users, Calendar, Presentation, Globe } from 'lucide-react'

// Lazy load the tool component
const WebinarPosterTool = dynamic(() => import('@/components/tools/WebinarPosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Webinar Poster Maker - Create Professional Webinar Graphics | CoverGen Pro',
  description: 'Design professional webinar posters with AI. Perfect for online events, workshops, training sessions. Create graphics that boost registration.',
  keywords: 'webinar poster maker, webinar graphic design, online event poster, workshop poster creator, training session graphics',
  openGraph: {
    title: 'Webinar Poster Maker - AI Event Graphics | CoverGen Pro',
    description: 'Create professional webinar graphics that drive registrations. Perfect for all online events.',
    type: 'website',
  },
}

export default function WebinarPosterMakerPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <Video className="w-4 h-4" />
              Professional Webinar Graphics
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Webinar Poster Maker
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Create compelling webinar graphics that boost attendance. 
              Perfect for online events, training sessions, and workshops.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#generator">
                <Button 
                  size="lg" 
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-8 shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Webinar Poster
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Component */}
      <section className="py-12" id="generator">
        <div className="container mx-auto px-4">
          <WebinarPosterTool />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Webinar Marketing Features
            </h2>
            <p className="text-lg text-gray-600">
              Professional tools for online events
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Presentation className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Professional Layouts
              </h3>
              <p className="text-gray-600">
                Clean, corporate designs that build trust
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Boost Registrations
              </h3>
              <p className="text-gray-600">
                Graphics optimized for maximum sign-ups
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Multi-Platform
              </h3>
              <p className="text-gray-600">
                Perfect for email, social, and landing pages
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}