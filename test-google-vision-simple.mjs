/**
 * Simple test of Google Vision API directly
 * Tests the API connection and face detection capability
 */

import { ImageAnnotatorClient } from '@google-cloud/vision'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const TEST_IMAGE_WITH_FACE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
const TEST_IMAGE_NO_FACE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'

async function testGoogleVision() {
  console.log('\n=== Google Vision API Direct Test ===\n')
  
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  
  if (!apiKey) {
    console.error('❌ GOOGLE_CLOUD_VISION_API_KEY not found in environment')
    process.exit(1)
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...')
  
  // Initialize client
  let client
  try {
    client = new ImageAnnotatorClient({ apiKey })
    console.log('✅ Vision client initialized\n')
  } catch (error) {
    console.error('❌ Failed to initialize Vision client:', error.message)
    process.exit(1)
  }
  
  // Test 1: Image with face
  console.log('---\nTest 1: Image WITH face')
  console.log('URL:', TEST_IMAGE_WITH_FACE)
  
  try {
    const [result] = await client.faceDetection(TEST_IMAGE_WITH_FACE)
    const faces = result.faceAnnotations || []
    
    console.log(`Found ${faces.length} face(s)`)
    
    if (faces.length > 0) {
      console.log('✅ PASS: Faces detected correctly')
      faces.forEach((face, i) => {
        console.log(`   Face ${i + 1}: Confidence ${(face.detectionConfidence * 100).toFixed(1)}%`)
      })
    } else {
      console.log('❌ FAIL: No faces detected (expected to find faces)')
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message)
  }
  
  // Test 2: Image without face
  console.log('\n---\nTest 2: Image WITHOUT face')
  console.log('URL:', TEST_IMAGE_NO_FACE)
  
  try {
    const [result] = await client.faceDetection(TEST_IMAGE_NO_FACE)
    const faces = result.faceAnnotations || []
    
    console.log(`Found ${faces.length} face(s)`)
    
    if (faces.length === 0) {
      console.log('✅ PASS: No faces detected (correct)')
    } else {
      console.log('❌ FAIL: Faces detected in landscape image')
      faces.forEach((face, i) => {
        console.log(`   Face ${i + 1}: Confidence ${(face.detectionConfidence * 100).toFixed(1)}%`)
      })
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message)
  }
  
  console.log('\n=== Test Complete ===\n')
}

testGoogleVision()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
