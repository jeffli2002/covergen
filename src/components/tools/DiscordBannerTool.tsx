'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Gamepad2, Users, Crown, Palette, MessageCircle, Shield } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const bannerTypes = [
  { value: 'server', label: 'Server Banner', size: '960x540', description: 'For server invite backgrounds' },
  { value: 'profile', label: 'Profile Banner', size: '600x240', description: 'For Nitro user profiles' },
  { value: 'channel', label: 'Channel Header', size: '960x192', description: 'For channel headers' }
]

const serverThemes = [
  'Gaming & Esports',
  'Anime & Manga',
  'Art & Creative',
  'Music & Audio',
  'Tech & Programming',
  'Study & Education',
  'Social & Community',
  'Content Creation',
  'Crypto & Finance',
  'Memes & Fun',
  'Movies & TV',
  'Books & Literature'
]

const visualStyles = [
  'Epic Gaming Style',
  'Kawaii Anime',
  'Minimalist Tech',
  'Vibrant Creative',
  'Dark & Moody',
  'Neon Cyberpunk',
  'Professional Clean',
  'Retro Aesthetic',
  'Fantasy Adventure',
  'Modern Gradient'
]

const colorSchemes = [
  'Discord Dark (Default)',
  'Neon Purple & Blue',
  'Gaming Red & Black',
  'Pastel Kawaii',
  'Ocean Blue & Teal',
  'Sunset Orange & Pink',
  'Matrix Green',
  'Royal Purple & Gold',
  'Monochrome',
  'Custom Colors'
]

export default function DiscordBannerTool() {
  const [bannerType, setBannerType] = useState('server')
  const [serverName, setServerName] = useState('')
  const [serverTheme, setServerTheme] = useState('Gaming & Esports')
  const [visualStyle, setVisualStyle] = useState('Epic Gaming Style')
  const [colorScheme, setColorScheme] = useState('Discord Dark (Default)')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [customColors, setCustomColors] = useState('')
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!serverName) return

    setLoading(true)
    setOutputs([]) // Clear previous results
    
    try {
      // Get the selected banner type details
      const selectedBanner = bannerTypes.find(b => b.value === bannerType)
      
      // Build the Discord-specific prompt
      const discordPrompt = `Discord banner design. Type: ${selectedBanner?.label} (${selectedBanner?.size}px). Server name: "${serverName}". Theme: ${serverTheme}. Visual style: ${visualStyle}. Color scheme: ${colorScheme}. ${tagline ? `Tagline: "${tagline}".` : ''} ${description ? `Description: ${description}.` : ''} ${customColors && colorScheme === 'Custom Colors' ? `Custom colors: ${customColors}.` : ''} Professional Discord banner optimized for community engagement and server growth.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: discordPrompt,
          mode: 'text',
          style: 'gaming',
          platform: 'discord', // Discord specific dimensions
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
      a.download = `discord-${bannerType}-banner-${Date.now()}.png`
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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Discord Banner Generator
        </h1>
        <p className="text-lg text-gray-900 max-w-3xl mx-auto">
          Create perfect banners for your Discord server or profile
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Design Your Discord Banner</h2>
              <p className="text-gray-900">
                Enter your server details to generate an awesome banner
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="banner-type">Banner Type</Label>
                <Select value={bannerType} onValueChange={setBannerType}>
                  <SelectTrigger id="banner-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bannerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <span className="font-medium">{type.label}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {type.size} • {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="server-name">Server Name *</Label>
                <Input
                  id="server-name"
                  placeholder="e.g., Epic Gaming Squad"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="server-theme">Server Theme</Label>
                <Select value={serverTheme} onValueChange={setServerTheme}>
                  <SelectTrigger id="server-theme" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serverThemes.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
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
                <Label htmlFor="color-scheme">Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger id="color-scheme" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((scheme) => (
                      <SelectItem key={scheme} value={scheme}>
                        {scheme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {colorScheme === 'Custom Colors' && (
                <div>
                  <Label htmlFor="custom-colors">Custom Colors</Label>
                  <Input
                    id="custom-colors"
                    placeholder="e.g., Purple and gold, Neon green"
                    value={customColors}
                    onChange={(e) => setCustomColors(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="tagline">Server Tagline (Optional)</Label>
                <Input
                  id="tagline"
                  placeholder="e.g., Where legends are made"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Additional Details (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any specific elements, text, or vibe you want..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!serverName || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
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
                    Generate Discord Banner
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
            platform="discord"
          />
        </div>
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-indigo-50 border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-800 mb-3">
          Discord Banner Tips
        </h3>
        <ul className="space-y-2 text-sm text-indigo-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">✓</span>
            <span>Server banners require Discord Nitro Boost Level 2 (960x540px)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">✓</span>
            <span>Profile banners need Discord Nitro subscription (600x240px)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">✓</span>
            <span>Use high contrast for text visibility on dark Discord theme</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">✓</span>
            <span>Keep important elements centered - edges may be cropped on mobile</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}