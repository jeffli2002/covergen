#!/usr/bin/env tsx
// Automated test script for modular OAuth implementation

import { GoogleOAuthProvider } from '../src/services/auth/providers/googleOAuth'
import { authEventBus } from '../src/services/auth/eventBus'
import { sessionManagerListener } from '../src/services/auth/listeners/sessionManager'
import { profileSyncListener } from '../src/services/auth/listeners/profileSync'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
}

interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now()
  process.stdout.write(`${colors.blue}Running:${colors.reset} ${name}... `)
  
  try {
    await testFn()
    const duration = Date.now() - start
    console.log(`${colors.green}✓ PASSED${colors.reset} (${duration}ms)`)
    results.push({ name, passed: true, duration })
  } catch (error: any) {
    const duration = Date.now() - start
    console.log(`${colors.red}✗ FAILED${colors.reset} (${duration}ms)`)
    console.error(`  ${colors.gray}Error: ${error.message}${colors.reset}`)
    results.push({ name, passed: false, error: error.message, duration })
  }
}

// Test 1: Module Creation
async function testModuleCreation() {
  const oauth = new GoogleOAuthProvider()
  if (!oauth) throw new Error('Failed to create GoogleOAuthProvider')
  
  // Check if required methods exist
  if (typeof oauth.signIn !== 'function') throw new Error('signIn method not found')
  if (typeof oauth.signOut !== 'function') throw new Error('signOut method not found')
  if (typeof oauth.handleCallback !== 'function') throw new Error('handleCallback method not found')
  if (typeof oauth.getSession !== 'function') throw new Error('getSession method not found')
}

// Test 2: Event Bus Functionality
async function testEventBus() {
  let eventReceived = false
  let receivedEvent: any = null
  
  // Subscribe to test event
  const unsubscribe = authEventBus.on('auth:signin:success', (event) => {
    eventReceived = true
    receivedEvent = event
  })

  // Emit test event
  await authEventBus.emit({
    type: 'auth:signin:success',
    user: { id: 'test-123', email: 'test@example.com' },
    session: {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      user: { id: 'test-123', email: 'test@example.com' }
    },
    metadata: { test: true, provider: 'test' }
  })

  // Wait for async processing
  await new Promise(resolve => setTimeout(resolve, 100))
  
  unsubscribe()
  
  if (!eventReceived) throw new Error('Event was not received')
  if (!receivedEvent) throw new Error('Received event is null')
  if (receivedEvent.user?.email !== 'test@example.com') {
    throw new Error('Event data mismatch')
  }
}

// Test 3: Multiple Listeners
async function testMultipleListeners() {
  let listener1Called = false
  let listener2Called = false
  let globalListenerCalled = false
  
  // Add multiple listeners
  const unsub1 = authEventBus.on('auth:signout:success', () => {
    listener1Called = true
  })
  
  const unsub2 = authEventBus.on('auth:signout:success', () => {
    listener2Called = true
  })
  
  const unsubGlobal = authEventBus.onAll(() => {
    globalListenerCalled = true
  })

  // Emit event
  await authEventBus.emit({
    type: 'auth:signout:success',
    metadata: { test: true }
  })

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Cleanup
  unsub1()
  unsub2()
  unsubGlobal()
  
  if (!listener1Called) throw new Error('Listener 1 not called')
  if (!listener2Called) throw new Error('Listener 2 not called')
  if (!globalListenerCalled) throw new Error('Global listener not called')
}

// Test 4: Event Isolation
async function testEventIsolation() {
  let wrongEventReceived = false
  
  // Listen for specific event
  const unsubscribe = authEventBus.on('auth:session:expired', () => {
    wrongEventReceived = true
  })

  // Emit different event
  await authEventBus.emit({
    type: 'auth:signin:success',
    user: { id: 'test', email: 'test@example.com' },
    metadata: { test: true }
  })

  // Wait
  await new Promise(resolve => setTimeout(resolve, 100))
  
  unsubscribe()
  
  if (wrongEventReceived) {
    throw new Error('Received event for wrong type')
  }
}

// Test 5: Session Manager Integration
async function testSessionManager() {
  // Start the session manager
  sessionManagerListener.start()
  
  // Initially should have no session
  let session = sessionManagerListener.getSession()
  if (session !== null) {
    sessionManagerListener.stop()
    throw new Error('Session should be null initially')
  }
  
  // Emit signin event with session
  await authEventBus.emit({
    type: 'auth:signin:success',
    session: {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      user: { id: 'test-user', email: 'test@example.com' }
    },
    user: { id: 'test-user', email: 'test@example.com' }
  })
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Should now have session
  session = sessionManagerListener.getSession()
  if (!session) {
    sessionManagerListener.stop()
    throw new Error('Session not stored after signin')
  }
  
  if (session.access_token !== 'test-access-token') {
    sessionManagerListener.stop()
    throw new Error('Session data mismatch')
  }
  
  // Test signout clears session
  await authEventBus.emit({
    type: 'auth:signout:success'
  })
  
  await new Promise(resolve => setTimeout(resolve, 200))
  
  session = sessionManagerListener.getSession()
  if (session !== null) {
    sessionManagerListener.stop()
    throw new Error('Session should be cleared after signout')
  }
  
  sessionManagerListener.stop()
}

// Test 6: Error Handling
async function testErrorHandling() {
  let errorEventReceived = false
  
  const unsubscribe = authEventBus.on('auth:signin:error', (event) => {
    errorEventReceived = true
    if (!event.error) throw new Error('Error event missing error message')
  })

  await authEventBus.emit({
    type: 'auth:signin:error',
    error: 'Test error message',
    metadata: { provider: 'google' }
  })

  await new Promise(resolve => setTimeout(resolve, 100))
  
  unsubscribe()
  
  if (!errorEventReceived) {
    throw new Error('Error event not received')
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.blue}═══ Modular OAuth Test Suite ═══${colors.reset}\n`)
  
  // Clean up any existing listeners
  authEventBus.clear()
  
  // Run all tests
  await runTest('Module Creation', testModuleCreation)
  await runTest('Event Bus - Basic', testEventBus)
  await runTest('Event Bus - Multiple Listeners', testMultipleListeners)
  await runTest('Event Bus - Event Isolation', testEventIsolation)
  await runTest('Session Manager Integration', testSessionManager)
  await runTest('Error Event Handling', testErrorHandling)
  
  // Summary
  console.log(`\n${colors.blue}═══ Test Summary ═══${colors.reset}\n`)
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  
  console.log(`Total Tests: ${results.length}`)
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`)
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`)
  console.log(`Duration: ${totalDuration}ms\n`)
  
  if (failed > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`)
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`)
    })
    console.log()
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
console.log(`${colors.gray}Starting automated OAuth module tests...${colors.reset}`)
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error)
  process.exit(1)
})