'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Send, X } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  context?: 'generation' | 'result' | 'general'
}

export default function FeedbackModal({ isOpen, onClose, context = 'general' }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const contextTitles = {
    generation: 'How was the generation experience?',
    result: 'How do you like the generated covers?',
    general: 'Share your feedback'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context,
          rating,
          feedback,
          email,
          timestamp: new Date().toISOString()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error('API error response:', data)
        const errorMessage = data.details 
          ? `${data.error}\n\nDetails: ${data.details}`
          : data.error || 'Failed to submit feedback'
        throw new Error(errorMessage)
      }
      
      console.log('Feedback submitted successfully:', data)
      
      // Only reset form and show success if we actually have a success response
      if (data.success) {
        // Reset form
        setRating(0)
        setFeedback('')
        setEmail('')
        
        onClose()
        
        // Show success message (could use a toast notification here)
        if (typeof window !== 'undefined') {
          alert('Thank you for your feedback!')
        }
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      if (typeof window !== 'undefined') {
        const message = error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.'
        alert(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {contextTitles[context]}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Your feedback helps us improve the AI generation quality
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Overall Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tell us more (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What could we improve? What did you love?"
                className="w-full min-h-[100px] p-3 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {feedback.length}/500 characters
              </p>
            </div>

            {/* Email for Follow-up */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email (Optional)
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                We may follow up on your feedback
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}