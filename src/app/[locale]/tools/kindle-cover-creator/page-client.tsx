'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, BookOpen, PenTool, Download, Award, FileText, Shield } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

// Lazy load the Kindle Cover Tool
const KindleCoverTool = dynamic(
  () => import(/* webpackChunkName: "kindle-cover-tool" */ '@/components/tools/KindleCoverTool'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
  }
)

interface KindleCoverCreatorClientProps {
  locale: Locale
  translations: any
}

export default function KindleCoverCreatorClient({ locale, translations: t }: KindleCoverCreatorClientProps) {
  const breadcrumbItems = [
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Kindle Cover Creator', current: true }
  ]

  // Structured data for this page
  const structuredData = generateStructuredData('howto', {
    title: 'How to Create Kindle Book Covers with AI',
    description: 'Step-by-step guide to creating professional Kindle book covers using AI technology',
    steps: [
      { name: 'Enter Book Details', text: 'Type your book title, author name, and subtitle' },
      { name: 'Choose Genre', text: 'Select from various book genre templates' },
      { name: 'Generate Cover', text: 'AI creates multiple cover options instantly' },
      { name: 'Customize Design', text: 'Fine-tune typography, colors, and imagery' },
      { name: 'Download', text: 'Export in perfect 2560x1600 pixels for Amazon KDP' }
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
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full text-orange-700 text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                Optimized for Amazon KDP
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Kindle Cover Creator
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create bestseller-quality Kindle book covers with AI. Perfect 2560x1600 pixel 
                designs that attract readers and boost sales on Amazon KDP.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8"
                  onClick={() => {
                    const generator = document.getElementById('generator')
                    if (generator) {
                      generator.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Book Cover
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">2560x1600</div>
                  <div className="text-sm text-gray-600">KDP Perfect</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">HD</div>
                  <div className="text-sm text-gray-600">Print Ready</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">Free</div>
                  <div className="text-sm text-gray-600">No Watermark</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">AI</div>
                  <div className="text-sm text-gray-600">Genre Smart</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Component */}
        <section className="py-12" id="generator">
          <div className="container mx-auto px-4">
            <KindleCoverTool />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Book Cover Design Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create Kindle covers that sell books
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Genre-Specific Design
                </h3>
                <p className="text-gray-600">
                  AI understands different book genres and creates covers that match reader expectations
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <PenTool className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Professional Typography
                </h3>
                <p className="text-gray-600">
                  Beautiful fonts and layouts that make your title and author name stand out
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  KDP Compliance
                </h3>
                <p className="text-gray-600">
                  Automatically meets all Amazon Kindle Direct Publishing requirements
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Bestseller-Inspired
                </h3>
                <p className="text-gray-600">
                  AI trained on successful book covers to create designs that attract readers
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Multiple Formats
                </h3>
                <p className="text-gray-600">
                  Get your cover in both eBook and print-ready formats with proper specifications
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Copyright Safe
                </h3>
                <p className="text-gray-600">
                  All generated images are original and safe for commercial use
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Book Genres */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Popular Book Cover Genres
              </h2>
              <p className="text-lg text-gray-600">
                Get inspired by these trending book cover styles
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📖</div>
                <h3 className="font-semibold mb-2">Fiction & Literature</h3>
                <p className="text-sm text-gray-600">Literary, compelling, emotional</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💕</div>
                <h3 className="font-semibold mb-2">Romance</h3>
                <p className="text-sm text-gray-600">Passionate, warm, inviting</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-semibold mb-2">Mystery & Thriller</h3>
                <p className="text-sm text-gray-600">Dark, suspenseful, intriguing</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-semibold mb-2">Sci-Fi & Fantasy</h3>
                <p className="text-sm text-gray-600">Epic, imaginative, otherworldly</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">💼</div>
                <h3 className="font-semibold mb-2">Business & Self-Help</h3>
                <p className="text-sm text-gray-600">Professional, motivational, clear</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-semibold mb-2">Non-Fiction</h3>
                <p className="text-sm text-gray-600">Informative, trustworthy, expert</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">👶</div>
                <h3 className="font-semibold mb-2">Children's Books</h3>
                <p className="text-sm text-gray-600">Colorful, playful, imaginative</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🍳</div>
                <h3 className="font-semibold mb-2">Cookbooks</h3>
                <p className="text-sm text-gray-600">Appetizing, clean, organized</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Create Your Bestseller Cover?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Create professional Kindle book covers in seconds
            </p>
            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-gray-100"
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
              <h2 className="text-3xl font-bold mb-6 text-center">The Ultimate Kindle Cover Creator</h2>
              <p>
                Creating the perfect Kindle book cover is crucial for self-publishing success. Your cover is 
                the first thing potential readers see, and it can make the difference between a scroll-past 
                and a sale. Our AI-powered Kindle cover creator helps authors and publishers design professional, 
                genre-appropriate covers that attract readers and boost sales on Amazon KDP.
              </p>
              
              <h3>Why Professional Kindle Covers Matter</h3>
              <p>
                In the competitive world of self-publishing, your book cover serves as your primary marketing tool. 
                Studies show that professional book covers can increase sales by up to 300%. A well-designed cover:
              </p>
              <ul>
                <li>Communicates genre expectations at a glance</li>
                <li>Builds trust and perceived value</li>
                <li>Stands out in Amazon search results</li>
                <li>Encourages clicks and conversions</li>
                <li>Represents your brand as an author</li>
              </ul>
              
              <h3>Perfect Kindle Cover Dimensions</h3>
              <p>
                Amazon recommends Kindle covers be 2560x1600 pixels with a 1.6:1 aspect ratio. This ensures 
                your cover looks crisp on all devices - from smartphones to high-resolution tablets. Our tool 
                automatically generates covers in these exact dimensions, along with the proper file format 
                (JPEG) and color mode (RGB) required by Amazon KDP.
              </p>
              
              <h3>Genre-Specific Design Intelligence</h3>
              <p>
                Different book genres have distinct visual languages that readers instantly recognize. A romance 
                novel needs soft colors and emotional imagery, while a thriller demands dark tones and suspenseful 
                elements. Our AI understands these genre conventions and applies them intelligently, ensuring 
                your book appeals to its target audience from the first glance.
              </p>
              
              <h3>Typography That Sells Books</h3>
              <p>
                Readable typography is critical for book covers, especially at thumbnail size. Your title must 
                be legible when displayed at 100 pixels wide in Amazon search results. Our AI selects fonts 
                that balance aesthetics with readability, ensuring your title and author name are clear at any 
                size while maintaining professional appeal.
              </p>
              
              <h3>Free Professional Book Cover Design</h3>
              <p>
                Professional book cover design typically costs $200-$800. Our Kindle cover creator provides 
                the same quality completely free, with no watermarks or hidden fees. Whether you're a first-time 
                author or an established publisher, professional book marketing tools should be accessible to everyone.
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
                    What size should my Kindle book cover be?
                  </h3>
                  <p className="text-gray-600">
                    Amazon KDP recommends 2560x1600 pixels for Kindle eBook covers. Our tool automatically 
                    creates covers in this exact size, ensuring perfect display quality on all Kindle devices 
                    and apps without any cropping or distortion.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I use the same cover for paperback versions?
                  </h3>
                  <p className="text-gray-600">
                    Kindle eBooks and paperbacks require different specifications. Kindle covers need only 
                    the front cover (2560x1600), while paperbacks need a full wrap design including spine 
                    and back cover. Our tool focuses on Kindle covers but can export designs suitable for 
                    paperback adaptation.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    How do I make my book cover stand out on Amazon?
                  </h3>
                  <p className="text-gray-600">
                    Focus on bold, readable typography and genre-appropriate imagery. Your cover should be 
                    clearly visible at thumbnail size (about 100 pixels wide). Use high contrast between 
                    text and background, and include visual elements that instantly communicate your book's 
                    genre to browsing readers.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Are the generated covers copyright-free?
                  </h3>
                  <p className="text-gray-600">
                    Yes! All covers created with our AI tool are original designs that you own completely. 
                    You can use them for commercial purposes without attribution. The AI generates unique 
                    artwork for each request, ensuring your cover is one-of-a-kind and legally yours to use.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I edit the covers after generation?
                  </h3>
                  <p className="text-gray-600">
                    While our tool generates complete, ready-to-use covers, you can download them and make 
                    further edits in any image editing software. The high-resolution output (2560x1600) 
                    provides plenty of detail for additional customization if needed.
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