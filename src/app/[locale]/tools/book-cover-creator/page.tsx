import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, BookOpen, Palette, Download, Award, Layers, Star, Wand2, Shield, Zap, Share2, PenTool } from 'lucide-react'

// Lazy load the tool component
const BookCoverTool = dynamic(() => import('@/components/tools/BookCoverCreatorTool'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const metadata: Metadata = {
  title: 'Book Cover Creator - AI Book Cover Design Tool | CoverGen Pro',
  description: 'Design stunning book covers with AI. Perfect for novels, eBooks, self-publishing. Create professional covers for Amazon KDP, print books, and digital publications.',
  keywords: 'book cover creator, book cover maker, ebook cover design, novel cover generator, AI book cover, self publishing cover',
  openGraph: {
    title: 'Free Book Cover Creator - AI-Powered Book Design | CoverGen Pro',
    description: 'Create professional book covers in minutes. Perfect for authors, self-publishers, and indie writers.',
    type: 'website',
  },
}

export default function BookCoverCreatorPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 to-brown-700 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Professional Book Covers
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Book Cover Creator
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Design stunning book covers with AI. Perfect for novels, eBooks, and self-publishing.
              Create covers that sell your story.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#generator">
                <Button 
                  size="lg" 
                  className="bg-white text-amber-700 hover:bg-gray-100 px-8 shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Book Cover
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-white/80">Genre Styles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100K+</div>
                <div className="text-sm text-white/80">Books Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">KDP</div>
                <div className="text-sm text-white/80">Ready Formats</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">300DPI</div>
                <div className="text-sm text-white/80">Print Quality</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Component */}
      <section className="py-12" id="generator">
        <div className="container mx-auto px-4">
          <BookCoverTool />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Book Design Features
            </h2>
            <p className="text-lg text-gray-900">
              Everything authors need for professional book covers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Genre-Specific Styles
              </h3>
              <p className="text-gray-900">
                Tailored designs for every book genre
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Print & Digital Ready
              </h3>
              <p className="text-gray-900">
                Export for KDP, print, and eBook formats
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bestseller Quality
              </h3>
              <p className="text-gray-900">
                Professional covers that attract readers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Custom Typography
              </h3>
              <p className="text-gray-900">
                Professional fonts and title treatments
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Instant Generation
              </h3>
              <p className="text-gray-900">
                Multiple cover options in seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Copyright Safe
              </h3>
              <p className="text-gray-900">
                Original artwork with commercial rights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Book Genres Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Book Cover Styles
            </h2>
            <p className="text-lg text-gray-900">
              Choose from genre-specific designs that readers love
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🏰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fantasy & Sci-Fi</h3>
              <p className="text-sm text-gray-900">Epic landscapes, mystical elements</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">💕</div>
              <h3 className="font-semibold text-gray-900 mb-2">Romance</h3>
              <p className="text-sm text-gray-900">Elegant typography, romantic imagery</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Mystery & Thriller</h3>
              <p className="text-sm text-gray-900">Dark atmospheres, suspenseful design</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-2">Non-Fiction</h3>
              <p className="text-sm text-gray-900">Clean, professional, authoritative</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">👶</div>
              <h3 className="font-semibold text-gray-900 mb-2">Children's Books</h3>
              <p className="text-sm text-gray-900">Colorful, playful illustrations</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900 mb-2">Business & Self-Help</h3>
              <p className="text-sm text-gray-900">Modern, motivational designs</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">📖</div>
              <h3 className="font-semibold text-gray-900 mb-2">Literary Fiction</h3>
              <p className="text-sm text-gray-900">Artistic, thoughtful aesthetics</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">👻</div>
              <h3 className="font-semibold text-gray-900 mb-2">Horror</h3>
              <p className="text-sm text-gray-900">Dark, atmospheric, chilling</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Design Your Bestseller?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of authors creating professional book covers with AI
          </p>
          <Link href="#generator">
            <Button 
              size="lg" 
              className="bg-white text-amber-600 hover:bg-gray-100"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your Book Cover
            </Button>
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg prose-seo">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Professional Book Cover Design Made Simple</h2>
            <p className="text-gray-900">
              Creating a compelling book cover is one of the most critical aspects of successful book publishing. 
              Our AI-powered book cover creator helps authors, self-publishers, and indie writers design professional 
              covers that capture their story's essence and appeal to their target readers.
            </p>
            
            <h3 className="text-gray-900 font-semibold">Perfect for Every Publishing Platform</h3>
            <p className="text-gray-900">
              Whether you're publishing on Amazon KDP, IngramSpark, Draft2Digital, or selling directly to readers, 
              our book cover creator provides the exact specifications you need. Generate covers optimized for print 
              books with full bleed and spine calculations, or create stunning eBook covers that look great as 
              thumbnails. Every design is export-ready at 300 DPI for professional printing.
            </p>
            
            <h3 className="text-gray-900 font-semibold">Genre-Specific Design Intelligence</h3>
            <p className="text-gray-900">
              Our AI understands the visual language of different book genres. Romance novels get elegant scripts 
              and warm colors, thrillers receive bold typography and dark atmospheres, while children's books 
              feature playful illustrations. The system analyzes bestselling covers in your genre to ensure your 
              book fits market expectations while standing out on the shelf.
            </p>
            
            <h3 className="text-gray-900 font-semibold">Complete Creative Control</h3>
            <p className="text-gray-900">
              Start with AI-generated concepts based on your book title, author name, and genre, then customize 
              every element. Adjust fonts, colors, and layouts to match your vision. Add subtitles, series 
              information, endorsements, or awards. Our tool handles complex typography requirements including 
              special characters for international titles and pen names.
            </p>
            
            <h3 className="text-gray-900 font-semibold">Save Time and Money on Book Design</h3>
            <p className="text-gray-900">
              Professional book cover design typically costs $300-800 per cover. With our book cover creator, 
              generate unlimited designs for free. Perfect for authors testing different concepts, series with 
              multiple books, or publishers managing large catalogs. Pro users get access to premium templates, 
              advanced customization options, and priority processing for time-sensitive projects.
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
                  What book formats does the cover creator support?
                </h3>
                <p className="text-gray-900">
                  Our tool supports all major formats including paperback, hardcover, and eBook. We provide templates 
                  for Amazon KDP (including KDP Select), IngramSpark, Barnes & Noble Press, and standard print sizes 
                  from 5"x8" to 8.5"x11". Covers include proper bleed, spine width calculations, and trim marks.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I use these covers for commercial books?
                </h3>
                <p className="text-gray-900">
                  Yes! All covers created with our tool come with full commercial rights. You own the final design 
                  and can use it for books you sell, whether traditionally published, self-published, or distributed 
                  through any platform. Pro users also get extended licensing for merchandise and marketing materials.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I add my book's spine and back cover?
                </h3>
                <p className="text-gray-900">
                  For print books, simply enter your page count and we'll calculate the exact spine width. Our tool 
                  generates a complete wraparound cover including front, spine, and back cover areas. Add your book 
                  description, author bio, ISBN, and barcode placement - everything you need for professional printing.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I create a series with consistent branding?
                </h3>
                <p className="text-gray-900">
                  Absolutely! Save your design as a template and use it across your entire series. Maintain consistent 
                  fonts, layouts, and styling while changing specific elements like titles and imagery. Perfect for 
                  multi-book series, box sets, or maintaining author brand consistency.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What resolution are the exported covers?
                </h3>
                <p className="text-gray-900">
                  Free users can export covers at web resolution (150 DPI) suitable for eBooks and online promotion. 
                  Pro users get print-ready exports at 300 DPI with CMYK color profiles, meeting all professional 
                  printing requirements. All exports include proper bleeds and trim marks for commercial printing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}