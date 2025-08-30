'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  ThumbsUp, 
  MessageCircle, 
  Clock, 
  CheckCircle,
  Send,
  TrendingUp
} from 'lucide-react'

const featureCategories = [
  { id: 'ai-generation', label: 'AI Generation', description: 'Improvements to AI models and generation quality' },
  { id: 'platform-support', label: 'Platform Support', description: 'New platforms or platform-specific features' },
  { id: 'user-interface', label: 'User Interface', description: 'UI/UX improvements and new design features' },
  { id: 'workflow', label: 'Workflow & Productivity', description: 'Tools to improve your creative workflow' },
  { id: 'export-options', label: 'Export & Integration', description: 'New export formats and third-party integrations' },
  { id: 'other', label: 'Other', description: 'Other feature suggestions' }
]

const popularRequests = [
  {
    id: 1,
    title: 'Batch Processing for Multiple Images',
    description: 'Ability to process multiple reference images at once',
    category: 'workflow',
    votes: 156,
    status: 'planned',
    comments: 23
  },
  {
    id: 2,
    title: 'Custom Style Templates',
    description: 'Create and save your own style templates',
    category: 'ai-generation',
    votes: 134,
    status: 'in-progress',
    comments: 18
  },
  {
    id: 3,
    title: 'Instagram Reels Support',
    description: 'Add Instagram Reels dimensions and optimization',
    category: 'platform-support',
    votes: 98,
    status: 'planned',
    comments: 15
  }
]

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    useCase: '',
    priority: 'medium'
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Feature request submitted:', formData)
    setIsSubmitted(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your feature request has been submitted successfully. Our team will review it and consider it for future updates.
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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Feature Requests
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Help shape the future of CoverGen AI by suggesting new features and improvements
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Requests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Popular Requests</h2>
              <Badge variant="outline" className="text-sm">
                {popularRequests.length} requests
              </Badge>
            </div>

            <div className="space-y-4">
              {popularRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{request.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {request.votes} votes
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {request.comments} comments
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        {featureCategories.find(cat => cat.id === request.category)?.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline">
                View All Requests
              </Button>
            </div>
          </div>

          {/* Submit Request Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  Submit New Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                      Feature Title *
                    </label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Brief, descriptive title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      Description *
                    </label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the feature in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                      Category *
                    </label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {featureCategories.map((category) => (
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
                    <label htmlFor="useCase" className="block text-sm font-medium mb-2">
                      Use Case
                    </label>
                    <Textarea
                      id="useCase"
                      value={formData.useCase}
                      onChange={(e) => handleInputChange('useCase', e.target.value)}
                      placeholder="How would you use this feature? (optional)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium mb-2">
                      Priority Level
                    </label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Nice to have</SelectItem>
                        <SelectItem value="medium">Medium - Would be helpful</SelectItem>
                        <SelectItem value="high">High - Important for my workflow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Tips for great feature requests:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be specific about what you want</li>
                    <li>• Explain why it would be useful</li>
                    <li>• Include examples if possible</li>
                    <li>• Check if it already exists</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

