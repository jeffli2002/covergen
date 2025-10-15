/**
 * Test script for copyright validation
 * Tests the complete flow: upload image -> validate -> check for face detection
 */

const TEST_IMAGE_WITH_FACE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
const TEST_IMAGE_NO_FACE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' // Mountain landscape

async function testCopyrightValidation() {
  console.log('\n=== Copyright Validation Test ===\n')
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  
  // Test 1: Image with face (should be blocked)
  console.log('Test 1: Image with face (should be blocked)')
  console.log('Image URL:', TEST_IMAGE_WITH_FACE)
  
  try {
    const response = await fetch(`${baseUrl}/api/sora/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you need to add auth headers
      },
      body: JSON.stringify({
        mode: 'image-to-video',
        image_url: TEST_IMAGE_WITH_FACE,
        prompt: 'A beautiful video',
        aspect_ratio: 'landscape',
        quality: 'standard'
      })
    })
    
    const data = await response.json()
    
    if (response.status === 400 && data.validationFailed) {
      console.log('✅ PASS: Face detected and blocked')
      console.log('   Error:', data.error)
      console.log('   Details:', data.details)
      console.log('   Code:', data.code)
    } else if (response.status === 401) {
      console.log('⚠️  SKIP: Authentication required (expected in production)')
      console.log('   To run this test, you need to be logged in')
    } else {
      console.log('❌ FAIL: Image with face was not blocked')
      console.log('   Response:', data)
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message)
  }
  
  console.log('\n---\n')
  
  // Test 2: Image without face (should pass validation)
  console.log('Test 2: Image without face (should pass validation)')
  console.log('Image URL:', TEST_IMAGE_NO_FACE)
  
  try {
    const response = await fetch(`${baseUrl}/api/sora/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'image-to-video',
        image_url: TEST_IMAGE_NO_FACE,
        prompt: 'A beautiful mountain landscape',
        aspect_ratio: 'landscape',
        quality: 'standard'
      })
    })
    
    const data = await response.json()
    
    if (response.status === 401) {
      console.log('⚠️  SKIP: Authentication required (expected in production)')
      console.log('   To run this test, you need to be logged in')
    } else if (response.status === 400 && data.validationFailed) {
      console.log('❌ FAIL: Clean image was blocked')
      console.log('   Error:', data.error)
      console.log('   Details:', data.details)
    } else if (response.ok || data.taskId) {
      console.log('✅ PASS: Clean image passed validation')
      console.log('   Task ID:', data.taskId)
    } else {
      console.log('⚠️  UNKNOWN:', response.status)
      console.log('   Response:', data)
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message)
  }
  
  console.log('\n=== Test Complete ===\n')
}

// Run the test
testCopyrightValidation().catch(console.error)
