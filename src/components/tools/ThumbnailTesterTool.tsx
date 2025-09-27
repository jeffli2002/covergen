'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  Eye, 
  Monitor, 
  Smartphone, 
  Tablet,
  BarChart3,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Image from 'next/image'

interface AnalysisResult {
  ctrPrediction: number
  score: number
  checks: {
    name: string
    status: 'pass' | 'warning' | 'fail' | 'info'
    message: string
  }[]
  improvements: string[]
}

interface Platform {
  id: string
  name: string
  aspectRatio: string
  width: number
  height: number
  icon: string
}

const platforms: Platform[] = [
  { id: 'youtube', name: 'YouTube', aspectRatio: '16:9', width: 1280, height: 720, icon: '📺' },
  { id: 'tiktok', name: 'TikTok', aspectRatio: '9:16', width: 1080, height: 1920, icon: '🎵' },
  { id: 'instagram', name: 'Instagram', aspectRatio: '1:1', width: 1080, height: 1080, icon: '📷' },
  { id: 'twitch', name: 'Twitch', aspectRatio: '16:9', width: 1280, height: 720, icon: '🎮' },
  { id: 'linkedin', name: 'LinkedIn', aspectRatio: '1.91:1', width: 1200, height: 627, icon: '👔' },
  { id: 'twitter', name: 'Twitter', aspectRatio: '16:9', width: 1200, height: 675, icon: '🐦' }
]

const previewSizes = [
  { name: 'Search Results', size: 'search', scale: 0.2, description: 'How it appears in search' },
  { name: 'Suggested', size: 'suggested', scale: 0.35, description: 'Sidebar recommendations' },
  { name: 'Homepage', size: 'homepage', scale: 0.5, description: 'Main feed display' },
  { name: 'Mobile', size: 'mobile', scale: 0.15, description: 'Smartphone display' }
]

export default function ThumbnailTesterTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(platforms[0])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        analyzeImage()
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setAnalysisResult({
        ctrPrediction: 7.8,
        score: 85,
        checks: [
          { name: 'Text Readability', status: 'pass', message: 'Text is large and clear' },
          { name: 'Contrast Ratio', status: 'pass', message: 'Excellent contrast for visibility' },
          { name: 'Mobile Optimization', status: 'warning', message: 'Consider larger text for mobile' },
          { name: 'Emotional Impact', status: 'pass', message: 'Strong visual appeal detected' },
          { name: 'Click Appeal', status: 'pass', message: 'High curiosity factor' },
          { name: 'Brand Consistency', status: 'info', message: 'Add brand elements for recognition' }
        ],
        improvements: [
          'Increase text size by 20% for better mobile readability',
          'Add a subtle border to make thumbnail stand out in feeds',
          'Consider using warmer colors to increase emotional response'
        ]
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'fail':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Upload Section */}
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Upload Your Thumbnail</h2>
              <p className="text-gray-600">Test your thumbnail across platforms and get AI-powered optimization suggestions</p>
            </div>

            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                dragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400",
                uploadedImage && "p-6"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={uploadedImage}
                      alt="Uploaded thumbnail"
                      className="max-w-md max-h-64 rounded-lg shadow-lg mx-auto"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setUploadedImage(null)
                        setAnalysisResult(null)
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Drop your thumbnail here or click to browse</p>
                  <p className="text-sm text-gray-500 mb-4">Supports PNG, JPG, WEBP up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label htmlFor="thumbnail-upload">
                    <Button asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </>
              )}
            </div>

            {/* Platform Selector */}
            {uploadedImage && (
              <div>
                <Label className="text-base font-semibold mb-3 block">Select Platform</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all text-center",
                        selectedPlatform.id === platform.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="text-2xl mb-1">{platform.icon}</div>
                      <div className="text-sm font-medium">{platform.name}</div>
                      <div className="text-xs text-gray-500">{platform.aspectRatio}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview and Analysis */}
      {uploadedImage && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Size Previews */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">Size Previews - {selectedPlatform.name}</h3>
              
              <div className="space-y-6">
                {previewSizes.map((preview) => (
                  <div key={preview.size} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{preview.name}</h4>
                        <p className="text-sm text-gray-600">{preview.description}</p>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {Math.round(selectedPlatform.width * preview.scale)}x
                        {Math.round(selectedPlatform.height * preview.scale)}px
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded overflow-hidden inline-block">
                      <div
                        style={{
                          width: selectedPlatform.width * preview.scale,
                          height: selectedPlatform.height * preview.scale,
                          position: 'relative'
                        }}
                      >
                        <img
                          src={uploadedImage}
                          alt={`${preview.name} preview`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Thumbnail Analysis</h3>
                {!analysisResult && uploadedImage && (
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analyze Thumbnail
                      </>
                    )}
                  </Button>
                )}
              </div>

              {analysisResult ? (
                <div className="space-y-6">
                  {/* CTR Prediction */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-2">Predicted CTR</h4>
                    <div className="text-3xl font-bold text-blue-600">
                      {analysisResult.ctrPrediction}%
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Above average for your niche (avg: 5.2%)
                    </p>
                  </div>

                  {/* Overall Score */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-2">Thumbnail Score</h4>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-green-600">
                        {analysisResult.score}
                      </span>
                      <span className="text-lg text-gray-600">/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${analysisResult.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Quality Checks */}
                  <div>
                    <h4 className="font-semibold mb-4">Quality Checks</h4>
                    <div className="space-y-3">
                      {analysisResult.checks.map((check, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {getStatusIcon(check.status)}
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
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                      Suggested Improvements
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Analysis Report
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Analyze Thumbnail" to get insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips Alert */}
      {uploadedImage && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Pro Tip:</strong> Test multiple variations of your thumbnail to find what works best. 
            Small changes like text size, colors, or facial expressions can significantly impact CTR.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}