'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Lock, Database, Users, Mail, Calendar } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              How we collect, use, and protect your personal information
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last updated: January 15, 2025
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact: jefflee2002@gmail.com
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At CoverGen AI, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 
                cover generation service.
              </p>
              <p>
                By using CoverGen AI, you agree to the collection and use of information in accordance with this policy. 
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:jefflee2002@gmail.com" className="text-primary hover:underline">
                  jefflee2002@gmail.com
                </a>.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="w-6 h-6 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Email address and account information</li>
                <li>Name and profile details</li>
                <li>Payment and billing information</li>
                <li>Usage data and preferences</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 mt-6">Content and Images</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Reference images you upload for cover generation</li>
                <li>Generated cover images and designs</li>
                <li>Prompts and text content you provide</li>
                <li>Platform preferences and settings</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 mt-6">Technical Information</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage patterns and analytics data</li>
                <li>Error logs and performance metrics</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use the collected information for the following purposes:</p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Provide and maintain our AI cover generation service</li>
                <li>Process your requests and generate cover images</li>
                <li>Improve our AI models and service quality</li>
                <li>Send important updates and notifications</li>
                <li>Process payments and manage subscriptions</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Comply with legal obligations and regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements or court orders</li>
                <li>To protect our rights, property, or safety</li>
                <li>With service providers who assist in our operations</li>
                <li>In connection with business transfers or mergers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your information</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
                <li>Opt-out of marketing communications</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:jefflee2002@gmail.com" className="text-primary hover:underline">
                  jefflee2002@gmail.com
                </a>.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">CoverGen AI</p>
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

