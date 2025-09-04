'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Calendar, MapPin, Clock, Users } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const eventTypes = [
  'Conference',
  'Concert',
  'Workshop',
  'Party',
  'Fundraiser',
  'Meetup',
  'Webinar',
  'Festival',
  'Sports Event',
  'Exhibition'
]

const eventStyles = [
  'Modern & Clean',
  'Bold & Dynamic',
  'Elegant & Formal',
  'Fun & Playful',
  'Minimalist',
  'Corporate Professional',
  'Artistic & Creative',
  'Tech & Futuristic'
]

export default function FacebookEventCoverTool() {
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [eventType, setEventType] = useState('Conference')
  const [eventStyle, setEventStyle] = useState('Modern & Clean')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!eventName || !eventDate) return

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      // Mock generated covers with Facebook event dimensions (1200x628)
      const mockCovers = [
        'https://via.placeholder.com/1200x628/1877F2/FFFFFF?text=Event+Cover+1',
        'https://via.placeholder.com/1200x628/42B883/FFFFFF?text=Event+Cover+2',
        'https://via.placeholder.com/1200x628/FF6B6B/FFFFFF?text=Event+Cover+3',
        'https://via.placeholder.com/1200x628/7C3AED/FFFFFF?text=Event+Cover+4'
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
            <h2 className="text-2xl font-bold mb-2">Facebook Event Cover Generator</h2>
            <p className="text-gray-600">
              Create perfect 1200x628 pixel covers for your Facebook events
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-name">Event Name *</Label>
                <Input
                  id="event-name"
                  placeholder="e.g., Summer Music Festival 2024"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="event-date">Date *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="event-time">Time</Label>
                <Input
                  id="event-time"
                  placeholder="e.g., 7:00 PM EST"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  placeholder="e.g., Madison Square Garden, NYC"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="event-type">Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger id="event-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="event-style">Visual Style</Label>
                <Select value={eventStyle} onValueChange={setEventStyle}>
                  <SelectTrigger id="event-style" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={!eventName || !eventDate || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
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
                  Generate Event Cover
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
            generatedImages={outputs}
            downloadingId={null}
            onDownload={() => {}}
            onGenerateNew={() => {}}
            platform="facebook"
          />
        </Card>
      )}

      {/* Tips Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          Facebook Event Cover Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Covers must be exactly 1200x628 pixels (1.91:1 ratio)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Include key event details in the image - not all text shows on mobile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Use high contrast and bold text for readability</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Avoid placing important elements near the edges</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
