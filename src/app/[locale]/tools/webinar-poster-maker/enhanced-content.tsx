'use client'

import Image from 'next/image'
import { Calendar, Users, Globe, Clock, Video, QrCode, Megaphone, Award } from 'lucide-react'

interface Props {
  locale: string
}

export default function WebinarPosterContent({ locale }: Props) {

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Event Details Integration',
      description: 'Automatically format date, time, and speaker information',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Speaker Showcase',
      description: 'Professional layouts for single or multiple speakers',
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'QR Code Generator',
      description: 'Built-in QR codes for easy registration',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-Platform Ready',
      description: 'Optimized for Zoom, Teams, GoToWebinar, and more',
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Registration CTAs',
      description: 'Eye-catching call-to-action buttons and text',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Countdown Timers',
      description: 'Dynamic countdown elements for urgency',
    },
  ]

  const webinarTypes = [
    { type: 'Corporate Training', style: 'Professional blues and grays, clean layouts' },
    { type: 'Product Launch', style: 'Bold colors, product showcase, excitement' },
    { type: 'Educational Workshop', style: 'Academic feel, structured information' },
    { type: 'Marketing Masterclass', style: 'Vibrant, modern, attention-grabbing' },
    { type: 'Tech Conference', style: 'Futuristic design, tech patterns' },
    { type: 'Health & Wellness', style: 'Calming colors, natural elements' },
    { type: 'Financial Seminar', style: 'Trust-building design, data visualization' },
    { type: 'Creative Workshop', style: 'Artistic, colorful, inspiring layouts' },
  ]

  const platforms = [
    { name: 'Zoom', formats: ['Registration Page (1920x1080)', 'Email Header (600x200)', 'Social Share (1200x630)'] },
    { name: 'Microsoft Teams', formats: ['Event Banner (1920x1080)', 'Meeting Background (1920x1080)'] },
    { name: 'GoToWebinar', formats: ['Landing Page (1200x628)', 'Email Banner (600x200)'] },
    { name: 'LinkedIn Events', formats: ['Event Cover (1920x1080)', 'Post Image (1200x627)'] },
    { name: 'Facebook Events', formats: ['Event Cover (1920x1080)', 'Post (1200x630)'] },
    { name: 'Email Campaigns', formats: ['Header (600x200)', 'Full Width (600x400)'] },
  ]

  return (
    <div className="py-16 space-y-24">
      {/* Features Section */}
      <section id="features" className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Professional Webinar Poster Features</h2>
          <p className="text-xl text-gray-900 max-w-3xl mx-auto">
            Everything you need to create compelling webinar promotional materials that drive registrations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-900">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Dimensions */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Platform-Specific Dimensions
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <div key={platform.name} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">{platform.name}</h3>
                <ul className="space-y-2">
                  {platform.formats.map((format) => (
                    <li key={format} className="flex items-center gap-2 text-gray-900">
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{format}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webinar Types */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Templates for Every Webinar Type</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {webinarTypes.map((item) => (
            <div key={item.type} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2 text-indigo-700">{item.type}</h3>
              <p className="text-sm text-gray-900">{item.style}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Create Professional Webinar Posters in Minutes
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Enter Webinar Details</h3>
                  <p className="text-gray-900">
                    Add your webinar title, date, time, speakers, and topic. Our AI understands context to suggest appropriate designs.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Choose Your Style</h3>
                  <p className="text-gray-900">
                    Select from professional templates or let AI generate a unique design based on your webinar topic and audience.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Customize & Brand</h3>
                  <p className="text-gray-900">
                    Add your logo, adjust colors to match your brand, include speaker photos, and add registration CTAs.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Export for All Platforms</h3>
                  <p className="text-gray-900">
                    Download your poster in all required sizes for Zoom, social media, email campaigns, and more - all in one click.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Webinar Poster Best Practices
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Megaphone className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Content Tips</h3>
            <ul className="space-y-2 text-gray-900">
              <li>• Include clear value proposition</li>
              <li>• Show speaker credentials prominently</li>
              <li>• Add "Limited Seats" for urgency</li>
              <li>• Include timezone information</li>
              <li>• Use action-oriented CTAs</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Award className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Design Tips</h3>
            <ul className="space-y-2 text-gray-900">
              <li>• Use high-contrast text for readability</li>
              <li>• Keep important info in top third</li>
              <li>• Use professional speaker photos</li>
              <li>• Include company/sponsor logos</li>
              <li>• Test on mobile devices</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Professional Presenters Choose CoverGen Pro
          </h2>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-500">
                <h3 className="text-xl font-semibold mb-4 text-blue-600">CoverGen Pro</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Webinar-specific templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Built-in QR code generator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Multi-platform export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Registration CTA templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>No watermarks</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-100 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Generic Tools</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>Generic templates only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>QR code needs external tool</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>Manual resizing required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>Basic text only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>Watermarks on free tier</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-100 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Design Agencies</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>Expensive custom design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>Days to deliver</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>Limited revisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>No self-service option</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">×</span>
                    <span>Minimum order requirements</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section container mx-auto px-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Create Your Next Webinar Poster in Minutes
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals using our webinar poster maker for successful online events
          </p>
          <a
            href="#tool"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Calendar className="w-5 h-5" />
            Start Creating Free
          </a>
        </div>
      </section>
    </div>
  )
}