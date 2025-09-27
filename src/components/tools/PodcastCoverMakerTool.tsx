'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Mic, Radio, Headphones, Music } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const podcastGenres = [
  'Business & Finance',
  'True Crime',
  'Comedy',
  'Education',
  'Health & Wellness',
  'Technology',
  'Sports',
  'Music & Arts',
  'News & Politics',
  'Science',
  'History',
  'Society & Culture',
  'Personal Stories',
  'Fiction & Drama'
]

const podcastStyles = [
  'Professional & Clean',
  'Bold & Dynamic',
  'Minimalist Modern',
  'Dark & Mysterious',
  'Bright & Playful',
  'Academic & Trustworthy',
  'Tech & Futuristic',
  'Natural & Calming',
  'Vintage & Classic',
  'Creative & Artistic'
]

export default function PodcastCoverMakerTool() {
  const [podcastName, setPodcastName] = useState('')
  const [hostName, setHostName] = useState('')
  const [tagline, setTagline] = useState('')
  const [genre, setGenre] = useState('Business & Finance')
  const [style, setStyle] = useState('Professional & Clean')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!podcastName) return

    setLoading(true)
    setOutputs([]) // Clear previous results
    
    try {
      // Build the podcast-specific prompt
      const podcastPrompt = `Podcast cover art design. Podcast name: "${podcastName}". ${hostName ? `Host: ${hostName}.` : ''} ${tagline ? `Tagline: ${tagline}.` : ''} Genre: ${genre}. Style: ${style}. ${description ? `Description: ${description}.` : ''} Professional 3000x3000 pixel podcast cover that meets Apple Podcasts and Spotify requirements. Bold, readable text optimized for small display sizes.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: podcastPrompt,
          mode: 'text',
          style: 'modern',
          platform: 'podcast', // Podcast specific dimensions (3000x3000)
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
      a.download = `podcast-cover-${Date.now()}.png`
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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
          Podcast Cover Art Generator
        </h1>
        <p className="text-lg text-gray-900 max-w-3xl mx-auto">
          Create perfect 3000x3000 pixel covers for Apple Podcasts, Spotify, and all platforms
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Design Your Podcast Cover</h2>
              <p className="text-gray-900">
                Enter your podcast details to generate professional cover art
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="podcast-name">Podcast Name *</Label>
                <Input
                  id="podcast-name"
                  placeholder="e.g., The Daily Tech Show"
                  value={podcastName}
                  onChange={(e) => setPodcastName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="host-name">Host Name</Label>
                <Input
                  id="host-name"
                  placeholder="e.g., with Jane Smith"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  placeholder="e.g., Your weekly dose of tech insights"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="genre">Podcast Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {podcastGenres.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="style">Visual Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {podcastStyles.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your podcast theme and content..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!podcastName || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
                    Generate Podcast Cover
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
            platform="podcast"
          />
        </div>
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">
          Podcast Cover Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Covers must be at least 1400x1400 pixels (3000x3000 recommended)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Use bold, readable text - covers appear very small in apps</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Keep it simple - avoid cluttered designs and too many elements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Test visibility at 55x55 pixels (common thumbnail size)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Maintain consistent branding across episodes</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}