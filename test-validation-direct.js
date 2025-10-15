/**
 * Direct test of Google Vision API validation functions
 * Tests the validation logic without requiring the full Next.js server
 */

// Test image URLs
const TEST_IMAGE_WITH_FACE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
const TEST_IMAGE_NO_FACE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' // Mountain landscape

async function testValidationDirect() {
  console.log('\n=== Direct Google Vision API Validation Test ===\n')
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' })
  
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  
  if (!apiKey) {
    console.error('❌ GOOGLE_CLOUD_VISION_API_KEY not found in .env.local')
    return
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...\n')
  
  // Import the validation modules
  const { getGoogleVisionService } = require('./src/lib/validation/services/google-vision.ts')
  const { validateCopyright } = require('./src/lib/validation/validators/copyright-validator.ts')
  const { getValidationConfig } = require('./src/lib/validation/config.ts')
  
  const visionService = getGoogleVisionService()
  const validationConfig = getValidationConfig()
  
  console.log('Vision Service Available:', visionService.isAvailable())
  console.log('Validation Config:', JSON.stringify(validationConfig, null, 2))
  console.log('\n---\n')
  
  // Test 1: Image with face
  console.log('Test 1: Validating image WITH face')
  console.log('URL:', TEST_IMAGE_WITH_FACE)
  
  try {
    const result1 = await validateCopyright(TEST_IMAGE_WITH_FACE, validationConfig)
    
    if (!result1.valid) {
      console.log('✅ PASS: Face detected and blocked')
      console.log('   Error:', result1.error)
      console.log('   Code:', result1.code)
      console.log('   Faces:', result1.faces)
    } else {
      console.log('❌ FAIL: Image with face was NOT blocked')
      console.log('   Result:', result1)
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message)
    console.error('   Stack:', error.stack)
  }
  
  console.log('\n---\n')
  
  // Test 2: Image without face
  console.log('Test 2: Validating image WITHOUT face')
  console.log('URL:', TEST_IMAGE_NO_FACE)
  
  try {
    const result2 = await validateCopyright(TEST_IMAGE_NO_FACE, validationConfig)
    
    if (result2.valid) {
      console.log('✅ PASS: Clean image passed validation')
      console.log('   Faces:', result2.faces)
      console.log('   Logos:', result2.logos)
      console.log('   Text:', result2.text)
    } else {
      console.log('❌ FAIL: Clean image was blocked')
      console.log('   Error:', result2.error)
      console.log('   Code:', result2.code)
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message)
    console.error('   Stack:', error.stack)
  }
  
  console.log('\n=== Test Complete ===\n')
  process.exit(0)
}

// Run the test
testValidationDirect().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
