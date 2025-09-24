/**
 * useCheckoutSession Hook
 * Manages checkout session creation with safeguards against concurrent sessions
 */

import { useState, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useBestAuth } from '@/lib/bestauth/react'
import { creemService } from '@/services/payment/creem'
import { bestAuthPaymentService } from '@/services/payment/bestauth-payment'
import authService from '@/services/authService'
import { authConfig } from '@/config/auth.config'

export interface UseCheckoutSessionOptions {
  onSuccess?: (sessionId: string) => void
  onError?: (error: string) => void
  redirectToCheckout?: boolean
}

export interface CheckoutSessionState {
  isCreating: boolean
  error: string | null
  sessionId: string | null
  attemptsRemaining: number | null
}

export function useCheckoutSession(options: UseCheckoutSessionOptions = {}) {
  const router = useRouter()
  const { user: bestAuthUser } = useBestAuth()
  const [state, setState] = useState<CheckoutSessionState>({
    isCreating: false,
    error: null,
    sessionId: null,
    attemptsRemaining: null
  })

  // Prevent multiple concurrent requests
  const isRequestInProgress = useRef(false)
  const lastRequestTime = useRef<number>(0)

  const createCheckoutSession = useCallback(async (
    planId: 'pro' | 'pro_plus',
    successUrl?: string,
    cancelUrl?: string
  ) => {
    // Debounce: Prevent multiple rapid clicks (within 2 seconds)
    const now = Date.now()
    if (now - lastRequestTime.current < 2000) {
      toast.error('Please wait a moment before trying again')
      return { success: false, error: 'Too many rapid requests' }
    }
    lastRequestTime.current = now

    // Prevent concurrent requests
    if (isRequestInProgress.current) {
      toast.error('A checkout session is already being created')
      return { success: false, error: 'Request already in progress' }
    }

    isRequestInProgress.current = true
    setState(prev => ({
      ...prev,
      isCreating: true,
      error: null
    }))

    try {
      // Check authentication
      let userEmail: string | null = null
      let userId: string | null = null

      if (authConfig.USE_BESTAUTH) {
        if (!bestAuthUser) {
          throw new Error('Please sign in to continue')
        }
        userEmail = bestAuthUser.email
        userId = bestAuthUser.id
      } else {
        const user = authService.getUser()
        if (!user) {
          throw new Error('Please sign in to continue')
        }
        userEmail = user.email || null
        userId = user.id
      }

      if (!userEmail || !userId) {
        throw new Error('Unable to verify user account')
      }

      // Set default URLs if not provided
      const baseUrl = window.location.origin
      const finalSuccessUrl = successUrl || `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`
      const finalCancelUrl = cancelUrl || `${baseUrl}/pricing`

      console.log('[useCheckoutSession] Creating checkout session:', {
        planId,
        userEmail,
        usesBestAuth: authConfig.USE_BESTAUTH
      })

      // Create checkout session
      const paymentService = authConfig.USE_BESTAUTH ? bestAuthPaymentService : creemService
      const result = await paymentService.createCheckoutSession({
        userId,
        userEmail,
        planId,
        successUrl: finalSuccessUrl,
        cancelUrl: finalCancelUrl
      })

      if (!result.success) {
        // Handle specific error cases
        if (result.error?.includes('active checkout session')) {
          toast.error('You already have an active checkout session. Please complete it or wait for it to expire.')
          
          // If we have an existing session URL, redirect to it
          if (result.url) {
            window.location.href = result.url
            return { success: true, sessionId: result.sessionId }
          }
        } else if (result.error?.includes('Too many checkout attempts')) {
          toast.error('Too many checkout attempts. Please try again later.')
          setState(prev => ({
            ...prev,
            attemptsRemaining: 0
          }))
        } else {
          toast.error(result.error || 'Failed to create checkout session')
        }

        throw new Error(result.error || 'Failed to create checkout session')
      }

      console.log('[useCheckoutSession] Checkout session created:', result.sessionId)
      
      setState(prev => ({
        ...prev,
        sessionId: result.sessionId || null,
        error: null
      }))

      // Call success callback
      if (options.onSuccess && result.sessionId) {
        options.onSuccess(result.sessionId)
      }

      // Redirect to checkout if enabled
      if (options.redirectToCheckout !== false && result.url) {
        toast.success('Redirecting to checkout...')
        // Small delay for toast to show
        setTimeout(() => {
          window.location.href = result.url!
        }, 500)
      }

      return {
        success: true,
        sessionId: result.sessionId,
        url: result.url
      }
    } catch (error: any) {
      console.error('[useCheckoutSession] Error:', error)
      
      const errorMessage = error.message || 'Failed to create checkout session'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isCreating: false
      }))

      // Call error callback
      if (options.onError) {
        options.onError(errorMessage)
      }

      // Don't show duplicate toasts for specific errors already shown
      if (!error.message?.includes('active checkout session') && 
          !error.message?.includes('Too many checkout attempts')) {
        toast.error(errorMessage)
      }

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      isRequestInProgress.current = false
      setState(prev => ({
        ...prev,
        isCreating: false
      }))
    }
  }, [bestAuthUser, options, router])

  const reset = useCallback(() => {
    setState({
      isCreating: false,
      error: null,
      sessionId: null,
      attemptsRemaining: null
    })
  }, [])

  return {
    createCheckoutSession,
    isCreating: state.isCreating,
    error: state.error,
    sessionId: state.sessionId,
    attemptsRemaining: state.attemptsRemaining,
    reset
  }
}

// Helper hook for upgrade button state management
export function useUpgradeButton(planId: 'pro' | 'pro_plus') {
  const { createCheckoutSession, isCreating, error } = useCheckoutSession({
    redirectToCheckout: true
  })

  const [isDisabled, setIsDisabled] = useState(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout>()

  const handleUpgrade = useCallback(async () => {
    // Disable button temporarily
    setIsDisabled(true)

    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    // Re-enable button after 5 seconds (in case something goes wrong)
    clickTimeoutRef.current = setTimeout(() => {
      setIsDisabled(false)
    }, 5000)

    const result = await createCheckoutSession(planId)

    // If checkout was created successfully, keep button disabled (user will be redirected)
    if (!result.success) {
      setIsDisabled(false)
    }
  }, [createCheckoutSession, planId])

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
  }, [])

  return {
    handleUpgrade,
    isDisabled: isDisabled || isCreating,
    isLoading: isCreating,
    error,
    cleanup
  }
}