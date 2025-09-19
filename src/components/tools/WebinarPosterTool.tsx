'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Calendar, Clock, Users, Video } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function WebinarPosterTool() {
  const [title, setTitle] = useState('')
  const [presenter, setPresenter] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [platform, setPlatform] = useState('zoom')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!title.trim()) return
    
    setIsGenerating(true)
    setGeneratedImages([])
    
    try {
      const webinarPrompt = `Webinar poster design. Title: "${title}". ${presenter ? `Presenter: ${presenter}.` : ''} ${date ? `Date: ${date}.` : ''} ${time ? `Time: ${time}.` : ''} Platform: ${platform}. Professional high-quality webinar poster design.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: webinarPrompt,
          mode: 'text',
          style: 'professional',
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
      a.download = `webinar-poster-${Date.now()}.png`
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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Webinar Poster Maker
        </h1>
        <p className="text-lg text-gray-900 max-w-3xl mx-auto">
          Create professional webinar posters and registration banners for Zoom, Teams, and online events. 
          AI-powered design with engaging templates.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-600" />
            Design Your Webinar Poster
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Webinar Title *</Label>
              <Input
                id="title"
                placeholder="Enter webinar title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="presenter">Presenter Name</Label>
              <Input
                id="presenter"
                placeholder="Speaker/Host name..."
                value={presenter}
                onChange={(e) => setPresenter(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="gotowebinar">GoToWebinar</SelectItem>
                  <SelectItem value="webex">Webex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!title || isGenerating}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Webinar Poster
                </>
              )}
            </Button>
          </div>
        </Card>

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

