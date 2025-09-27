'use client'

import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, Eye, CheckCircle, AlertCircle, BarChart3, Search, Monitor, Shield } from 'lucide-react'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { generateStructuredData } from '@/lib/seo-utils'

// Lazy load the Thumbnail Tester Tool
const ThumbnailTesterTool = dynamic(
  () => import(/* webpackChunkName: "thumbnail-tester-tool" */ '@/components/tools/ThumbnailTesterTool'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
  }
)

interface ThumbnailTesterClientProps {
  locale: Locale
  translations: any
}

export default function ThumbnailTesterClient({ locale, translations: t }: ThumbnailTesterClientProps) {
  const breadcrumbItems = [
    { name: 'Tools', href: `/${locale}/tools` },
    { name: 'Thumbnail Tester', current: true }
  ]

  // Structured data for this page
  const structuredData = generateStructuredData('howto', {
    title: 'How to Test and Optimize Thumbnails for Maximum CTR',
    description: 'Step-by-step guide to testing thumbnails across different platforms and sizes',
    steps: [
      { name: 'Upload Your Thumbnail', text: 'Upload your thumbnail design to test' },
      { name: 'Select Platform', text: 'Choose YouTube, TikTok, Instagram, or other platforms' },
      { name: 'Preview Different Sizes', text: 'See how your thumbnail looks at various display sizes' },
      { name: 'Analyze Performance', text: 'Get AI-powered insights on CTR potential' },
      { name: 'Apply Improvements', text: 'Optimize based on recommendations' }
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
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-teal-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full text-green-700 text-sm font-medium mb-6">
                <BarChart3 className="w-4 h-4" />
                AI-Powered Thumbnail Analysis
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Thumbnail Tester & Preview Tool
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Test how your thumbnails look on YouTube, TikTok, and other platforms. Preview different sizes, 
                analyze CTR potential, and optimize your designs for maximum engagement.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8"
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
                  Test Your Thumbnail
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">Multi</div>
                  <div className="text-sm text-gray-600">Platform Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">AI</div>
                  <div className="text-sm text-gray-600">Smart Analysis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">CTR</div>
                  <div className="text-sm text-gray-600">Optimization</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">Free</div>
                  <div className="text-sm text-gray-600">No Limits</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Component */}
        <section className="py-12" id="generator">
          <div className="container mx-auto px-4">
            <ThumbnailTesterTool />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Comprehensive Thumbnail Testing Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to optimize thumbnails for maximum click-through rates
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Multi-Size Preview
                </h3>
                <p className="text-gray-600">
                  See how your thumbnail appears in search results, suggested videos, and mobile views
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  CTR Analysis
                </h3>
                <p className="text-gray-600">
                  AI-powered predictions of click-through rate based on design elements and best practices
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Platform-Specific Testing
                </h3>
                <p className="text-gray-600">
                  Optimized testing for YouTube, TikTok, Instagram, Twitch, and other platforms
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Quality Checks
                </h3>
                <p className="text-gray-600">
                  Automated checks for text readability, contrast, mobile optimization, and visual impact
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Improvement Suggestions
                </h3>
                <p className="text-gray-600">
                  Get actionable recommendations to improve your thumbnail's performance
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
                  Ensure your thumbnails maintain consistent branding across all content
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Best Practices */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Platform-Specific Thumbnail Guidelines
              </h2>
              <p className="text-lg text-gray-600">
                Optimize for each platform's unique requirements and best practices
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📺</div>
                <h3 className="font-semibold mb-2">YouTube</h3>
                <p className="text-sm text-gray-600">1280x720px, faces increase CTR by 38%</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎵</div>
                <h3 className="font-semibold mb-2">TikTok</h3>
                <p className="text-sm text-gray-600">1080x1920px, vertical format, vibrant colors</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📷</div>
                <h3 className="font-semibold mb-2">Instagram</h3>
                <p className="text-sm text-gray-600">1080x1080px, consistent aesthetic</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🎮</div>
                <h3 className="font-semibold mb-2">Twitch</h3>
                <p className="text-sm text-gray-600">1280x720px, bold text, gaming focus</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">👔</div>
                <h3 className="font-semibold mb-2">LinkedIn</h3>
                <p className="text-sm text-gray-600">1200x627px, professional tone</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">🐦</div>
                <h3 className="font-semibold mb-2">Twitter</h3>
                <p className="text-sm text-gray-600">1200x675px, clear messaging</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">👻</div>
                <h3 className="font-semibold mb-2">Snapchat</h3>
                <p className="text-sm text-gray-600">1080x1920px, fun and creative</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-3">📌</div>
                <h3 className="font-semibold mb-2">Pinterest</h3>
                <p className="text-sm text-gray-600">1000x1500px, tall format, descriptive</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stop Guessing - Start Testing Your Thumbnails
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Optimize every thumbnail for maximum clicks and engagement
            </p>
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100"
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
              Test Your Thumbnails Now
            </Button>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg prose-seo">
              <h2 className="text-3xl font-bold mb-6 text-center">The Complete Guide to Thumbnail Testing</h2>
              <p>
                Thumbnails are the gateway to your content. They're the first thing viewers see and the primary 
                factor in whether they click or scroll past. Our thumbnail tester helps you optimize these crucial 
                visual elements for maximum impact across all platforms.
              </p>
              
              <h3>Why Thumbnail Testing is Essential</h3>
              <p>
                Studies show that 90% of the best-performing videos on YouTube have custom thumbnails. The right 
                thumbnail can increase your click-through rate by up to 300%, directly impacting your content's 
                reach and success. Yet many creators upload thumbnails without testing how they'll actually appear 
                to viewers.
              </p>
              <ul>
                <li>Test readability at different sizes - what looks good full-screen may be illegible on mobile</li>
                <li>Check contrast and visibility in both light and dark modes</li>
                <li>Ensure key elements aren't cropped on different platforms</li>
                <li>Analyze emotional impact and curiosity factors</li>
                <li>Compare against successful thumbnails in your niche</li>
              </ul>
              
              <h3>Platform-Specific Optimization</h3>
              <p>
                Each platform has unique requirements and viewer behaviors. YouTube viewers expect faces and 
                emotions, TikTok users respond to dynamic, colorful previews, and LinkedIn audiences prefer 
                professional, clean designs. Our tool helps you optimize for each platform's specific needs 
                while maintaining your brand consistency.
              </p>
              
              <h3>The Science of Click-Worthy Thumbnails</h3>
              <p>
                Effective thumbnails combine psychology, design principles, and platform best practices. Key 
                elements include high contrast for visibility, faces for human connection, clear readable text, 
                and visual elements that create curiosity or promise value. Our AI analyzes these factors to 
                predict performance and suggest improvements.
              </p>
              
              <h3>Testing Process and Best Practices</h3>
              <p>
                Start by uploading your thumbnail design and selecting your target platform. Our tool shows how 
                it appears in search results, suggested videos, mobile feeds, and other key locations. The AI 
                analysis provides a predicted CTR score, quality checks for technical issues, and specific 
                suggestions for improvement. Use these insights to refine your design before publishing.
              </p>
              
              <h3>Free Professional Thumbnail Testing</h3>
              <p>
                Unlike premium analytics tools that charge monthly fees, our thumbnail tester is completely free 
                with no limits on testing. Whether you're a beginner creator or managing multiple channels, you 
                get the same professional-grade analysis tools. Test unlimited designs, compare variations, and 
                optimize every thumbnail for maximum performance.
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
                    How accurate is the CTR prediction?
                  </h3>
                  <p className="text-gray-600">
                    Our AI analyzes patterns from millions of successful thumbnails to provide CTR predictions. 
                    While not 100% accurate (actual performance depends on content quality and audience), our 
                    predictions offer valuable benchmarks and typically fall within 15-20% of actual results.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Can I test thumbnails for any platform?
                  </h3>
                  <p className="text-gray-600">
                    Yes! We support all major platforms including YouTube, TikTok, Instagram, Twitch, LinkedIn, 
                    Twitter, Snapchat, and Pinterest. Each platform test is optimized for that platform's specific 
                    dimensions, display contexts, and best practices.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    What makes a thumbnail "click-worthy"?
                  </h3>
                  <p className="text-gray-600">
                    Click-worthy thumbnails combine several elements: clear readable text (usually under 5 words), 
                    high contrast for visibility, emotional faces or expressions, curiosity-inducing visuals, 
                    consistent branding, and platform-appropriate styling. Our tool analyzes all these factors.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Should I A/B test thumbnails after using this tool?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! Our tool helps you create optimized thumbnails, but real-world testing with your 
                    actual audience provides the most accurate data. Create 2-3 variations based on our suggestions 
                    and test them with your viewers for best results.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    How often should I update my thumbnails?
                  </h3>
                  <p className="text-gray-600">
                    For evergreen content, test and potentially update thumbnails every 3-6 months as design 
                    trends evolve. For trending content, ensure thumbnails are optimized from the start. Always 
                    update if you notice declining CTR or when platform algorithms change.
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