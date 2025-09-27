'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, BookOpen, PenTool, Award, Palette } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const bookGenres = [
  'Fiction & Literature',
  'Romance',
  'Mystery & Thriller',
  'Science Fiction',
  'Fantasy',
  'Business & Money',
  'Self-Help',
  'Biography & Memoir',
  'History',
  'Health & Fitness',
  'Cookbooks',
  'Children\'s Books',
  'Young Adult',
  'Poetry',
  'Travel'
]

const coverStyles = [
  'Photorealistic',
  'Illustrated',
  'Minimalist',
  'Typography-focused',
  'Dark & Moody',
  'Bright & Colorful',
  'Vintage & Classic',
  'Modern & Bold',
  'Artistic & Abstract',
  'Professional & Clean'
]

export default function KindleCoverTool() {
  const [bookTitle, setBookTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [bookGenre, setBookGenre] = useState('Fiction & Literature')
  const [coverStyle, setCoverStyle] = useState('Photorealistic')
  const [description, setDescription] = useState('')
  const [seriesInfo, setSeriesInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!bookTitle || !authorName) return

    setLoading(true)
    setOutputs([]) // Clear previous results
    
    try {
      // Build the book-specific prompt
      const bookPrompt = `Kindle book cover design. Title: "${bookTitle}". Author: ${authorName}. ${subtitle ? `Subtitle: ${subtitle}.` : ''} Genre: ${bookGenre}. Style: ${coverStyle}. ${seriesInfo ? `Series: ${seriesInfo}.` : ''} ${description ? `Description: ${description}.` : ''} Professional 2560x1600 pixel Kindle cover optimized for Amazon KDP, bestseller-quality design that attracts readers.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: bookPrompt,
          mode: 'text',
          style: 'modern',
          platform: 'kindle', // Kindle specific dimensions
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
      a.download = `kindle-cover-${Date.now()}.jpg`
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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Kindle Book Cover Generator
        </h1>
        <p className="text-lg text-gray-900 max-w-3xl mx-auto">
          Create perfect 2560x1600 pixel covers for Amazon KDP
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Design Your Book Cover</h2>
              <p className="text-gray-900">
                Enter your book details to generate a professional cover
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="book-title">Book Title *</Label>
                <Input
                  id="book-title"
                  placeholder="e.g., The Shadow of Tomorrow"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author-name">Author Name *</Label>
                  <Input
                    id="author-name"
                    placeholder="e.g., Jane Smith"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="series-info">Series Info</Label>
                  <Input
                    id="series-info"
                    placeholder="e.g., Book 1 of the Shadow Series"
                    value={seriesInfo}
                    onChange={(e) => setSeriesInfo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  placeholder="e.g., A Tale of Mystery and Adventure"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="book-genre">Book Genre</Label>
                <Select value={bookGenre} onValueChange={setBookGenre}>
                  <SelectTrigger id="book-genre" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bookGenres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cover-style">Cover Style</Label>
                <Select value={coverStyle} onValueChange={setCoverStyle}>
                  <SelectTrigger id="cover-style" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coverStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Book Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your book's theme or mood..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!bookTitle || !authorName || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
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
                    Generate Book Cover
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
            platform="kindle"
          />
        </div>
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-orange-50 border-orange-200">
        <h3 className="text-lg font-semibold text-orange-800 mb-3">
          Kindle Cover Design Tips
        </h3>
        <ul className="space-y-2 text-sm text-orange-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            <span>Covers must be 2560x1600 pixels (1.6:1 ratio) for Amazon KDP</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            <span>Make title readable at thumbnail size (100px wide)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            <span>Use genre-appropriate visual elements to attract your target readers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            <span>High contrast between text and background improves visibility</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}