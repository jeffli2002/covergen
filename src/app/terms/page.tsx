'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Shield, Users, CreditCard, AlertTriangle, Mail, Calendar } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              The terms and conditions governing your use of CoverGen AI
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
                <FileText className="w-6 h-6 text-primary" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms of Service ("Terms") govern your use of CoverGen AI, an AI-powered cover generation service. 
                By accessing or using our service, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p>
                If you disagree with any part of these terms, you may not access our service. These Terms apply to all visitors, 
                users, and others who access or use the service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>CoverGen AI provides the following services:</p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>AI-powered cover image generation for various platforms</li>
                <li>Image editing and customization tools</li>
                <li>Platform-specific optimization and sizing</li>
                <li>Template library and style options</li>
                <li>Export and download functionality</li>
                <li>User account management and subscription plans</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                User Accounts and Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>To access certain features of our service, you must create an account. You agree to:</p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be at least 13 years old to create an account</li>
              </ul>
              <p className="mt-4">
                We reserve the right to terminate or suspend accounts that violate these Terms or engage in fraudulent activity.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-primary" />
                Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You agree not to use our service to:</p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Generate content that is illegal, harmful, or offensive</li>
                <li>Violate intellectual property rights or copyright laws</li>
                <li>Upload malicious files or attempt to compromise our systems</li>
                <li>Use the service for commercial purposes without proper licensing</li>
                <li>Attempt to reverse engineer or copy our technology</li>
                <li>Engage in spam or automated abuse of our services</li>
              </ul>
              <p className="mt-4">
                Violation of this policy may result in account termination and legal action.
              </p>
            </CardContent>
          </Card>

          {/* Subscription and Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" />
                Subscription and Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Free Tier</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>10 cover generations per day</li>
                <li>Standard resolution output</li>
                <li>Basic platform support</li>
                <li>Community support</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 mt-6">Pro Plans</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Monthly or annual billing cycles</li>
                <li>Higher generation limits and premium features</li>
                <li>Priority customer support</li>
                <li>Commercial usage rights (Pro+ plan)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 mt-6">Billing Terms</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Subscriptions auto-renew unless cancelled</li>
                <li>Refunds available within 7 days of purchase</li>
                <li>Price changes with 30-day notice</li>
                <li>Service suspension for payment failures</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Your Content</h3>
              <p>
                You retain ownership of reference images and prompts you provide. You grant us a license to use this content 
                solely for providing our service and improving our AI models.
              </p>

              <h3 className="text-lg font-semibold mb-3 mt-6">Generated Content</h3>
              <p>
                AI-generated images are subject to our licensing terms. Free users receive limited usage rights, while Pro+ 
                users receive commercial usage rights. All generated content is watermark-free for professional use.
              </p>

              <h3 className="text-lg font-semibold mb-3 mt-6">Our Technology</h3>
              <p>
                CoverGen AI, including our AI models, software, and platform, is protected by intellectual property laws. 
                You may not copy, modify, or distribute our technology without permission.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-primary" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To the maximum extent permitted by law, CoverGen AI shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Service interruptions or technical failures</li>
                <li>Accuracy of AI-generated content</li>
                <li>Third-party actions or content</li>
                <li>Security breaches or data loss</li>
              </ul>
              <p className="mt-4">
                Our total liability shall not exceed the amount paid by you for our services in the 12 months preceding the claim.
              </p>
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
                If you have questions about these Terms of Service, please contact us:
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

