'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, Users, MapPin, Clock, Share2, Shield } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

// Lazy load the Facebook Event Cover Tool
const FacebookEventCoverTool = dynamic(
  () => import(/* webpackChunkName: "facebook-event-cover-tool" */ '@/components/tools/FacebookEventCoverTool'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
  }
)

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
    title: 'How to Create Facebook Event Covers with AI',
    description: 'Step-by-step guide to creating professional Facebook event covers using AI technology',
    steps: [
      { name: 'Enter Event Details', text: 'Type your event name, date, and location' },
      { name: 'Choose Style', text: 'Select from various event-themed design templates' },
      { name: 'Generate Cover', text: 'AI creates multiple cover options instantly' },
      { name: 'Customize Design', text: 'Fine-tune colors, fonts, and layout' },
      { name: 'Download', text: 'Export in perfect 1200x628 pixels for Facebook' }
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
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-700 text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                Optimized for Facebook Events
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Facebook Event Cover Maker
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create eye-catching Facebook event covers that boost attendance. Perfect 1200x628 pixel 
                designs that make your events stand out and attract more participants.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8"
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
                  Create Event Cover
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1200x628</div>
                  <div className="text-sm text-gray-600">Perfect Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">HD</div>
                  <div className="text-sm text-gray-600">High Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">Free</div>
                  <div className="text-sm text-gray-600">No Watermark</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">AI</div>
                  <div className="text-sm text-gray-600">Smart Design</div>
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
              <h2 className="text-3xl font-bold mb-4">
                Event Marketing Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create Facebook event covers that drive attendance
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Event-Focused Design
                </h3>
                <p className="text-gray-600">
                  AI creates designs that highlight your event details - date, time, location, and key information
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Audience Targeting
                </h3>
                <p className="text-gray-600">
                  Designs that resonate with your target audience and encourage RSVPs and shares
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Location Emphasis
                </h3>
                <p className="text-gray-600">
                  Highlight venue details and make it easy for attendees to find your event location
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Time-Sensitive Design
                </h3>
                <p className="text-gray-600">
                  Create urgency with countdown elements and clear date/time visibility
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Share-Worthy Visuals
                </h3>
                <p className="text-gray-600">
                  Eye-catching designs that people want to share, expanding your event's reach
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Brand Consistency
                </h3>
                <p className="text-gray-600">
                  Maintain your brand identity across all event marketing materials
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Event Types */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Popular Event Cover Styles
              </h2>
              <p className="text-lg text-gray-600">
                Get inspired by these trending event cover categories
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎵</div>
                <h3 className="font-semibold mb-2">Music Concerts</h3>
                <p className="text-sm text-gray-600">Bold, energetic, artist-focused</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-semibold mb-2">Parties & Celebrations</h3>
                <p className="text-sm text-gray-600">Fun, vibrant, festive designs</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💼</div>
                <h3 className="font-semibold mb-2">Business Events</h3>
                <p className="text-sm text-gray-600">Professional, clean, informative</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎭</div>
                <h3 className="font-semibold mb-2">Theater & Arts</h3>
                <p className="text-sm text-gray-600">Elegant, artistic, dramatic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🏃‍♂️</div>
                <h3 className="font-semibold mb-2">Sports Events</h3>
                <p className="text-sm text-gray-600">Dynamic, competitive, action-packed</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="font-semibold mb-2">Educational Workshops</h3>
                <p className="text-sm text-gray-600">Informative, clear, engaging</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🍷</div>
                <h3 className="font-semibold mb-2">Food & Wine</h3>
                <p className="text-sm text-gray-600">Appetizing, sophisticated, inviting</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="font-semibold mb-2">Community Gatherings</h3>
                <p className="text-sm text-gray-600">Welcoming, inclusive, warm</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Boost Your Event Attendance?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Create professional Facebook event covers in seconds
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
              Start Creating Now
            </Button>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg prose-seo">
              <h2 className="text-3xl font-bold mb-6 text-center">The Ultimate Facebook Event Cover Maker</h2>
              <p>
                Creating the perfect Facebook event cover is crucial for event success. Your event cover is 
                often the first impression potential attendees have of your event, and it can significantly 
                impact attendance rates. Our AI-powered Facebook event cover maker helps you design professional, 
                engaging covers that drive RSVPs and shares.
              </p>
              
              <h3>Why Facebook Event Covers Matter</h3>
              <p>
                Facebook events compete for attention in crowded news feeds. A compelling event cover can:
              </p>
              <ul>
                <li>Increase event discovery and organic reach</li>
                <li>Communicate essential information at a glance</li>
                <li>Build excitement and anticipation</li>
                <li>Encourage social sharing and word-of-mouth promotion</li>
                <li>Establish credibility and professionalism</li>
              </ul>
              
              <h3>Perfect Facebook Event Dimensions</h3>
              <p>
                Facebook recommends event covers be 1200x628 pixels with a 1.91:1 aspect ratio. This ensures 
                your cover looks great on all devices - desktop, mobile, and tablet. Our tool automatically 
                generates covers in these exact dimensions, preventing cropping issues and ensuring your 
                design looks professional everywhere it appears.
              </p>
              
              <h3>Event-Specific Design Intelligence</h3>
              <p>
                Our AI understands different event types require different visual approaches. A corporate 
                conference needs a professional, informative design, while a music festival benefits from 
                vibrant, energetic visuals. The AI adapts its design strategy based on your event type, 
                ensuring the cover resonates with your target audience.
              </p>
              
              <h3>Mobile-First Design Approach</h3>
              <p>
                With over 90% of Facebook users accessing the platform via mobile devices, your event cover 
                must work perfectly on small screens. Our designs ensure text remains readable, important 
                details are visible, and the overall impact isn't lost when viewed on smartphones. This 
                mobile-first approach maximizes your event's visibility and appeal.
              </p>
              
              <h3>Free Event Marketing Tool</h3>
              <p>
                Unlike expensive design services or complex software, our Facebook event cover maker is 
                completely free to use. Create unlimited event covers without watermarks or hidden costs. 
                Whether you're organizing community gatherings, business conferences, or social celebrations, 
                professional event marketing should be accessible to everyone.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    What size should my Facebook event cover be?
                  </h3>
                  <p className="text-gray-600">
                    Facebook recommends event covers be 1200x628 pixels. Our tool automatically creates 
                    covers in this exact size, ensuring your design looks perfect on all devices without 
                    any cropping or distortion issues.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I add event details like date and location?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! Our AI-powered tool allows you to include all essential event information 
                    including date, time, location, and special details. The AI ensures this information 
                    is prominently displayed and easy to read at all sizes.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    How do I make my event stand out in the Facebook feed?
                  </h3>
                  <p className="text-gray-600">
                    Our AI creates high-contrast, eye-catching designs that grab attention in busy news feeds. 
                    Use bold colors, clear typography, and compelling imagery. The tool also ensures your 
                    most important information is visible even in thumbnail views.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I use the covers for recurring events?
                  </h3>
                  <p className="text-gray-600">
                    Yes! Create a consistent visual brand for your recurring events. You can save your 
                    favorite designs and easily update dates and details for each occurrence while 
                    maintaining your established event identity.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Are the event covers optimized for sharing?
                  </h3>
                  <p className="text-gray-600">
                    Yes, our covers are designed to look great when shared across Facebook, including in 
                    messages, groups, and on pages. The 1200x628 dimension ensures optimal display in 
                    link previews and maintains visual impact when reshared by attendees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}