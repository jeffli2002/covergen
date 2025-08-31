'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accessibility, Eye, Ear, Hand, Brain, Mail, Calendar } from 'lucide-react'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Accessibility
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Our commitment to making CoverGen AI accessible to everyone
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Commitment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Accessibility className="w-6 h-6 text-primary" />
                Our Accessibility Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At CoverGen AI, we believe that technology should be accessible to everyone, regardless of their abilities. 
                We are committed to ensuring that our AI-powered cover generation service is usable by people with various 
                disabilities and accessibility needs.
              </p>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                Visual Accessibility Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>High contrast color schemes for better visibility</li>
                <li>Customizable color themes and preferences</li>
                <li>Adjustable text and element sizes</li>
                <li>Alt text for all images and graphics</li>
              </ul>
            </CardContent>
          </Card>

          {/* Keyboard and Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Hand className="w-6 h-6 text-primary" />
                Keyboard and Navigation Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Full keyboard navigation support</li>
                <li>Logical tab order through all elements</li>
                <li>Visible focus indicators on all interactive elements</li>
                <li>Semantic HTML structure for screen readers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Contact and Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you experience accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">CoverGen AI Accessibility Team</p>
                <p className="text-muted-foreground">Email: jefflee2002@gmail.com</p>
                <p className="text-muted-foreground">We typically respond within 24-48 hours.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
