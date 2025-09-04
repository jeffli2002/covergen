'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Music, Disc, Headphones, Radio } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const musicGenres = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'hiphop', label: 'Hip Hop/Rap' },
  { value: 'electronic', label: 'Electronic/EDM' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'country', label: 'Country' },
  { value: 'rnb', label: 'R&B/Soul' },
  { value: 'metal', label: 'Metal' },
  { value: 'indie', label: 'Indie' },
]

const albumTypes = [
  { value: 'single', label: 'Single', icon: Music },
  { value: 'ep', label: 'EP', icon: Disc },
  { value: 'album', label: 'Full Album', icon: Disc },
  { value: 'mixtape', label: 'Mixtape', icon: Headphones },
  { value: 'podcast', label: 'Podcast', icon: Radio },
]

export default function MusicAlbumCoverTool() {
  const [artistName, setArtistName] = useState('')
  const [albumTitle, setAlbumTitle] = useState('')
  const [genre, setGenre] = useState('pop')
  const [albumType, setAlbumType] = useState('single')
  const [style, setStyle] = useState('modern')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!albumTitle.trim() || !artistName.trim()) return
    
    setIsGenerating(true)
    setGeneratedImages([])
    
    try {
      const musicPrompt = `Music album cover design for ${musicGenres.find(g => g.value === genre)?.label} genre. Artist: "${artistName}". Album title: "${albumTitle}". Type: ${albumTypes.find(t => t.value === albumType)?.label}. Professional high-quality album art design.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: musicPrompt,
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
      a.download = `album-cover-${Date.now()}.png`
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
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Music Album Cover Maker
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Create professional album covers for Spotify, Apple Music, SoundCloud, and all streaming platforms. 
          AI-powered album art generator for musicians and podcasters.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-600" />
            Design Your Album Cover
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="artistName">Artist/Band Name *</Label>
              <Input
                id="artistName"
                placeholder="Enter artist name..."
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="albumTitle">Album/Track Title *</Label>
              <Input
                id="albumTitle"
                placeholder="Enter album or song title..."
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Music Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger id="genre">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {musicGenres.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="albumType">Release Type</Label>
              <Select value={albumType} onValueChange={setAlbumType}>
                <SelectTrigger id="albumType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {albumTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!artistName || !albumTitle || isGenerating}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Album Art...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Album Cover
                </>
              )}
            </Button>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Pro Tips:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Spotify requires 3000x3000px minimum</li>
              <li>• Keep text readable at small sizes</li>
              <li>• Match style to your music genre</li>
              <li>• Test on different backgrounds</li>
            </ul>
          </div>
        </Card>

        <OutputGallery
          generatedImages={generatedImages}
          downloadingId={downloadingId}
          onDownload={handleDownload}
          onGenerateNew={handleGenerateNew}
          isGenerating={isGenerating}
          platform="none"
        />
      </div>

      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 max-w-4xl mx-auto">
        <h3 className="font-bold text-lg mb-3">Professional Music Artwork</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Optimized for Spotify, Apple Music, SoundCloud</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>High-resolution 3000x3000px output</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Genre-specific design styles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>Free album art generator - no watermarks</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}

export default MusicAlbumCoverTool