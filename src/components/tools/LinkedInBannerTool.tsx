'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Linkedin, Briefcase, Award, Building2, Target } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const industries = [
  'Technology & Software',
  'Finance & Banking',
  'Healthcare & Medical',
  'Consulting & Strategy',
  'Marketing & Advertising',
  'Education & Academia',
  'Legal & Compliance',
  'Real Estate',
  'Manufacturing',
  'Retail & E-commerce',
  'Non-Profit',
  'Government',
  'Creative & Design',
  'Engineering',
  'Human Resources'
]

const bannerStyles = [
  'Professional & Corporate',
  'Modern & Minimalist',
  'Creative & Artistic',
  'Tech & Innovative',
  'Elegant & Sophisticated',
  'Bold & Dynamic',
  'Clean & Simple',
  'Gradient & Colorful'
]

const professionalRoles = [
  'Executive/C-Suite',
  'Senior Manager',
  'Manager/Team Lead',
  'Individual Contributor',
  'Consultant/Freelancer',
  'Entrepreneur/Founder',
  'Student/Recent Graduate',
  'Researcher/Academic'
]

export default function LinkedInBannerTool() {
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('Technology & Software')
  const [role, setRole] = useState('Individual Contributor')
  const [bannerStyle, setBannerStyle] = useState('Professional & Corporate')
  const [tagline, setTagline] = useState('')
  const [expertise, setExpertise] = useState('')
  const [brandColors, setBrandColors] = useState('')
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!fullName || !jobTitle) return

    setLoading(true)
    setOutputs([]) // Clear previous results
    
    try {
      // Build the LinkedIn-specific prompt
      const linkedInPrompt = `LinkedIn professional banner design. Name: "${fullName}". Job Title: "${jobTitle}". ${company ? `Company: ${company}.` : ''} Industry: ${industry}. Professional level: ${role}. Design style: ${bannerStyle}. ${tagline ? `Tagline: "${tagline}".` : ''} ${expertise ? `Areas of expertise: ${expertise}.` : ''} ${brandColors ? `Brand colors: ${brandColors}.` : ''} Professional LinkedIn banner 1584x396 pixels that communicates expertise and attracts opportunities.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: linkedInPrompt,
          mode: 'text',
          style: 'professional',
          platform: 'linkedin', // LinkedIn specific dimensions
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
      a.download = `linkedin-banner-${Date.now()}.png`
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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          LinkedIn Banner Generator
        </h1>
        <p className="text-lg text-gray-900 max-w-3xl mx-auto">
          Create a professional 1584x396px banner for your LinkedIn profile
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Design Your Professional Banner</h2>
              <p className="text-gray-900">
                Enter your professional details to generate a LinkedIn banner
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full-name">Full Name *</Label>
                  <Input
                    id="full-name"
                    placeholder="e.g., John Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="job-title">Job Title *</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Senior Product Manager"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  placeholder="e.g., Microsoft"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="industry" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role">Professional Level</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {professionalRoles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="banner-style">Visual Style</Label>
                <Select value={bannerStyle} onValueChange={setBannerStyle}>
                  <SelectTrigger id="banner-style" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bannerStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tagline">Professional Tagline (Optional)</Label>
                <Input
                  id="tagline"
                  placeholder="e.g., Driving Digital Innovation | Tech Leadership"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="expertise">Areas of Expertise (Optional)</Label>
                <Textarea
                  id="expertise"
                  placeholder="e.g., Product Strategy, Agile, Data Analytics, Team Leadership"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="brand-colors">Brand Colors (Optional)</Label>
                <Input
                  id="brand-colors"
                  placeholder="e.g., Blue and white, Corporate navy"
                  value={brandColors}
                  onChange={(e) => setBrandColors(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!fullName || !jobTitle || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                    Generate LinkedIn Banner
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
            platform="linkedin"
          />
        </div>
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          LinkedIn Banner Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Banner dimensions must be exactly 1584x396 pixels (4:1 ratio)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Keep important information centered - edges may be cropped on mobile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Use professional imagery that reflects your industry and expertise</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Ensure text is readable and not too small - test on mobile devices</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}