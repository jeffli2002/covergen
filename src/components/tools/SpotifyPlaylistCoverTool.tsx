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

  const handleGenerate = async () => {
    if (!playlistName) return

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      // Mock generated covers
      const mockCovers = [
        '/api/placeholder/300/300',
        '/api/placeholder/300/300',
        '/api/placeholder/300/300',
        '/api/placeholder/300/300'
      ]
      setOutputs(mockCovers)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Spotify Playlist Cover Generator</h2>
            <p className="text-gray-600">
              Create perfect 300x300 pixel covers for your Spotify playlists with AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
            </div>

            <div className="space-y-4">
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
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={!playlistName || loading}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
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

      {outputs.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Generated Covers</h3>
          <OutputGallery
            outputs={outputs}
            platform="spotify"
            title={playlistName}
          />
        </Card>
      )}

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