'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, BookOpen, Feather, Star } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const bookGenres = [
  { value: 'fantasy', label: 'Fantasy', keywords: ['fantasy book cover', 'magic book design'], popular: true },
  { value: 'romance', label: 'Romance', keywords: ['romance book cover', 'love story cover'], popular: true },
  { value: 'thriller', label: 'Thriller', keywords: ['thriller book cover', 'mystery book design'] },
  { value: 'scifi', label: 'Science Fiction', keywords: ['sci-fi book cover', 'futuristic cover'] },
  { value: 'horror', label: 'Horror', keywords: ['horror book cover', 'scary book design'] },
  { value: 'nonfiction', label: 'Non-Fiction', keywords: ['non-fiction cover', 'business book cover'] },
  { value: 'young-adult', label: 'Young Adult', keywords: ['YA book cover', 'teen fiction cover'] },
  { value: 'childrens', label: "Children's", keywords: ['children book cover', 'kids book design'] },
  { value: 'graphic-novel', label: 'Graphic Novel', keywords: ['graphic novel cover', 'illustrated book cover'] },
  { value: 'poetry', label: 'Poetry', keywords: ['poetry book cover', 'poem collection cover'] },
]

const bookFormats = [
  { 
    value: 'kindle', 
    label: 'Kindle/Amazon KDP', 
    size: '1600x2560',
    keywords: ['kindle cover creator', 'amazon kdp cover maker'],
    lowCompetition: true
  },
  { 
    value: 'social-media', 
    label: 'Social Media Preview', 
    size: '1200x630',
    keywords: ['book social media cover', 'book promotion image']
  },
  { 
    value: 'paperback-6x9', 
    label: 'Paperback 6"x9"', 
    size: '1800x2700',
    keywords: ['paperback cover design', 'print book cover']
  },
  { 
    value: 'hardcover', 
    label: 'Hardcover with Spine', 
    size: '3200x2400',
    keywords: ['hardcover book design', 'dust jacket creator']
  },
  { 
    value: 'ebook', 
    label: 'Generic eBook', 
    size: '1600x2400',
    keywords: ['ebook cover maker', 'digital book cover']
  },
  { 
    value: 'audiobook', 
    label: 'Audiobook (Square)', 
    size: '3200x3200',
    keywords: ['audiobook cover maker', 'audible cover design']
  },
]

const stylePresets = [
  { value: 'minimal', label: 'Minimalist', description: 'Clean, modern design with focus on typography' },
  { value: 'illustrated', label: 'Illustrated', description: 'Custom illustrations and artwork' },
  { value: 'photographic', label: 'Photographic', description: 'Stunning photography-based covers' },
  { value: 'typographic', label: 'Typographic', description: 'Bold typography-focused design' },
  { value: 'vintage', label: 'Vintage', description: 'Classic, retro-inspired aesthetics' },
  { value: 'abstract', label: 'Abstract', description: 'Creative abstract patterns and shapes' },
]

export default function BookCoverCreatorTool() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [genre, setGenre] = useState('fantasy')
  const [format, setFormat] = useState('kindle')
  const [style, setStyle] = useState('minimal')
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const selectedFormat = bookFormats.find(f => f.value === format)

  const handleGenerate = async () => {
    if (!title.trim()) return
    
    setIsGenerating(true)
    setGeneratedImages([]) // Clear previous results
    
    try {
      // Build the book-specific prompt
      const bookPrompt = `Book cover design for ${bookGenres.find(g => g.value === genre)?.label} genre. Title: "${title}". ${author ? `Author: ${author}.` : ''} ${subtitle ? `Subtitle: ${subtitle}.` : ''} ${description ? `Description: ${description}` : ''} Style: ${stylePresets.find(s => s.value === style)?.label}. Format: ${selectedFormat?.label}. Professional high-quality book cover design.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: bookPrompt,
          mode: 'text',
          style: style || 'modern',
          platform: 'none', // No specific platform dimensions
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      
      // Set only the first image from the response
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
      a.download = `book-cover-${Date.now()}.png`
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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Book Cover Creator
        </h1>
        <p className="text-lg text-gray-900 max-w-3xl mx-auto">
          Design professional book covers for Kindle, Wattpad, novels, and ebooks. 
          AI-powered book cover generator with templates for all genres - fantasy, romance, thriller, and more.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Free Forever
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Print-Ready Quality
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            All Genres
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Design Your Book Cover</h2>
            
            <div className="space-y-4">
              {/* Book Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your book title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>

              {/* Author Name */}
              <div className="space-y-2">
                <Label htmlFor="author">Author Name *</Label>
                <Input
                  id="author"
                  placeholder="Your name or pen name..."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                <Input
                  id="subtitle"
                  placeholder="Book subtitle or series name..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              {/* Genre Selection */}
              <div className="space-y-2">
                <Label htmlFor="genre">Book Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bookGenres.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        <div className="flex items-center gap-2">
                          <span>{g.label}</span>
                          {g.popular && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Popular</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label htmlFor="format">Book Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bookFormats.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{f.label}</span>
                          <span className="text-xs text-gray-500 ml-2">{f.size}</span>
                          {f.lowCompetition && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">Low KD</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFormat && (
                  <p className="text-sm text-gray-500">
                    Dimensions: {selectedFormat.size} pixels
                  </p>
                )}
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <Label htmlFor="style">Cover Style</Label>
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Cover Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the mood, theme, or specific elements you want on the cover..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!title || !author || isGenerating}
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Your Book Cover...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Book Cover
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Feather className="w-4 h-4" />
              Pro Tips for Authors:
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Keep titles short and readable at small sizes</li>
              <li>• Choose colors that stand out in thumbnails</li>
              <li>• Match your cover style to your genre expectations</li>
              <li>• Test your cover at thumbnail size before publishing</li>
            </ul>
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

