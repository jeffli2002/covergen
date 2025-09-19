import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Video, Users, Calendar, Presentation, Globe, Star, Wand2, Clock, Download, Share2, Monitor } from 'lucide-react'

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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">85%</div>
                <div className="text-sm text-white/80">Higher Registration</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500K+</div>
                <div className="text-sm text-white/80">Webinars Promoted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">Pro</div>
                <div className="text-sm text-white/80">Business Quality</div>
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
            <p className="text-lg text-gray-900">
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
              <p className="text-gray-900">
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
              <p className="text-gray-900">
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
              <p className="text-gray-900">
                Perfect for email, social, and landing pages
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Time Zone Friendly
              </h3>
              <p className="text-gray-900">
                Global scheduling and time displays
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Platform Integrated
              </h3>
              <p className="text-gray-900">
                Zoom, Teams, GoToWebinar ready
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Engaging Visuals
              </h3>
              <p className="text-gray-900">
                Designs that communicate value clearly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Webinar Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Webinar Types
            </h2>
            <p className="text-lg text-gray-900">
              Templates designed for every type of online event
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Training</h3>
              <p className="text-sm text-gray-900">Professional development, skills</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Product Demos</h3>
              <p className="text-sm text-gray-900">Software demos, launches</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-2">Educational Sessions</h3>
              <p className="text-sm text-gray-900">Online courses, tutorials</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Sales Presentations</h3>
              <p className="text-sm text-gray-900">Lead generation, pitches</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🧐</div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Interviews</h3>
              <p className="text-sm text-gray-900">Industry leaders, Q&As</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🛠️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Technical Workshops</h3>
              <p className="text-sm text-gray-900">Hands-on learning, coding</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Marketing Seminars</h3>
              <p className="text-sm text-gray-900">Strategy sessions, insights</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Global Conferences</h3>
              <p className="text-sm text-gray-900">Multi-day events, summits</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Fill Your Webinar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Create professional webinar graphics that drive registrations
          </p>
          <Link href="#generator">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Webinar Graphics
            </Button>
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg prose-seo">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Professional Webinar Graphics That Drive Registrations</h2>
            <p>
              In the competitive world of online events, professional webinar graphics are essential for standing out 
              and driving registrations. Our AI-powered webinar poster maker helps businesses, educators, trainers, 
              and thought leaders create compelling visual materials that communicate value, build trust, and motivate 
              potential attendees to register for their online events.
            </p>
            
            <h3>Optimized for Maximum Conversions</h3>
            <p>
              Successful webinar graphics do more than look professional – they drive specific actions. Our tool creates 
              designs optimized for conversion, incorporating proven marketing principles: clear value propositions, 
              compelling headlines, professional speaker credibility, urgency creation through limited seating or 
              early bird offers, and strategic placement of registration calls-to-action. Every element is designed 
              to move viewers from interest to registration.
            </p>
            
            <h3>Multi-Platform Marketing Integration</h3>
            <p>
              Webinar promotion requires a multi-channel approach. Our graphics are perfectly sized and formatted for 
              email marketing campaigns, social media promotion across LinkedIn, Facebook, and Twitter, website landing 
              pages, blog post headers, and even printed materials for hybrid events. Each design maintains visual 
              consistency while being optimized for its specific platform and context.
            </p>
            
            <h3>Professional Credibility and Trust Building</h3>
            <p>
              Online events require higher levels of trust than in-person gatherings. Our webinar graphics incorporate 
              design elements that build credibility: professional photography integration, clear speaker credentials 
              and company logos, testimonials and social proof, industry-appropriate color schemes and typography, 
              and polished layouts that reflect the quality of your content. This professional presentation significantly 
              impacts registration rates.
            </p>
            
            <h3>Global Accessibility and Compliance</h3>
            <p>
              Modern webinars often serve global audiences with diverse needs. Our tool creates graphics that work 
              across different cultures and languages, support multiple time zones with clear scheduling information, 
              include accessibility considerations for screen readers and visual impairments, and comply with various 
              international marketing regulations. This ensures your webinar promotion reaches and resonates with 
              the broadest possible audience.
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
                  What webinar platforms do the graphics work with?
                </h3>
                <p className="text-gray-900">
                  Our graphics work with all major webinar platforms including Zoom, Microsoft Teams, GoToWebinar, 
                  WebEx, BigMarker, Demio, and custom streaming solutions. We provide templates optimized for each 
                  platform's specific requirements and branding guidelines.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I include speaker photos and company logos?
                </h3>
                <p className="text-gray-900">
                  Absolutely! Upload speaker headshots, company logos, sponsor brands, and event photos. Our AI 
                  integrates these elements professionally, ensuring proper sizing, placement, and visual hierarchy. 
                  This helps build credibility and trust with potential attendees.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I handle different time zones for global webinars?
                </h3>
                <p className="text-gray-900">
                  Our tool can create graphics showing multiple time zones simultaneously, or generate separate 
                  versions for different regions. We also support "starts in X hours" countdown formats and can 
                  integrate with calendar link generators for automatic time zone conversion.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What formats work best for email marketing campaigns?
                </h3>
                <p className="text-gray-900">
                  For email campaigns, we recommend horizontal banners (600px wide) that fit most email clients, 
                  plus mobile-optimized versions. We also create matching graphics for landing pages, social media 
                  promotion, and thank you pages to maintain consistent branding throughout your marketing funnel.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I create graphics for webinar series or recurring events?
                </h3>
                <p className="text-gray-900">
                  Yes! Create template designs for your webinar series that maintain visual consistency while allowing 
                  easy customization for individual sessions. Perfect for monthly training series, educational programs, 
                  or regular industry updates. Save templates for quick updates with new dates and topics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}