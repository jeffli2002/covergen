import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, BookOpen, Palette, Download, Award, Layers } from 'lucide-react'

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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            <p className="text-lg text-gray-600">
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
              <p className="text-gray-600">
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
              <p className="text-gray-600">
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
              <p className="text-gray-600">
                Professional covers that attract readers
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}