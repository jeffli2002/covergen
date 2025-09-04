'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, Users, MapPin, Clock, Share2 } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

// Lazy load the tool component
const EventPosterTool = dynamic(() => import('@/components/tools/EventPosterTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

interface FacebookEventCoverClientProps {
  locale: Locale
  translations: any
}

export default function FacebookEventCoverClient({ locale, translations: t }: FacebookEventCoverClientProps) {
  const breadcrumbItems = [
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Facebook Event Cover', current: true }
  ]

  // Structured data for this page
  const structuredData = generateStructuredData('howto', {
    title: 'How to Create Facebook Event Covers',
    description: 'Step-by-step guide to creating engaging Facebook event covers that boost attendance',
    steps: [
      { name: 'Enter Event Details', text: 'Add your event name, date, and location' },
      { name: 'Choose Event Type', text: 'Select from concert, conference, party, or custom event types' },
      { name: 'Generate with AI', text: 'Let AI create multiple professional event cover designs' },
      { name: 'Customize Details', text: 'Adjust colors, fonts, and layout to match your brand' },
      { name: 'Download HD Cover', text: 'Export in perfect 1920x1080 resolution for Facebook' }
    ]
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <BreadcrumbWrapper>
        <Breadcrumb items={breadcrumbItems} />
      </BreadcrumbWrapper>

      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-700 text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                Boost Event Attendance
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Facebook Event Cover Maker
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create stunning event covers that grab attention and drive RSVPs. AI-powered design 
                with perfect 1920x1080 dimensions for maximum impact on Facebook.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="#generator">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Event Cover
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-gray-300"
                  asChild
                >
                  <Link href={`/${locale}/tools/social-media-poster`}>
                    More Social Tools
                  </Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1920x1080</div>
                  <div className="text-sm text-gray-600">HD Resolution</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50+</div>
                  <div className="text-sm text-gray-600">Event Types</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">AI</div>
                  <div className="text-sm text-gray-600">Smart Design</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">Free</div>
                  <div className="text-sm text-gray-600">No Watermark</div>
                </div>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Event Cover Features That Drive Engagement
              </h2>
              <p className="text-lg text-gray-600">
                Professional tools designed specifically for Facebook event promotion
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Event-Specific Templates
                </h3>
                <p className="text-gray-600">
                  Tailored designs for concerts, conferences, parties, webinars, and more event types
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Audience Targeting
                </h3>
                <p className="text-gray-600">
                  Designs optimized for different demographics and event audiences
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Location Emphasis
                </h3>
                <p className="text-gray-600">
                  Highlight venue information clearly for both online and in-person events
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Date & Time Focus
                </h3>
                <p className="text-gray-600">
                  Ensure critical event timing is prominently displayed and easy to read
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Share-Optimized
                </h3>
                <p className="text-gray-600">
                  Designs that look great when shared across Facebook and other social platforms
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  RSVP Boosting Design
                </h3>
                <p className="text-gray-600">
                  Psychological design elements that encourage event sign-ups and attendance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Event Types Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Popular Event Cover Types
              </h2>
              <p className="text-lg text-gray-600">
                Specialized designs for every type of Facebook event
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">🎵 Concerts & Music</h3>
                <p className="text-sm text-gray-600">Dynamic designs with artist photos, venue details, and ticket info</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">💼 Business Conferences</h3>
                <p className="text-sm text-gray-600">Professional layouts with speaker highlights and agenda preview</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">🎉 Parties & Celebrations</h3>
                <p className="text-sm text-gray-600">Fun, vibrant designs that capture the party atmosphere</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">💻 Webinars & Online</h3>
                <p className="text-sm text-gray-600">Clean designs emphasizing topics and registration links</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">🏃 Sports & Fitness</h3>
                <p className="text-sm text-gray-600">Energetic layouts for races, tournaments, and fitness events</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">🎓 Educational Workshops</h3>
                <p className="text-sm text-gray-600">Informative designs highlighting learning outcomes</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Promote Your Event?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Create professional Facebook event covers that drive attendance
            </p>
            <Link href="#generator">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Design Event Cover Now
              </Button>
            </Link>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Master Facebook Event Cover Design</h2>
              <p>
                A compelling Facebook event cover is crucial for event success. It's often the first impression 
                potential attendees have of your event, and can significantly impact RSVP rates and attendance. 
                Our AI-powered Facebook event cover maker helps you create professional, attention-grabbing 
                covers that drive engagement and boost event participation.
              </p>
              
              <h3>Facebook Event Cover Dimensions and Requirements</h3>
              <p>
                Facebook recommends event cover photos be 1920x1080 pixels (16:9 aspect ratio) for optimal 
                display across all devices. Our tool automatically generates covers in these exact dimensions, 
                ensuring your event looks professional on desktop, mobile, and tablet views. The cover displays 
                differently on various devices, so our AI ensures critical information remains visible in all formats.
              </p>
              
              <h3>Elements of High-Converting Event Covers</h3>
              <p>
                Successful Facebook event covers share common elements that drive engagement:
              </p>
              <ul>
                <li><strong>Clear Event Title:</strong> Large, readable text that immediately communicates what the event is</li>
                <li><strong>Date & Time:</strong> Prominently displayed to prevent confusion</li>
                <li><strong>Location or Platform:</strong> Whether in-person or online, make it crystal clear</li>
                <li><strong>Visual Hook:</strong> Eye-catching imagery that stops the scroll</li>
                <li><strong>Brand Consistency:</strong> Colors and fonts that align with your organization</li>
                <li><strong>Call to Action:</strong> Subtle prompts that encourage RSVPs</li>
              </ul>
              
              <h3>Psychology of Event Cover Design</h3>
              <p>
                Our AI incorporates psychological principles to maximize event appeal. Colors evoke specific 
                emotions - blue for trust in business events, vibrant hues for parties, calming tones for 
                wellness workshops. Typography choices impact perception - bold fonts for concerts, elegant 
                scripts for galas, clean sans-serifs for professional conferences.
              </p>
              
              <h3>Mobile-First Event Cover Strategy</h3>
              <p>
                With over 70% of Facebook users accessing via mobile, your event cover must work on small 
                screens. Our AI ensures text remains legible, key information stays visible in cropped views, 
                and the overall impact translates across all device sizes. This mobile-first approach is 
                essential for maximizing event reach and engagement.
              </p>
              
              <h3>Free Facebook Event Cover Creation</h3>
              <p>
                Create unlimited Facebook event covers without watermarks or fees. Whether you're organizing 
                a small local meetup or a major conference, our tool provides professional-quality designs 
                that rival expensive graphic design services. Focus on making your event successful while we 
                handle the visual promotion.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}