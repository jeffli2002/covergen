'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Music, Headphones, Radio, Play } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const genreStyles = [
  { value: 'lofi', label: 'Lo-Fi Hip Hop', icon: Headphones, color: 'purple' },
  { value: 'edm', label: 'EDM / Electronic', icon: Radio, color: 'blue' },
  { value: 'rock', label: 'Rock / Alternative', icon: Music, color: 'red' },
  { value: 'pop', label: 'Pop / Mainstream', icon: Play, color: 'pink' },
  { value: 'jazz', label: 'Jazz / Soul', icon: Music, color: 'amber' },
  { value: 'classical', label: 'Classical', icon: Music, color: 'gray' },
  { value: 'hip-hop', label: 'Hip Hop / Rap', icon: Headphones, color: 'green' },
  { value: 'country', label: 'Country / Folk', icon: Music, color: 'orange' },
]

const moodOptions = [
  'Chill & Relaxed',
  'Energetic & Upbeat',
  'Dark & Moody',
  'Happy & Positive',
  'Melancholic',
  'Motivational',
  'Romantic',
  'Party Vibes'
]

export default function SpotifyPlaylistCoverTool() {
  const [playlistName, setPlaylistName] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('lofi')
  const [mood, setMood] = useState('Chill & Relaxed')
  const [additionalElements, setAdditionalElements] = useState('')
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!playlistName) return

    setLoading(true)
    setOutputs([]) // Clear previous results
    
    try {
      // Build the playlist-specific prompt
      const selectedGenre = genreStyles.find(s => s.value === genre)
      const playlistPrompt = `Spotify playlist cover design. Playlist name: "${playlistName}". Genre: ${selectedGenre?.label}. Mood: ${mood}. ${description ? `Description: ${description}.` : ''} ${additionalElements ? `Visual elements: ${additionalElements}.` : ''} Professional 300x300 pixel square cover design optimized for Spotify playlists.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: playlistPrompt,
          mode: 'text',
          style: 'modern',
          platform: 'spotify', // Spotify specific dimensions
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
      a.download = `spotify-playlist-cover-${Date.now()}.png`
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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
          Spotify Playlist Cover Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Create perfect 300x300 pixel covers for your Spotify playlists with AI
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Design Your Playlist Cover</h2>
              <p className="text-gray-600">
                Tell us about your playlist and we'll create the perfect cover
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="playlist-name">Playlist Name *</Label>
                <Input
                  id="playlist-name"
                  placeholder="e.g., Midnight Vibes, Study Session, Workout Mix"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="genre">Genre/Style</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genreStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div className="flex items-center gap-2">
                          <style.icon className="w-4 h-4" />
                          {style.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mood">Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger id="mood" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map((moodOption) => (
                      <SelectItem key={moodOption} value={moodOption}>
                        {moodOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the vibe, theme, or purpose of your playlist..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="elements">Visual Elements (Optional)</Label>
                <Input
                  id="elements"
                  placeholder="e.g., neon lights, vinyl records, abstract shapes"
                  value={additionalElements}
                  onChange={(e) => setAdditionalElements(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!playlistName || loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                    Generate Playlist Cover
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
            platform="spotify"
          />
        </div>
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-3">
          Spotify Cover Tips
        </h3>
        <ul className="space-y-2 text-sm text-green-700">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Covers must be exactly 300x300 pixels</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Use high contrast for visibility at small sizes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Avoid text-heavy designs - keep it visual</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Consider how it looks in both light and dark mode</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}