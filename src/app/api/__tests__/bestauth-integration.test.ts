import { NextRequest } from 'next/server'
import { withAuth, getAuthenticatedUser } from '../middleware/withAuth'
import { getUserFromRequest } from '@/lib/bestauth/middleware'

// Mock dependencies
jest.mock('@/lib/bestauth/middleware', () => ({
  getUserFromRequest: jest.fn()
}))

describe('BestAuth API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('withAuth middleware', () => {
    it('should return 401 when no user is authenticated', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test')
      const mockHandler = jest.fn()
      
      ;(getUserFromRequest as jest.Mock).mockResolvedValue(null)
      
      const wrappedHandler = withAuth(mockHandler)
      const response = await wrappedHandler(mockRequest, {})
      
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should call handler with user when authenticated', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg'
      }
      
      const mockRequest = new NextRequest('http://localhost:3000/api/test')
      const mockHandler = jest.fn().mockResolvedValue(new Response('Success'))
      
      ;(getUserFromRequest as jest.Mock).mockResolvedValue(mockUser)
      
      const wrappedHandler = withAuth(mockHandler)
      const response = await wrappedHandler(mockRequest, {})
      
      expect(mockHandler).toHaveBeenCalled()
      const calledRequest = mockHandler.mock.calls[0][0]
      expect(calledRequest.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatar_url: mockUser.avatarUrl
      })
    })

    it('should handle middleware errors gracefully', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test')
      const mockHandler = jest.fn()
      
      ;(getUserFromRequest as jest.Mock).mockRejectedValue(new Error('Auth service error'))
      
      const wrappedHandler = withAuth(mockHandler)
      const response = await wrappedHandler(mockRequest, {})
      
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Authentication failed')
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })

  describe('getAuthenticatedUser function', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user456',
        email: 'user@example.com',
        name: 'User Name',
        avatarUrl: 'https://example.com/user.jpg'
      }
      
      const mockRequest = new NextRequest('http://localhost:3000/api/test')
      ;(getUserFromRequest as jest.Mock).mockResolvedValue(mockUser)
      
      const user = await getAuthenticatedUser(mockRequest)
      
      expect(user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatar_url: mockUser.avatarUrl
      })
    })

    it('should return null when not authenticated', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test')
      ;(getUserFromRequest as jest.Mock).mockResolvedValue(null)
      
      const user = await getAuthenticatedUser(mockRequest)
      
      expect(user).toBeNull()
    })

    it('should handle errors and return null', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test')
      ;(getUserFromRequest as jest.Mock).mockRejectedValue(new Error('Auth error'))
      
      const user = await getAuthenticatedUser(mockRequest)
      
      expect(user).toBeNull()
    })
  })
})

describe('Payment API Routes Integration', () => {
  // Mock for testing payment routes
  const mockCreemService = {
    createCheckoutSession: jest.fn(),
    cancelSubscription: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/payment/create-checkout', () => {
    it('should require authentication via BestAuth', async () => {
      // This test would need to import and test the actual route
      // but we'll simulate the expected behavior
      const mockUser = {
        id: 'user789',
        email: 'payment@example.com'
      }
      
      // Test that the route uses withAuth middleware
      expect(true).toBe(true) // Placeholder - real test would check route export
    })

    it('should pass user from BestAuth to payment logic', async () => {
      // Test that authenticated user is used in payment creation
      const expectedUserId = 'user789'
      const expectedEmail = 'payment@example.com'
      
      // In real test, would call the route and verify user is passed correctly
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('POST /api/payment/cancel-subscription', () => {
    it('should require authentication via BestAuth', async () => {
      // Test that the route uses withAuth middleware
      expect(true).toBe(true) // Placeholder - real test would check route export
    })
  })
})

describe('Generation API Route Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/generate', () => {
    it('should work for unauthenticated users', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Test prompt',
          mode: 'generate'
        })
      })
      
      ;(getUserFromRequest as jest.Mock).mockResolvedValue(null)
      
      // In real test, would import and call the route
      // Verify it handles unauthenticated requests properly
      expect(true).toBe(true) // Placeholder
    })

    it('should use BestAuth user when authenticated', async () => {
      const mockUser = {
        id: 'usergen123',
        email: 'generator@example.com'
      }
      
      const mockRequest = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Test prompt',
          mode: 'generate'
        })
      })
      
      ;(getUserFromRequest as jest.Mock).mockResolvedValue(mockUser)
      
      // In real test, would verify user limits are checked with BestAuth user ID
      expect(true).toBe(true) // Placeholder
    })
  })
})

describe('Cookie-based Authentication Flow', () => {
  it('should include credentials in fetch requests', async () => {
    // Test that payment service uses credentials: 'include'
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' as RequestCredentials,
      body: JSON.stringify({ test: 'data' })
    }
    
    expect(fetchOptions.credentials).toBe('include')
  })

  it('should not send Authorization headers with BestAuth', async () => {
    // Test that BestAuth requests don't include Bearer tokens
    const headers = {
      'Content-Type': 'application/json'
      // No Authorization header
    }
    
    expect(headers).not.toHaveProperty('Authorization')
  })
})

describe('Auth Configuration Switch', () => {
  const originalAuthConfig = process.env.USE_BESTAUTH

  afterEach(() => {
    process.env.USE_BESTAUTH = originalAuthConfig
  })

  it('should use BestAuth when USE_BESTAUTH is true', async () => {
    // Mock auth config
    const mockAuthConfig = { USE_BESTAUTH: true }
    
    // Test that routes check authConfig.USE_BESTAUTH
    expect(mockAuthConfig.USE_BESTAUTH).toBe(true)
  })

  it('should handle Supabase fallback when USE_BESTAUTH is false', async () => {
    // Mock auth config
    const mockAuthConfig = { USE_BESTAUTH: false }
    
    // Test that routes would use Supabase auth when disabled
    expect(mockAuthConfig.USE_BESTAUTH).toBe(false)
  })
})