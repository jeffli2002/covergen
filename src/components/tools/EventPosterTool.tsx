'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, PartyPopper, Calendar, MapPin, Cake } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const eventTypes = [
  { value: 'birthday', label: 'Birthday Party', icon: Cake },
  { value: 'wedding', label: 'Wedding', icon: PartyPopper },
  { value: 'corporate', label: 'Corporate Event', icon: Calendar },
  { value: 'festival', label: 'Festival', icon: PartyPopper },
  { value: 'conference', label: 'Conference', icon: Calendar },
  { value: 'halloween', label: 'Halloween Party', icon: PartyPopper },
  { value: 'christmas', label: 'Christmas Event', icon: PartyPopper },
  { value: 'concert', label: 'Concert', icon: PartyPopper },
]

export default function EventPosterTool() {
  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState('birthday')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!eventName.trim()) return
    
    setIsGenerating(true)
    setGeneratedImages([]) // Clear previous results
    
    try {
      // Build the event-specific prompt
      const eventPrompt = `Event poster design for ${eventTypes.find(t => t.value === eventType)?.label}. Event name: "${eventName}". ${date ? `Date: ${date}.` : ''} ${venue ? `Venue: ${venue}.` : ''} ${description ? `Description: ${description}` : ''} Professional high-quality event poster design.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: eventPrompt,
          mode: 'text',
          style: 'modern',
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
      a.download = `event-poster-${Date.now()}.png`
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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Event Poster Designer
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Create stunning posters for birthdays, weddings, parties, and all special occasions. 
          AI-powered event poster maker with beautiful templates.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <PartyPopper className="w-6 h-6 text-pink-600" />
            Design Your Event Poster
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                placeholder="Enter event name..."
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="eventType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
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

            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                placeholder="Event location..."
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Event Details</Label>
              <Textarea
                id="description"
                placeholder="Additional event information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!eventName || isGenerating}
              className="w-full h-12 text-lg bg-gradient-to-r from-pink-600 to-purple-600"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Your Design...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Event Poster
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