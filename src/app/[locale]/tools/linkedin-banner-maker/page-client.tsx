'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, Linkedin, Users, Briefcase, TrendingUp, Award, Shield } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

// Lazy load the LinkedIn Banner Tool
const LinkedInBannerTool = dynamic(
  () => import(/* webpackChunkName: "linkedin-banner-tool" */ '@/components/tools/LinkedInBannerTool'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
  }
)

interface LinkedInBannerMakerClientProps {
  locale: Locale
  translations: any
}

export default function LinkedInBannerMakerClient({ locale, translations: t }: LinkedInBannerMakerClientProps) {
  const breadcrumbItems = [
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'LinkedIn Banner Maker', current: true }
  ]

  // Structured data for this page
  const structuredData = generateStructuredData('howto', {
    title: 'How to Create LinkedIn Profile Banners with AI',
    description: 'Step-by-step guide to creating professional LinkedIn banners using AI technology',
    steps: [
      { name: 'Choose Professional Style', text: 'Select from industry-specific templates and designs' },
      { name: 'Add Your Information', text: 'Include your title, expertise, and company details' },
      { name: 'Generate Banner', text: 'AI creates multiple professional banner options' },
      { name: 'Customize Elements', text: 'Fine-tune colors, fonts, and layout to match your brand' },
      { name: 'Download', text: 'Export in perfect 1584x396 pixels for LinkedIn' }
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
                <Linkedin className="w-4 h-4" />
                Optimized for LinkedIn Profiles
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                LinkedIn Banner Maker
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create professional LinkedIn profile banners that showcase your expertise. Perfect 1584x396 
                pixel designs that help you stand out and attract more opportunities.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8"
                  onClick={() => {
                    const generator = document.getElementById('generator')
                    if (generator) {
                      generator.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create LinkedIn Banner
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1584x396</div>
                  <div className="text-sm text-gray-600">Perfect Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">HD</div>
                  <div className="text-sm text-gray-600">High Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">Pro</div>
                  <div className="text-sm text-gray-600">Professional</div>
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
            <LinkedInBannerTool />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Professional LinkedIn Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create banners that enhance your professional presence
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Industry-Specific Design
                </h3>
                <p className="text-gray-600">
                  Templates tailored for tech, finance, consulting, healthcare, and more professional fields
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Personal Branding
                </h3>
                <p className="text-gray-600">
                  Showcase your achievements, skills, and unique value proposition professionally
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Career Advancement
                </h3>
                <p className="text-gray-600">
                  Attract recruiters and opportunities with professional, eye-catching banner designs
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Network Growth
                </h3>
                <p className="text-gray-600">
                  Professional banners increase profile views and connection requests by up to 40%
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Linkedin className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  LinkedIn Optimized
                </h3>
                <p className="text-gray-600">
                  Perfect 1584x396 pixel dimensions ensure your banner looks crisp on all devices
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
                  Maintain professional brand identity with customizable colors, fonts, and logos
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Professional Categories */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Popular Professional Banner Styles
              </h2>
              <p className="text-lg text-gray-600">
                Get inspired by these trending LinkedIn banner categories
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💻</div>
                <h3 className="font-semibold mb-2">Tech Professional</h3>
                <p className="text-sm text-gray-600">Modern, innovative, cutting-edge</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-semibold mb-2">Business Executive</h3>
                <p className="text-sm text-gray-600">Corporate, leadership, strategic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="font-semibold mb-2">Creative Professional</h3>
                <p className="text-sm text-gray-600">Artistic, unique, expressive</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🏥</div>
                <h3 className="font-semibold mb-2">Healthcare Expert</h3>
                <p className="text-sm text-gray-600">Trustworthy, caring, professional</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📈</div>
                <h3 className="font-semibold mb-2">Finance & Banking</h3>
                <p className="text-sm text-gray-600">Reliable, analytical, results-driven</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="font-semibold mb-2">Education & Academia</h3>
                <p className="text-sm text-gray-600">Knowledgeable, inspiring, scholarly</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">⚖️</div>
                <h3 className="font-semibold mb-2">Legal Professional</h3>
                <p className="text-sm text-gray-600">Authoritative, precise, trustworthy</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-semibold mb-2">Startup Founder</h3>
                <p className="text-sm text-gray-600">Innovative, dynamic, visionary</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Elevate Your LinkedIn Profile?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Create a professional banner that opens doors to new opportunities
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => {
                const generator = document.getElementById('generator')
                if (generator) {
                  generator.scrollIntoView({ behavior: 'smooth' })
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
              <h2 className="text-3xl font-bold mb-6 text-center">The Ultimate LinkedIn Banner Maker</h2>
              <p>
                Your LinkedIn profile is your digital business card, and your banner is the first visual 
                element that captures attention. A professional LinkedIn banner can increase your profile 
                views by up to 40% and significantly improve your chances of making meaningful professional 
                connections. Our AI-powered LinkedIn banner maker helps you create stunning, industry-specific 
                banners that communicate your professional value instantly.
              </p>
              
              <h3>Why LinkedIn Banners Matter</h3>
              <p>
                In today's competitive professional landscape, standing out on LinkedIn is crucial:
              </p>
              <ul>
                <li>67% of recruiters check LinkedIn banners when reviewing profiles</li>
                <li>Profiles with professional banners receive 5x more connection requests</li>
                <li>Visual branding increases profile memorability by 65%</li>
                <li>Professional banners correlate with 28% more InMail responses</li>
                <li>Complete profiles with banners rank higher in LinkedIn search results</li>
              </ul>
              
              <h3>Perfect LinkedIn Banner Dimensions</h3>
              <p>
                LinkedIn requires specific dimensions for profile banners: 1584x396 pixels with a 4:1 
                aspect ratio. Our tool automatically generates banners in these exact dimensions, ensuring 
                your design looks crisp and professional on all devices. The banner displays differently 
                on mobile and desktop, so our AI optimizes the design to ensure important elements remain 
                visible across all viewports.
              </p>
              
              <h3>Industry-Specific Design Intelligence</h3>
              <p>
                Our AI understands the visual language of different industries. Whether you're in tech, 
                finance, healthcare, or creative fields, the AI generates designs that resonate with your 
                industry's aesthetic expectations. It incorporates appropriate color schemes, typography, 
                and visual elements that communicate professionalism while maintaining your unique personal brand.
              </p>
              
              <h3>Professional Branding Elements</h3>
              <p>
                A great LinkedIn banner goes beyond aesthetics. It should communicate your professional 
                value proposition, showcase your expertise, and create a cohesive brand identity. Our tool 
                helps you incorporate key branding elements including your tagline, areas of expertise, 
                company logos, and professional achievements in a visually appealing layout.
              </p>
              
              <h3>Free Professional Design Tool</h3>
              <p>
                Professional design shouldn't require expensive software or hiring designers. Our LinkedIn 
                banner maker is completely free to use, with no watermarks or hidden costs. Create unlimited 
                professional banners that help you stand out in the competitive LinkedIn ecosystem and 
                attract the opportunities you deserve.
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
                    What size should my LinkedIn banner be?
                  </h3>
                  <p className="text-gray-600">
                    LinkedIn banners must be exactly 1584x396 pixels (4:1 aspect ratio). Our tool 
                    automatically creates banners in this precise size, ensuring your design looks 
                    perfect on both desktop and mobile devices without any cropping issues.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I add my company logo to the banner?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! You can include your company logo, personal branding elements, and 
                    professional certifications. Our AI will intelligently position these elements 
                    to create a cohesive, professional design that enhances your credibility.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    How do I make my LinkedIn banner stand out?
                  </h3>
                  <p className="text-gray-600">
                    Use high-quality visuals that reflect your industry, incorporate your unique value 
                    proposition, maintain consistent branding with your resume and portfolio, and ensure 
                    text is readable on mobile devices. Our AI handles these considerations automatically.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Should my banner match my industry standards?
                  </h3>
                  <p className="text-gray-600">
                    While maintaining industry relevance is important, your banner should also reflect 
                    your unique professional identity. Our tool offers industry-specific templates while 
                    allowing personalization to showcase what makes you stand out in your field.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    How often should I update my LinkedIn banner?
                  </h3>
                  <p className="text-gray-600">
                    Update your banner when you change roles, achieve significant milestones, rebrand 
                    your professional identity, or at least annually to keep your profile fresh. Regular 
                    updates show you're active and engaged in your professional development.
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