import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AccountPageClient from '../page-client'
import { useBestAuth } from '@/hooks/useBestAuth'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/hooks/useBestAuth')
jest.mock('next/navigation')
jest.mock('@/lib/store')
jest.mock('sonner')
jest.mock('@/services/payment/creem', () => ({
  creemService: {
    createPortalSession: jest.fn()
  }
}))

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockSetUser = jest.fn()

// Mock fetch globally
global.fetch = jest.fn()

describe('Account Page BestAuth Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace
    })
    
    // Setup store mock
    (useAppStore as jest.Mock).mockReturnValue({
      user: null,
      setUser: mockSetUser
    })
    
    // Setup toast mock
    ;(toast.error as jest.Mock) = jest.fn()
    ;(toast.success as jest.Mock) = jest.fn()
    ;(toast.info as jest.Mock) = jest.fn()
  })

  describe('Authentication Flow', () => {
    it('should redirect to signin when not authenticated', async () => {
      // Mock no auth
      (useBestAuth as jest.Mock).mockReturnValue({
        user: null,
        session: null,
        loading: false
      })

      render(<AccountPageClient locale="en" />)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/en?auth=signin&redirect=%2Fen%2Faccount'
        )
      })
    })

    it('should show loading state while auth is loading', () => {
      // Mock loading auth
      (useBestAuth as jest.Mock).mockReturnValue({
        user: null,
        session: null,
        loading: true
      })

      render(<AccountPageClient locale="en" />)

      expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
      expect(screen.getByText('This should only take a moment...')).toBeInTheDocument()
    })

    it('should load account data when authenticated', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { token: 'token123', expires_at: '2024-12-31' }
      
      (useBestAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false
      })

      // Mock account API response
      const mockAccountData = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User'
        },
        subscription: {
          tier: 'pro',
          status: 'active',
          stripe_customer_id: 'cus_123',
          stripe_subscription_id: 'sub_123'
        },
        usage: {
          today: 5,
          limits: { daily: 100, monthly: 3000 }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccountData
      })

      render(<AccountPageClient locale="en" />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/bestauth/account',
          expect.objectContaining({
            headers: {
              'Authorization': 'Bearer token123',
              'Content-Type': 'application/json'
            }
          })
        )
      })

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText('Pro')).toBeInTheDocument()
      })
    })
  })

  describe('Subscription Management', () => {
    beforeEach(() => {
      // Setup authenticated state
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { token: 'token123', expires_at: '2024-12-31' }
      
      (useBestAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false
      })

      // Mock initial account load
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          subscription: {
            tier: 'pro',
            status: 'active',
            stripe_customer_id: 'cus_123',
            stripe_subscription_id: 'sub_123',
            cancel_at_period_end: false
          },
          usage: { today: 5 }
        })
      })
    })

    it('should handle subscription cancellation', async () => {
      render(<AccountPageClient locale="en" />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Cancel Subscription')).toBeInTheDocument()
      })

      // Mock cancel API response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      // Mock reload after cancel
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 'user123', email: 'test@example.com' },
          subscription: {
            tier: 'pro',
            status: 'active',
            cancel_at_period_end: true
          },
          usage: { today: 5 }
        })
      })

      // Mock confirm dialog
      global.confirm = jest.fn(() => true)

      // Click cancel button
      const cancelButton = screen.getByText('Cancel Subscription')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/bestauth/subscription/cancel',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer token123'
            },
            body: JSON.stringify({ cancelAtPeriodEnd: true })
          })
        )
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Subscription cancelled. You will keep access until the end of your billing period.'
        )
      })
    })

    it('should handle subscription resume', async () => {
      // Start with cancelled subscription
      ;(global.fetch as jest.Mock).mockReset()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 'user123', email: 'test@example.com' },
          subscription: {
            tier: 'pro',
            status: 'active',
            cancel_at_period_end: true,
            stripe_subscription_id: 'sub_123'
          },
          usage: { today: 5 }
        })
      })

      render(<AccountPageClient locale="en" />)

      // Wait for resume button
      await waitFor(() => {
        expect(screen.getByText('Resume Subscription')).toBeInTheDocument()
      })

      // Mock resume API response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      // Mock reload after resume
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 'user123', email: 'test@example.com' },
          subscription: {
            tier: 'pro',
            status: 'active',
            cancel_at_period_end: false
          },
          usage: { today: 5 }
        })
      })

      // Click resume button
      const resumeButton = screen.getByText('Resume Subscription')
      fireEvent.click(resumeButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/bestauth/subscription/cancel',
          expect.objectContaining({
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer token123'
            }
          })
        )
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Subscription resumed successfully!')
      })
    })
  })

  describe('Trial Subscription', () => {
    it('should display trial information correctly', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { token: 'token123', expires_at: '2024-12-31' }
      
      (useBestAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false
      })

      // Mock trial subscription
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          subscription: {
            tier: 'pro',
            status: 'trialing',
            trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            stripe_subscription_id: 'sub_123'
          },
          usage: { today: 2 }
        })
      })

      render(<AccountPageClient locale="en" />)

      await waitFor(() => {
        expect(screen.getByText('Trial')).toBeInTheDocument()
        expect(screen.getByText(/Free 7-day trial/)).toBeInTheDocument()
        expect(screen.getByText(/Trial Limits:/)).toBeInTheDocument()
        expect(screen.getByText(/10 covers per day/)).toBeInTheDocument()
      })
    })

    it('should handle trial activation', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { token: 'token123', expires_at: '2024-12-31' }
      
      (useBestAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false
      })

      // Mock trial without payment method
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          subscription: {
            tier: 'pro',
            status: 'trialing',
            stripe_subscription_id: null
          },
          usage: { today: 2 }
        })
      })

      render(<AccountPageClient locale="en" />)

      await waitFor(() => {
        expect(screen.getByText('Add Payment Method')).toBeInTheDocument()
      })

      // Click add payment method
      const addPaymentButton = screen.getByText('Add Payment Method')
      fireEvent.click(addPaymentButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en/payment?plan=pro&activate=true')
      })
    })
  })

  describe('Usage Display', () => {
    it('should display usage correctly', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { token: 'token123', expires_at: '2024-12-31' }
      
      (useBestAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          subscription: {
            tier: 'pro',
            status: 'active'
          },
          usage: {
            today: 50,
            limits: { daily: 100, monthly: 3000 }
          }
        })
      })

      render(<AccountPageClient locale="en" />)

      await waitFor(() => {
        expect(screen.getByText('50 / 3000')).toBeInTheDocument()
        expect(screen.getByText(/2950 credits remaining this month/)).toBeInTheDocument()
      })
    })

    it('should show warning when usage is high', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { token: 'token123', expires_at: '2024-12-31' }
      
      (useBestAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          subscription: {
            tier: 'free',
            status: 'active'
          },
          usage: {
            today: 85,
            limits: { daily: 90, monthly: 90 }
          }
        })
      })

      render(<AccountPageClient locale="en" />)

      await waitFor(() => {
        expect(screen.getByText(/You're running low on credits/)).toBeInTheDocument()
      })
    })
  })

  describe('Sign Out', () => {
    it('should handle sign out correctly', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { token: 'token123', expires_at: '2024-12-31' }
      
      (useBestAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          subscription: { tier: 'free' },
          usage: { today: 0 }
        })
      })

      render(<AccountPageClient locale="en" />)

      await waitFor(() => {
        expect(screen.getByText('Sign Out')).toBeInTheDocument()
      })

      // Mock signout API response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      // Mock localStorage
      const localStorageMock = {
        removeItem: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })

      // Click sign out
      const signOutButton = screen.getByText('Sign Out')
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(null)
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/signout',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Authorization': 'Bearer token123',
              'Content-Type': 'application/json'
            }
          })
        )
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('bestauth-session')
        expect(mockPush).toHaveBeenCalledWith('/en')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { token: 'token123', expires_at: '2024-12-31' }
      
      (useBestAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false
      })

      // Mock API error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<AccountPageClient locale="en" />)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load account data')
      })
    })

    it('should handle timeout errors', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { token: 'token123', expires_at: '2024-12-31' }
      
      (useBestAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false
      })

      // Mock slow API response
      ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((resolve) => setTimeout(resolve, 11000))
      )

      render(<AccountPageClient locale="en" />)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Loading is taking longer than expected. Please refresh the page.')
      }, { timeout: 11000 })
    })
  })
})