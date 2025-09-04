import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Facebook, Calendar, Share2, Eye, TrendingUp, Star, Wand2, Shield, Zap, Users, Megaphone } from 'lucide-react'

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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1200x628</div>
                <div className="text-sm text-white/80">Perfect Size</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500K+</div>
                <div className="text-sm text-white/80">Events Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">3x</div>
                <div className="text-sm text-white/80">More Engagement</div>
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
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Event Details Clear
              </h3>
              <p className="text-gray-600">
                Date, time, location prominently displayed
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Instant Creation
              </h3>
              <p className="text-gray-600">
                Professional covers in under 2 minutes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Audience Targeted
              </h3>
              <p className="text-gray-600">
                Designs that resonate with your attendees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Facebook Event Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Facebook Event Types
            </h2>
            <p className="text-lg text-gray-600">
              Optimized templates for every kind of Facebook event
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎂</div>
              <h3 className="font-semibold text-gray-900 mb-2">Birthday Parties</h3>
              <p className="text-sm text-gray-600">Fun, colorful, celebratory designs</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Events</h3>
              <p className="text-sm text-gray-600">Professional networking & seminars</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎶</div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Music</h3>
              <p className="text-sm text-gray-600">Concerts, gigs, music festivals</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎆</div>
              <h3 className="font-semibold text-gray-900 mb-2">Community Events</h3>
              <p className="text-sm text-gray-600">Local gatherings & meetups</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🙏</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fundraisers</h3>
              <p className="text-sm text-gray-600">Charity events & causes</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="font-semibold text-gray-900 mb-2">Gaming Tournaments</h3>
              <p className="text-sm text-gray-600">Esports & gaming meetups</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-2">Webinars & Classes</h3>
              <p className="text-sm text-gray-600">Online education events</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">💒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Wedding Events</h3>
              <p className="text-sm text-gray-600">Engagements & celebrations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Boost Your Event's Visibility?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Create Facebook event covers that get more attendees
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => {
              const generator = document.getElementById('generator')
              if (generator) {
                generator.scrollIntoView({ behavior: 'smooth' })
              } else {
                window.location.href = `/${locale}#generator`
              }
            }}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Your Event Cover
          </Button>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Maximize Your Facebook Event's Impact</h2>
            <p>
              Facebook events are one of the most powerful tools for promoting gatherings, whether virtual or in-person. 
              With our AI-powered Facebook event cover maker, you can create compelling visuals that stop scrollers and 
              convert them into attendees. Our tool is specifically optimized for Facebook's 1200x628 pixel requirement, 
              ensuring your event looks perfect on every device.
            </p>
            
            <h3>Why Facebook Event Covers Matter</h3>
            <p>
              Your event cover is the first thing potential attendees see. Studies show that events with professional, 
              eye-catching covers receive up to 3x more engagement than those with basic images. Our AI understands 
              Facebook's algorithm preferences, creating covers that not only look great but also perform well in 
              feeds and search results.
            </p>
            
            <h3>Designed for Facebook's Algorithm</h3>
            <p>
              Facebook prioritizes events with clear, high-quality cover images that include essential information. 
              Our tool automatically optimizes text placement, ensuring your event details remain visible even when 
              Facebook crops the image for mobile feeds. The AI balances visual appeal with information hierarchy, 
              making sure dates, times, and calls-to-action are prominently displayed.
            </p>
            
            <h3>Multi-Language Support for Global Events</h3>
            <p>
              Hosting an international event or targeting a diverse audience? Our Facebook event cover maker supports 
              multiple languages and can generate culturally appropriate designs. Whether you're organizing a local 
              community gathering or a global virtual conference, create covers that resonate with your specific 
              audience demographics.
            </p>
            
            <h3>Instant Updates for Last-Minute Changes</h3>
            <p>
              Event details change, and your cover should too. With our tool, update your Facebook event cover in 
              seconds. Changed the venue? New special guest? Updated schedule? Generate a fresh cover that keeps 
              your event page current and professional. Pro users can save templates for consistent branding across 
              multiple events.
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
                  What's the ideal size for Facebook event covers?
                </h3>
                <p className="text-gray-600">
                  Facebook recommends 1200x628 pixels for event cover photos. This size ensures your cover looks 
                  great on all devices without being cropped awkwardly. Our tool automatically generates covers in 
                  this exact dimension, optimized for both desktop and mobile viewing.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I add co-hosts and sponsor logos?
                </h3>
                <p className="text-gray-600">
                  Yes! Our tool allows you to upload and position multiple logos for co-hosts, sponsors, or partners. 
                  The AI ensures these elements are balanced with your main design while maintaining visibility. 
                  You can also add text crediting organizers or listing special guests.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I make my event stand out in the Facebook feed?
                </h3>
                <p className="text-gray-600">
                  Our AI generates covers using proven design principles: bold colors that pop in feeds, clear 
                  contrast for text readability, strategic use of white space, and compelling imagery. We also 
                  recommend including action words and creating urgency with limited-time offers or early bird specials.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I create covers for recurring events?
                </h3>
                <p className="text-gray-600">
                  Absolutely! Save your design as a template and reuse it for weekly, monthly, or seasonal events. 
                  Simply update the date and any changing details while maintaining your event's visual identity. 
                  This is perfect for regular meetups, classes, or event series.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do the covers work for both public and private events?
                </h3>
                <p className="text-gray-600">
                  Yes, our covers work perfectly for all Facebook event types. For private events, you might want 
                  more intimate, exclusive-feeling designs. For public events, we recommend bolder, more attention-grabbing 
                  visuals. Our AI can generate appropriate styles for both scenarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}