'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Instagram, Facebook, Linkedin, Twitter, Hash, Image as ImageIcon, Share2, Heart } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const platformPresets = [
  { 
    value: 'instagram-post', 
    label: 'Instagram Post', 
    size: '1080x1080',
    icon: Instagram,
    keywords: ['instagram post maker', 'instagram grid maker', 'instagram carousel'],
    popular: true
  },
  { 
    value: 'instagram-story', 
    label: 'Instagram Story', 
    size: '1080x1920',
    icon: Instagram,
    keywords: ['instagram story maker', 'instagram story template']
  },
  { 
    value: 'facebook-post', 
    label: 'Facebook Post', 
    size: '1200x630',
    icon: Facebook,
    keywords: ['facebook post maker', 'facebook banner maker']
  },
  { 
    value: 'facebook-cover', 
    label: 'Facebook Cover', 
    size: '820x312',
    icon: Facebook,
    keywords: ['facebook cover photo maker', 'facebook header maker'],
    popular: true
  },
  { 
    value: 'linkedin-post', 
    label: 'LinkedIn Post', 
    size: '1200x627',
    icon: Linkedin,
    keywords: ['linkedin post maker', 'linkedin article image']
  },
  { 
    value: 'linkedin-banner', 
    label: 'LinkedIn Banner', 
    size: '1584x396',
    icon: Linkedin,
    keywords: ['linkedin banner maker', 'linkedin header maker'],
    trending: true
  },
  { 
    value: 'twitter-post', 
    label: 'X (Twitter) Post', 
    size: '1200x675',
    icon: Twitter,
    keywords: ['twitter post maker', 'x post maker']
  },
  { 
    value: 'twitter-header', 
    label: 'X (Twitter) Header', 
    size: '1500x500',
    icon: Twitter,
    keywords: ['twitter header maker', 'x banner maker']
  },
  { 
    value: 'pinterest-pin', 
    label: 'Pinterest Pin', 
    size: '1000x1500',
    icon: Hash,
    keywords: ['pinterest pin maker', 'pinterest pin cover creator'],
    trending: true
  },
  { 
    value: 'reddit-banner', 
    label: 'Reddit Banner', 
    size: '1920x384',
    icon: Hash,
    keywords: ['reddit banner maker free', 'reddit header maker'],
    lowCompetition: true
  },
]

const stylePresets = [
  { value: 'modern', label: 'Modern & Clean', description: 'Minimalist design with bold typography' },
  { value: 'viral', label: 'Viral & Trendy', description: 'Eye-catching designs that get shared' },
  { value: 'professional', label: 'Professional', description: 'Business-ready designs' },
  { value: 'gradient', label: 'Gradient & Colorful', description: 'Vibrant gradients and colors' },
  { value: 'minimal', label: 'Minimalist', description: 'Less is more approach' },
  { value: 'retro', label: 'Retro & Vintage', description: 'Nostalgic aesthetic' },
]

const templates = [
  { id: 1, name: 'Motivational Quote', tags: ['quote', 'inspiration', 'viral'] },
  { id: 2, name: 'Product Showcase', tags: ['business', 'marketing', 'sales'] },
  { id: 3, name: 'Event Announcement', tags: ['event', 'announcement', 'promotion'] },
  { id: 4, name: 'Tips & Tricks', tags: ['educational', 'howto', 'value'] },
  { id: 5, name: 'Before & After', tags: ['transformation', 'comparison', 'results'] },
  { id: 6, name: 'User Testimonial', tags: ['review', 'social proof', 'testimonial'] },
]

export default function SocialMediaPosterTool() {
  const [platform, setPlatform] = useState('instagram-post')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('modern')
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const selectedPlatform = platformPresets.find(p => p.value === platform)

  const handleGenerate = async () => {
    if (!title.trim()) return
    
    setIsGenerating(true)
    setGeneratedImages([])
    
    try {
      const socialPrompt = `Social media poster design for ${selectedPlatform?.label}. Title: "${title}". ${description ? `Description: ${description}` : ''} Style: ${stylePresets.find(s => s.value === style)?.label}. ${selectedTemplate ? `Template: ${templates.find(t => t.id === selectedTemplate)?.name}` : ''} Professional high-quality social media design.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: socialPrompt,
          mode: 'text',
          style: style || 'modern',
          platform: 'none',
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      
      if (data.images && data.images.length > 0) {
        setGeneratedImages([data.images[0]])
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
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
      a.download = `social-media-${Date.now()}.png`
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
    setGeneratedImages([])
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Social Media Poster Maker
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Create viral social media posts, banners, and graphics for Instagram, Facebook, LinkedIn, Twitter/X, Reddit, and Pinterest. 
          AI-powered design with trending templates - no watermark, no signup required.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Free Forever
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            No Watermark
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            AI-Powered
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Design Your Social Media Post</h2>
            
            <div className="space-y-4">
              {/* Platform Selection */}
              <div className="space-y-2">
                <Label htmlFor="platform">Choose Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformPresets.map((p) => {
                      const Icon = p.icon
                      return (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{p.label}</span>
                            <span className="text-xs text-gray-500 ml-auto">{p.size}</span>
                            {p.popular && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Popular</span>}
                            {p.trending && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Trending</span>}
                            {p.lowCompetition && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Low KD</span>}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {selectedPlatform && (
                  <p className="text-sm text-gray-500">
                    Optimized for: {selectedPlatform.size} pixels
                  </p>
                )}
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Quick Templates</Label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="flex gap-1 mt-1">
                        {template.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs text-gray-500">#{tag}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title">Post Title / Main Text</Label>
                <Input
                  id="title"
                  placeholder="Enter your catchy headline..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Additional Text (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add supporting text, hashtags, or call-to-action..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <Label htmlFor="style">Design Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stylePresets.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <div>
                          <div className="font-medium">{s.label}</div>
                          <div className="text-xs text-gray-500">{s.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!title || isGenerating}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Your Design...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Social Media Post
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <span>HD Quality Export</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Hash className="w-4 h-4 text-purple-500" />
              <span>Trending Hashtags</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Share2 className="w-4 h-4 text-green-500" />
              <span>Direct Share</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Viral Templates</span>
            </div>
          </div>
        </Card>

        {/* Preview Section */}
        <div className="space-y-6">
          <OutputGallery
            generatedImages={generatedImages}
            downloadingId={downloadingId}
            onDownload={handleDownload}
            onGenerateNew={handleGenerateNew}
            isGenerating={isGenerating}
            platform="none"
          />

        </div>
      </div>
    </div>
  )
}

export default SocialMediaPosterTool