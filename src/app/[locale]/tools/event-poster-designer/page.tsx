import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, MapPin, Clock, Users, Megaphone } from 'lucide-react'

// Lazy load the tool component
const EventPosterTool = dynamic(() => import('@/components/tools/EventPosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Event Poster Designer - Create Stunning Event Posters | CoverGen Pro',
  description: 'Design professional event posters with AI. Perfect for concerts, conferences, parties, workshops. Create eye-catching promotional materials in minutes.',
  keywords: 'event poster designer, event poster maker, concert poster creator, party flyer maker, conference poster design',
  openGraph: {
    title: 'Free Event Poster Designer - AI Event Marketing Tool | CoverGen Pro',
    description: 'Create professional event posters that drive attendance. Perfect for all types of events.',
    type: 'website',
  },
}

export default function EventPosterDesignerPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              Professional Event Marketing
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Event Poster Designer
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Create stunning event posters that grab attention and drive attendance. 
              Perfect for concerts, conferences, parties, and more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#generator">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Design Event Poster
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Component */}
      <section className="py-12" id="generator">
        <div className="container mx-auto px-4">
          <EventPosterTool />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Event Marketing Features
            </h2>
            <p className="text-lg text-gray-600">
              Tools to make your events stand out
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Eye-Catching Designs
              </h3>
              <p className="text-gray-600">
                Templates that grab attention and drive ticket sales
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Multi-Platform Ready
              </h3>
              <p className="text-gray-600">
                Perfect for social media, print, and digital displays
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quick Turnaround
              </h3>
              <p className="text-gray-600">
                Create professional posters in minutes, not hours
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}