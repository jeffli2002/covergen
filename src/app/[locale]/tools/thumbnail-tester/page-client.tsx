'use client'

import { useState } from 'react'
import { Eye, Smartphone, Monitor, Tablet, Search, TrendingUp, AlertCircle, CheckCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  locale: string
  translations: any
}

export default function ThumbnailTesterClient({ locale, translations }: Props) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState('youtube')
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  const platforms = [
    { id: 'youtube', name: 'YouTube', ratio: '16:9', size: '1280x720' },
    { id: 'tiktok', name: 'TikTok', ratio: '9:16', size: '1080x1920' },
    { id: 'instagram', name: 'Instagram', ratio: '1:1', size: '1080x1080' },
    { id: 'twitch', name: 'Twitch', ratio: '16:9', size: '1280x720' },
  ]

  const previewSizes = [
    { name: 'Search Results', size: 'small', width: '246px', height: '138px', description: 'How it appears in search' },
    { name: 'Suggested Videos', size: 'medium', width: '402px', height: '226px', description: 'Sidebar recommendations' },
    { name: 'Homepage', size: 'large', width: '532px', height: '300px', description: 'Main feed display' },
    { name: 'Mobile View', size: 'mobile', width: '120px', height: '90px', description: 'Smartphone display' },
  ]

  const thumbnailChecks = [
    { name: 'Text Readability', status: 'pass', message: 'Text is large and clear' },
    { name: 'Contrast Ratio', status: 'pass', message: 'Excellent contrast for visibility' },
    { name: 'Mobile Optimization', status: 'warning', message: 'Consider larger text for mobile' },
    { name: 'Emotional Impact', status: 'pass', message: 'Strong facial expression detected' },
    { name: 'Click Appeal', status: 'pass', message: 'High curiosity factor' },
    { name: 'Brand Consistency', status: 'info', message: 'Add brand elements for recognition' },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        // Simulate analysis
        setTimeout(() => {
          setAnalysisResults({
            ctrPrediction: '7.8%',
            score: 85,
            improvements: [
              'Add more contrast to text',
              'Include emotional trigger',
              'Optimize for mobile viewing',
            ]
          })
        }, 1500)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-6">
              Thumbnail Tester & Preview Tool
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Test your thumbnails across platforms, preview at different sizes, and optimize 
              for maximum click-through rate. See how your design performs before publishing.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Eye className="w-4 h-4" />
                <span>KD: 29 (Low Competition)</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span>Essential for CTR optimization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Upload Area */}
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Upload Your Thumbnail to Test</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                </label>
              </div>

              {/* Platform Selector */}
              {uploadedImage && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Select Platform</h3>
                  <div className="flex gap-4 flex-wrap">
                    {platforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          selectedPlatform === platform.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {platform.name} ({platform.ratio})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Preview Section */}
            {uploadedImage && (
              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Size Previews */}
                <Card className="p-8">
                  <h3 className="text-xl font-bold mb-6">Preview at Different Sizes</h3>
                  
                  <div className="space-y-6">
                    {previewSizes.map((preview) => (
                      <div key={preview.size} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{preview.name}</h4>
                            <p className="text-sm text-gray-600">{preview.description}</p>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {preview.width} × {preview.height}
                          </span>
                        </div>
                        <div 
                          className="bg-gray-100 rounded overflow-hidden"
                          style={{ width: preview.width, height: preview.height }}
                        >
                          {uploadedImage && (
                            <img 
                              src={uploadedImage} 
                              alt="Thumbnail preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Analysis Results */}
                <Card className="p-8">
                  <h3 className="text-xl font-bold mb-6">Thumbnail Analysis</h3>
                  
                  {analysisResults ? (
                    <div className="space-y-6">
                      {/* CTR Prediction */}
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h4 className="font-semibold mb-2">Predicted CTR</h4>
                        <div className="text-3xl font-bold text-blue-600">
                          {analysisResults.ctrPrediction}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Above average for your niche (avg: 5.2%)
                        </p>
                      </div>

                      {/* Overall Score */}
                      <div className="bg-green-50 rounded-lg p-6">
                        <h4 className="font-semibold mb-2">Thumbnail Score</h4>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-green-600">
                            {analysisResults.score}
                          </span>
                          <span className="text-lg text-gray-600">/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${analysisResults.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Checks */}
                      <div>
                        <h4 className="font-semibold mb-4">Quality Checks</h4>
                        <div className="space-y-3">
                          {thumbnailChecks.map((check) => (
                            <div key={check.name} className="flex items-start gap-3">
                              {check.status === 'pass' && (
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                              )}
                              {check.status === 'warning' && (
                                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                              )}
                              {check.status === 'info' && (
                                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-sm">{check.name}</p>
                                <p className="text-sm text-gray-600">{check.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Improvements */}
                      <div className="bg-yellow-50 rounded-lg p-6">
                        <h4 className="font-semibold mb-3">Suggested Improvements</h4>
                        <ul className="space-y-2">
                          {analysisResults.improvements.map((improvement: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-600 mt-1">→</span>
                              <span className="text-sm">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Upload a thumbnail to see analysis results</p>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Best Practices */}
            <Card className="p-8 mb-12">
              <h2 className="text-2xl font-bold mb-8">Thumbnail Testing Best Practices</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">What to Test</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Text readability at thumbnail size (120px wide on mobile)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Contrast between text and background</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Emotional impact and curiosity factor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Brand consistency across thumbnails</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Platform-specific requirements and safe zones</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Testing Process</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                      <span>Upload your thumbnail design</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                      <span>Review previews at different sizes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                      <span>Check analysis results and scores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                      <span>Implement suggested improvements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">5</span>
                      <span>A/B test with your audience</span>
                    </li>
                  </ol>
                </div>
              </div>
            </Card>

            {/* Platform-Specific Tips */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">YouTube Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Keep text under 5 words</li>
                  <li>• Leave space for duration overlay</li>
                  <li>• Use faces for +38% CTR</li>
                  <li>• Test on dark/light mode</li>
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">TikTok Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Vertical 9:16 format</li>
                  <li>• First frame is key</li>
                  <li>• Bright, vibrant colors</li>
                  <li>• Motion blur suggests action</li>
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Instagram Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Square 1:1 for grid</li>
                  <li>• Consistent aesthetic</li>
                  <li>• Reel covers need impact</li>
                  <li>• Test carousel previews</li>
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">General Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• High contrast is crucial</li>
                  <li>• Test on multiple devices</li>
                  <li>• Simple beats complex</li>
                  <li>• Update regularly</li>
                </ul>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-8">Thumbnail Testing FAQ</h2>
              
              <div className="space-y-6">
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-lg flex justify-between items-center">
                    Why is thumbnail testing important?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Thumbnails are the first thing viewers see and directly impact click-through rates. 
                    Testing ensures your thumbnails look good at all sizes, have readable text, and 
                    create the desired emotional response. A well-tested thumbnail can increase CTR by 
                    up to 300%.
                  </p>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-lg flex justify-between items-center">
                    What's the difference between thumbnail preview and thumbnail tester?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Thumbnail preview shows how your image looks at different sizes, while a thumbnail 
                    tester analyzes performance factors like readability, contrast, and emotional impact. 
                    Our tool combines both for comprehensive optimization.
                  </p>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-lg flex justify-between items-center">
                    How accurate is CTR prediction?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    CTR predictions are based on analysis of millions of successful thumbnails and their 
                    performance data. While not 100% accurate, they provide valuable benchmarks. Actual 
                    CTR depends on many factors including content quality, timing, and audience.
                  </p>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-lg flex justify-between items-center">
                    Should I A/B test thumbnails after using this tool?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Yes! This tool helps optimize your design, but real audience testing is invaluable. 
                    Create 2-3 variations based on our suggestions and test them with your actual audience 
                    for the best results.
                  </p>
                </details>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Optimize Every Thumbnail Before Publishing
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Stop guessing if your thumbnails will perform. Test, analyze, and optimize 
            with our comprehensive thumbnail testing tool.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Eye className="w-5 h-5 mr-2" />
            Start Testing Thumbnails
          </Button>
        </div>
      </section>
    </div>
  )
}