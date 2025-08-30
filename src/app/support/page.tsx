'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle,
  Send,
  CheckCircle
} from 'lucide-react'

const supportCategories = [
  { id: 'technical', label: 'Technical Issue', description: 'Problems with the platform or features' },
  { id: 'billing', label: 'Billing & Subscription', description: 'Payment, subscription, or account issues' },
  { id: 'feature', label: 'Feature Request', description: 'Suggestions for new features or improvements' },
  { id: 'bug', label: 'Bug Report', description: 'Report a bug or unexpected behavior' },
  { id: 'general', label: 'General Inquiry', description: 'Other questions or concerns' }
]

const priorityLevels = [
  { id: 'low', label: 'Low', description: 'Minor issue, not urgent' },
  { id: 'medium', label: 'Medium', description: 'Moderate impact on usage' },
  { id: 'high', label: 'High', description: 'Significant impact on usage' },
  { id: 'urgent', label: 'Urgent', description: 'Critical issue, cannot use service' }
]

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    priority: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log('Support request submitted:', formData)
    setIsSubmitted(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your support request has been submitted successfully. We'll get back to you within 24-48 hours.
            </p>
            <Button onClick={() => setIsSubmitted(false)}>
              Submit Another Request
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Contact Support
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're here to help! Get in touch with our support team for assistance
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Send us an email for general inquiries or detailed support requests.
                </p>
                <a 
                  href="mailto:jefflee2002@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  jefflee2002@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Urgent Issues</p>
                    <p className="text-sm text-muted-foreground">Within 4-8 hours</p>
                  </div>
                  <div>
                    <p className="font-medium">High Priority</p>
                    <p className="text-sm text-muted-foreground">Within 24 hours</p>
                  </div>
                  <div>
                    <p className="font-medium">General Inquiries</p>
                    <p className="text-sm text-muted-foreground">Within 48 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  Before You Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Check our <a href="/help" className="text-primary hover:underline">Help Center</a> first</li>
                  <li>• Include relevant error messages</li>
                  <li>• Describe the steps to reproduce the issue</li>
                  <li>• Provide screenshots if possible</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  Submit Support Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name *
                      </label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-2">
                        Category *
                      </label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div>
                                <div className="font-medium">{category.label}</div>
                                <div className="text-sm text-muted-foreground">{category.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium mb-2">
                        Priority Level *
                      </label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((priority) => (
                            <SelectItem key={priority.id} value={priority.id}>
                              <div>
                                <div className="font-medium">{priority.label}</div>
                                <div className="text-sm text-muted-foreground">{priority.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please provide detailed information about your issue, including steps to reproduce, error messages, and any relevant context..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Support Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

