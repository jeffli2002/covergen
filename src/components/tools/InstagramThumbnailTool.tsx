'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Instagram, Image, Play, Camera, Hash } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const contentTypes = [
  'Fashion & Outfit',
  'Food & Recipe',
  'Fitness & Health',
  'Travel & Adventure',
  'Beauty & Makeup',
  'Home & DIY',
  'Art & Design',
  'Educational',
  'Lifestyle',
  'Tech & Gaming'
]

const visualStyles = [
  'Minimalist & Clean',
  'Bold & Vibrant',
  'Aesthetic & Dreamy',
  'Dark & Moody',
  'Bright & Cheerful',
  'Professional',
  'Retro & Vintage',
  'Modern & Trendy'
]

const formatOptions = [
  { value: 'reels', label: 'Reels/IGTV', ratio: '9:16', size: '1080x1920' },
  { value: 'feed', label: 'Feed Post', ratio: '1:1', size: '1080x1080' },
  { value: 'story', label: 'Story/Highlights', ratio: '9:16', size: '1080x1920' },
]

export default function InstagramThumbnailTool() {
  const [contentTitle, setContentTitle] = useState('')
  const [contentType, setContentType] = useState('Lifestyle')
  const [visualStyle, setVisualStyle] = useState('Modern & Trendy')
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [format, setFormat] = useState('reels')
  const [brandColors, setBrandColors] = useState('')
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!contentTitle) return

    setLoading(true)
    setOutputs([]) // Clear previous results
    
    try {
      // Get the selected format details
      const selectedFormat = formatOptions.find(f => f.value === format)
      
      // Build the Instagram-specific prompt
      const instagramPrompt = `Instagram thumbnail design. Content: "${contentTitle}". Format: ${selectedFormat?.label} (${selectedFormat?.ratio}, ${selectedFormat?.size}px). Content type: ${contentType}. Visual style: ${visualStyle}. ${description ? `Description: ${description}.` : ''} ${hashtags ? `Hashtags: ${hashtags}.` : ''} ${brandColors ? `Brand colors: ${brandColors}.` : ''} Eye-catching Instagram thumbnail optimized for maximum engagement and scrolling stop rate.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: instagramPrompt,
          mode: 'text',
          style: 'modern',
          platform: format === 'feed' ? 'instagram' : 'instagram-story', // Use appropriate platform
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      
      // Set only the first image from the response
      if (data.images && data.images.length > 0) {
        setOutputs([data.images[0]])
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    setDownloadingId(`image_${index}`)
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `instagram-${format}-thumbnail-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleGenerateNew = () => {
    setOutputs([])
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Instagram Thumbnail Generator
        </h1>
        <p className="text-lg text-gray-900 max-w-3xl mx-auto">
          Create perfect thumbnails for Reels, Feed posts, and Stories
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Design Your Instagram Thumbnail</h2>
              <p className="text-gray-900">
                Enter your content details to generate an engaging thumbnail
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="format">Instagram Format *</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <span className="font-medium">{option.label}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {option.ratio} • {option.size}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content-title">Content Title *</Label>
                <Input
                  id="content-title"
                  placeholder="e.g., 5-Minute Morning Routine"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger id="content-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="visual-style">Visual Style</Label>
                <Select value={visualStyle} onValueChange={setVisualStyle}>
                  <SelectTrigger id="visual-style" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visualStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hashtags">Hashtags (Optional)</Label>
                <Input
                  id="hashtags"
                  placeholder="e.g., #morningroutine #productivity #lifestyle"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="brand-colors">Brand Colors (Optional)</Label>
                <Input
                  id="brand-colors"
                  placeholder="e.g., Pink and gold, Pastel blue"
                  value={brandColors}
                  onChange={(e) => setBrandColors(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Additional Details (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any specific elements or text you want to include..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!contentTitle || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Instagram Thumbnail
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <OutputGallery
            generatedImages={outputs}
            downloadingId={downloadingId}
            onDownload={handleDownload}
            onGenerateNew={handleGenerateNew}
            isGenerating={loading}
            platform={format === 'feed' ? 'instagram' : 'instagram-story'}
          />
        </div>
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">
          Instagram Thumbnail Tips
        </h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Use bright, high-contrast colors for better visibility in feeds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Include faces when possible - they increase engagement by 38%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Keep text minimal and readable on mobile devices</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Maintain consistent brand aesthetics across all thumbnails</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}