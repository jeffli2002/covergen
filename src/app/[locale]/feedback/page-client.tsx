'use client'

import { useState } from 'react'
import { MessageSquare, ThumbsUp, Bug, Lightbulb, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Locale } from '@/lib/i18n/config'

interface FeedbackPageClientProps {
  locale: Locale
  translations: any
}

export default function FeedbackPageClient({ locale, translations: t }: FeedbackPageClientProps) {
  const [feedbackType, setFeedbackType] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const message = formData.get('message') as string

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: 'general',
          rating: 5, // Default rating for feedback page submissions
          feedback: `[${feedbackType.toUpperCase()}] ${message}`, // Include type in message for better categorization
          email: email || undefined,
          timestamp: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API error response:', data)
        throw new Error(data.error || 'Failed to submit feedback')
      }

      if (data.success) {
        setShowSuccess(true)
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
        setFeedbackType('general')
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // Show error message
      setShowSuccess(false)
      alert(error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            We Value Your Feedback
          </h1>
          <p className="text-xl text-gray-600">
            Help us improve CoverGen Pro by sharing your thoughts and suggestions.
          </p>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <div className="text-green-800">
              <strong>Thank you for your feedback!</strong>
              <p className="mt-1">We appreciate your input and will review it carefully.</p>
            </div>
          </Alert>
        )}

        {/* Feedback Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">What type of feedback would you like to share?</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="feedbackType"
                    value="general"
                    checked={feedbackType === 'general'}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="mr-3"
                  />
                  <ThumbsUp className="w-4 h-4 text-blue-600 mr-2" />
                  <span>General Feedback</span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="feedbackType"
                    value="bug"
                    checked={feedbackType === 'bug'}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="mr-3"
                  />
                  <Bug className="w-4 h-4 text-red-600 mr-2" />
                  <span>Report a Bug</span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="feedbackType"
                    value="feature"
                    checked={feedbackType === 'feature'}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="mr-3"
                  />
                  <Lightbulb className="w-4 h-4 text-yellow-600 mr-2" />
                  <span>Feature Request</span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="feedbackType"
                    value="appreciation"
                    checked={feedbackType === 'appreciation'}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="mr-3"
                  />
                  <Heart className="w-4 h-4 text-pink-600 mr-2" />
                  <span>Appreciation</span>
                </label>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (optional)</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Include your email if you'd like us to follow up with you.
              </p>
            </div>

            {/* Feedback Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Feedback</label>
              <Textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder={
                  feedbackType === 'bug' 
                    ? "Please describe the issue you encountered..."
                    : feedbackType === 'feature'
                    ? "Tell us about the feature you'd like to see..."
                    : feedbackType === 'appreciation'
                    ? "What do you love about CoverGen Pro?"
                    : "Share your thoughts with us..."
                }
                className="w-full resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            You can also reach us directly at{' '}
            <a href="mailto:support@covergen.pro" className="text-blue-600 hover:underline">
              support@covergen.pro
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}