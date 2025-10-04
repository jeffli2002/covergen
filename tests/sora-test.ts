/**
 * Automated test script for Sora 2 video generation
 * Tests both text-to-video and image-to-video modes
 */

const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const POLL_INTERVAL = 5000 // 5 seconds
const MAX_WAIT_TIME = 300000 // 5 minutes

interface TestResult {
  success: boolean
  mode: string
  taskId?: string
  videoUrl?: string
  error?: string
  duration?: number
}

// Helper function to poll task status
async function pollTaskStatus(taskId: string): Promise<{ state: string; resultJson?: string; failMsg?: string }> {
  const response = await fetch(`${API_BASE}/api/sora/query?taskId=${taskId}`)
  if (!response.ok) {
    throw new Error(`Failed to query task status: ${response.statusText}`)
  }
  return response.json()
}

// Test 1: Text-to-Video Generation
async function testTextToVideo(): Promise<TestResult> {
  console.log('\n🎬 Testing Text-to-Video Generation...')
  const startTime = Date.now()

  try {
    const requestBody = {
      mode: 'text-to-video',
      prompt: 'A professor stands at the front of a lively classroom, enthusiastically giving a lecture. On the blackboard behind him are colorful chalk diagrams. With an animated gesture, he declares to the students: "Sora 2 is now available on Kie AI, making it easier than ever to create stunning videos." The students listen attentively, some smiling and taking notes.',
      aspect_ratio: 'landscape',
      quality: 'standard'
    }

    console.log('  → Sending creation request...')
    const createResponse = await fetch(`${API_BASE}/api/sora/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!createResponse.ok) {
      const error = await createResponse.json()
      throw new Error(error.error || 'Failed to create task')
    }

    const { taskId } = await createResponse.json()
    console.log(`  ✓ Task created: ${taskId}`)

    // Poll for completion
    console.log('  → Polling for completion...')
    const endTime = Date.now() + MAX_WAIT_TIME
    
    while (Date.now() < endTime) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
      
      const status = await pollTaskStatus(taskId)
      console.log(`  → Status: ${status.state}`)

      if (status.state === 'success') {
        const resultUrls = JSON.parse(status.resultJson!).resultUrls
        const duration = Date.now() - startTime
        console.log(`  ✓ Video generated successfully in ${duration}ms`)
        console.log(`  ✓ Video URL: ${resultUrls[0]}`)
        
        return {
          success: true,
          mode: 'text-to-video',
          taskId,
          videoUrl: resultUrls[0],
          duration
        }
      } else if (status.state === 'fail') {
        throw new Error(status.failMsg || 'Generation failed')
      }
    }

    throw new Error('Timeout: Generation took longer than 5 minutes')

  } catch (error) {
    return {
      success: false,
      mode: 'text-to-video',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test 2: Image-to-Video Generation
async function testImageToVideo(): Promise<TestResult> {
  console.log('\n🖼️  Testing Image-to-Video Generation...')
  const startTime = Date.now()

  try {
    // Create a test image (1x1 red pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
    const testImageDataUrl = `data:image/png;base64,${testImageBase64}`

    console.log('  → Creating test image...')
    const imageBlob = await (await fetch(testImageDataUrl)).blob()
    const imageFile = new File([imageBlob], 'test.png', { type: 'image/png' })

    // Upload image
    console.log('  → Uploading image...')
    const uploadFormData = new FormData()
    uploadFormData.append('image', imageFile)

    const uploadResponse = await fetch(`${API_BASE}/api/sora/upload-image`, {
      method: 'POST',
      body: uploadFormData
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json()
      throw new Error(error.error || 'Failed to upload image')
    }

    const { imageUrl } = await uploadResponse.json()
    console.log(`  ✓ Image uploaded: ${imageUrl.substring(0, 50)}...`)

    // Create video generation task
    const requestBody = {
      mode: 'image-to-video',
      image_url: imageUrl,
      prompt: 'Camera slowly zooms in, cinematic lighting, smooth motion',
      aspect_ratio: 'landscape',
      quality: 'standard'
    }

    console.log('  → Sending creation request...')
    const createResponse = await fetch(`${API_BASE}/api/sora/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!createResponse.ok) {
      const error = await createResponse.json()
      throw new Error(error.error || 'Failed to create task')
    }

    const { taskId } = await createResponse.json()
    console.log(`  ✓ Task created: ${taskId}`)

    // Poll for completion
    console.log('  → Polling for completion...')
    const endTime = Date.now() + MAX_WAIT_TIME
    
    while (Date.now() < endTime) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
      
      const status = await pollTaskStatus(taskId)
      console.log(`  → Status: ${status.state}`)

      if (status.state === 'success') {
        const resultUrls = JSON.parse(status.resultJson!).resultUrls
        const duration = Date.now() - startTime
        console.log(`  ✓ Video generated successfully in ${duration}ms`)
        console.log(`  ✓ Video URL: ${resultUrls[0]}`)
        
        return {
          success: true,
          mode: 'image-to-video',
          taskId,
          videoUrl: resultUrls[0],
          duration
        }
      } else if (status.state === 'fail') {
        throw new Error(status.failMsg || 'Generation failed')
      }
    }

    throw new Error('Timeout: Generation took longer than 5 minutes')

  } catch (error) {
    return {
      success: false,
      mode: 'image-to-video',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Main test runner
async function runTests() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('🚀 Sora 2 Video Generation Test Suite')
  console.log('═══════════════════════════════════════════════════════')

  const results: TestResult[] = []

  // Run text-to-video test
  const textResult = await testTextToVideo()
  results.push(textResult)

  // Run image-to-video test
  const imageResult = await testImageToVideo()
  results.push(imageResult)

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('📊 Test Results Summary')
  console.log('═══════════════════════════════════════════════════════')

  results.forEach((result, index) => {
    console.log(`\nTest ${index + 1}: ${result.mode}`)
    console.log(`  Status: ${result.success ? '✓ PASSED' : '✗ FAILED'}`)
    if (result.success) {
      console.log(`  Duration: ${result.duration}ms`)
      console.log(`  Task ID: ${result.taskId}`)
      console.log(`  Video URL: ${result.videoUrl}`)
    } else {
      console.log(`  Error: ${result.error}`)
    }
  })

  const passedTests = results.filter(r => r.success).length
  const totalTests = results.length

  console.log('\n═══════════════════════════════════════════════════════')
  console.log(`Final Score: ${passedTests}/${totalTests} tests passed`)
  console.log('═══════════════════════════════════════════════════════\n')

  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1)
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite error:', error)
  process.exit(1)
})
