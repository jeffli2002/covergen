'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cookie, Settings, Shield, Eye, Mail, Calendar } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Cookie Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              How we use cookies and similar technologies to enhance your experience
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
                <Cookie className="w-6 h-6 text-primary" />
                What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cookies are small text files that are stored on your device when you visit our website. They help us 
                provide you with a better experience by remembering your preferences, analyzing how you use our service, 
                and personalizing content.
              </p>
              <p>
                This Cookie Policy explains how CoverGen AI uses cookies and similar technologies, and how you can 
                control them. By continuing to use our service, you consent to our use of cookies as described in this policy.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary" />
                Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Essential Cookies</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies are necessary for the website to function properly and cannot be disabled.
                </p>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Authentication and security cookies</li>
                  <li>Session management cookies</li>
                  <li>Load balancing and performance cookies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Functional Cookies</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies enhance your experience by remembering your preferences and settings.
                </p>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Language and region preferences</li>
                  <li>UI customization settings</li>
                  <li>Platform and style preferences</li>
                  <li>Recent generation history</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Analytics Cookies</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies help us understand how visitors use our website and improve our service.
                </p>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Page views and navigation patterns</li>
                  <li>Feature usage statistics</li>
                  <li>Performance and error monitoring</li>
                  <li>User engagement metrics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Marketing Cookies</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies help us deliver relevant content and advertisements.
                </p>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Ad targeting and personalization</li>
                  <li>Social media integration</li>
                  <li>Email marketing optimization</li>
                  <li>Conversion tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Third-Party Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may use third-party services that place cookies on your device. These services help us provide 
                better functionality and analytics:
              </p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li><strong>Google Analytics:</strong> Website analytics and performance monitoring</li>
                <li><strong>Stripe:</strong> Payment processing and security</li>
                <li><strong>OpenRouter:</strong> AI model integration and optimization</li>
                <li><strong>Cloudflare:</strong> Content delivery and security</li>
                <li><strong>Social Media Platforms:</strong> Sharing and integration features</li>
              </ul>
              <p className="mt-4">
                Each third-party service has its own privacy policy and cookie practices. We recommend reviewing 
                their policies for more information.
              </p>
            </CardContent>
          </Card>

          {/* Cookie Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary" />
                Managing Your Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Browser Settings</h3>
              <p>
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>View and delete existing cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Set preferences for different types of cookies</li>
                <li>Enable private browsing modes</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 mt-6">Our Cookie Consent</h3>
              <p>
                When you first visit our website, you'll see a cookie consent banner. You can:
              </p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Accept all cookies for full functionality</li>
                <li>Customize your cookie preferences</li>
                <li>Reject non-essential cookies</li>
                <li>Change your preferences at any time</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 mt-6">Impact of Disabling Cookies</h3>
              <p>
                Please note that disabling certain cookies may affect your experience:
              </p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Some features may not work properly</li>
                <li>You may need to re-enter information</li>
                <li>Personalization features may be limited</li>
                <li>Performance monitoring may be reduced</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                Cookie Duration and Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Session Cookies</h3>
              <p>
                These cookies are temporary and are deleted when you close your browser. They help maintain your 
                session and preferences during your visit.
              </p>

              <h3 className="text-lg font-semibold mb-3 mt-6">Persistent Cookies</h3>
              <p>
                These cookies remain on your device for a set period (usually 30 days to 2 years) and help us 
                remember your preferences across visits.
              </p>

              <h3 className="text-lg font-semibold mb-3 mt-6">Data Processing</h3>
              <p>
                Cookie data is processed in accordance with our Privacy Policy. We do not use cookies to collect 
                personally identifiable information without your consent.
              </p>
            </CardContent>
          </Card>

          {/* Updates and Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Updates and Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Policy Updates</h3>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for 
                legal reasons. We will notify you of any material changes by posting the updated policy on our website.
              </p>

              <h3 className="text-lg font-semibold mb-3 mt-6">Contact Information</h3>
              <p>
                If you have questions about our use of cookies or this policy, please contact us:
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

