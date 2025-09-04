import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, MapPin, Clock, Users, Megaphone, Star, Wand2, Shield, Zap, Share2, Music } from 'lucide-react'

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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1M+</div>
                <div className="text-sm text-white/80">Events Promoted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100+</div>
                <div className="text-sm text-white/80">Event Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">Free</div>
                <div className="text-sm text-white/80">No Watermark</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">HD</div>
                <div className="text-sm text-white/80">Print Ready</div>
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
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Event Details Included
              </h3>
              <p className="text-gray-600">
                Date, time, venue, and ticketing information
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Social Media Optimized
              </h3>
              <p className="text-gray-600">
                Perfect sizes for Instagram, Facebook, Twitter
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Premium Quality
              </h3>
              <p className="text-gray-600">
                Professional designs that elevate your brand
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Event Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Event Poster Styles
            </h2>
            <p className="text-lg text-gray-600">
              Choose templates designed for your specific event type
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎵</div>
              <h3 className="font-semibold text-gray-900 mb-2">Music Concerts</h3>
              <p className="text-sm text-gray-600">Rock, pop, EDM, jazz festivals</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-2">Conferences</h3>
              <p className="text-sm text-gray-600">Business, tech, academic events</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-semibold text-gray-900 mb-2">Parties & Celebrations</h3>
              <p className="text-sm text-gray-600">Birthday, wedding, holiday parties</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎭</div>
              <h3 className="font-semibold text-gray-900 mb-2">Theater & Arts</h3>
              <p className="text-sm text-gray-600">Plays, dance, art exhibitions</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900 mb-2">Workshops</h3>
              <p className="text-sm text-gray-600">Training, seminars, masterclasses</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🏃</div>
              <h3 className="font-semibold text-gray-900 mb-2">Sports Events</h3>
              <p className="text-sm text-gray-600">Marathons, tournaments, matches</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎪</div>
              <h3 className="font-semibold text-gray-900 mb-2">Festivals</h3>
              <p className="text-sm text-gray-600">Food, culture, music festivals</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🎤</div>
              <h3 className="font-semibold text-gray-900 mb-2">Comedy Shows</h3>
              <p className="text-sm text-gray-600">Stand-up, improv, open mics</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Fill Your Event?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Create professional event posters that drive attendance
          </p>
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100"
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
            Start Designing Now
          </Button>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Professional Event Poster Design That Drives Attendance</h2>
            <p>
              Creating compelling event posters is crucial for successful event promotion in today's competitive landscape. 
              Our AI-powered event poster designer helps event organizers, promoters, and marketers create professional 
              promotional materials that capture attention and convert viewers into attendees.
            </p>
            
            <h3>Perfect for Every Type of Event</h3>
            <p>
              Whether you're organizing a music festival, business conference, birthday party, or community workshop, 
              our event poster designer provides tailored templates and AI-generated designs that match your event's 
              vibe. From elegant corporate conferences to vibrant music festivals, from intimate art exhibitions to 
              massive sporting events, we've got the perfect design aesthetic for your needs.
            </p>
            
            <h3>Multi-Channel Marketing Ready</h3>
            <p>
              Modern event promotion requires a multi-channel approach. Our poster designer creates materials optimized 
              for every platform: Instagram stories and posts, Facebook event covers, Twitter headers, printed flyers, 
              large-format posters, and digital displays. Each design maintains consistency while being perfectly 
              sized for its intended platform.
            </p>
            
            <h3>Essential Event Information Integration</h3>
            <p>
              A great event poster does more than look good – it communicates clearly. Our AI ensures all critical 
              information is prominently displayed: event name, date and time, venue location, ticket prices, and 
              call-to-action. The smart layout system prevents important details from being overlooked while 
              maintaining visual appeal.
            </p>
            
            <h3>Drive Ticket Sales with Professional Design</h3>
            <p>
              Professional event posters can significantly impact ticket sales and attendance. Our designs incorporate 
              proven marketing psychology principles: urgency creation, social proof elements, clear value propositions, 
              and compelling calls-to-action. Whether you're selling tickets online or promoting a free community 
              event, our posters are designed to convert.
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
                  What types of events can I create posters for?
                </h3>
                <p className="text-gray-600">
                  Our event poster designer supports all event types: concerts, conferences, parties, workshops, 
                  festivals, sports events, theater performances, art exhibitions, and more. Each category has 
                  specialized templates and AI training to match the appropriate style and information hierarchy.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I add sponsor logos and partner information?
                </h3>
                <p className="text-gray-600">
                  Yes! Our tool supports adding sponsor logos, partner brands, and venue information. You can upload 
                  multiple logos and arrange them professionally. The AI ensures sponsor visibility while maintaining 
                  the overall design aesthetic. Pro users get advanced layout options for complex sponsor arrangements.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What sizes are available for different platforms?
                </h3>
                <p className="text-gray-600">
                  We provide optimized sizes for all major platforms: Instagram (1080x1080, 1080x1920), Facebook 
                  (1200x628, 1920x1080), Twitter (1500x500), printed flyers (8.5"x11", A4), posters (18"x24", 
                  24"x36"), and custom dimensions. Each design can be exported in multiple formats.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I create a series of posters for recurring events?
                </h3>
                <p className="text-gray-600">
                  Absolutely! Save your designs as templates and reuse them for weekly, monthly, or annual events. 
                  Maintain brand consistency while easily updating dates, performers, or topics. Perfect for event 
                  series, recurring workshops, or seasonal festivals.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How quickly can I create an event poster?
                </h3>
                <p className="text-gray-600">
                  Most users create professional event posters in under 5 minutes. Simply enter your event details, 
                  select a style or let AI generate options, customize colors and fonts if needed, then export. 
                  Perfect for last-minute event announcements or rapid marketing campaigns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}