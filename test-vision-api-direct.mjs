/**
 * Direct test of Google Vision API face detection
 * Tests with known images containing faces
 */

import { ImageAnnotatorClient } from '@google-cloud/vision'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Test images
const TEST_IMAGES = [
  {
    name: 'Portrait with clear face',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'
  },
  {
    name: 'Person in landscape',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
  },
  {
    name: 'Multiple people',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'
  },
  {
    name: 'Mountain (no people)',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
  }
]

async function testVisionAPI() {
  console.log('\n=== Google Vision API Face Detection Test ===\n')
  
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  
  if (!apiKey) {
    console.error('❌ GOOGLE_CLOUD_VISION_API_KEY not found')
    process.exit(1)
  }
  
  console.log('API Key:', apiKey.substring(0, 20) + '...\n')
  
  let client
  try {
    client = new ImageAnnotatorClient({ apiKey })
    console.log('✅ Client initialized\n')
  } catch (error) {
    console.error('❌ Failed to initialize:', error.message)
    process.exit(1)
  }
  
  for (const image of TEST_IMAGES) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Testing: ${image.name}`)
    console.log(`URL: ${image.url}`)
    console.log('='.repeat(60))
    
    try {
      const [result] = await client.faceDetection(image.url)
      const faces = result.faceAnnotations || []
      
      console.log(`\n✅ API Response received`)
      console.log(`Found ${faces.length} face(s)`)
      
      if (faces.length > 0) {
        console.log('\n👤 Face Details:')
        faces.forEach((face, i) => {
          console.log(`\n  Face ${i + 1}:`)
          console.log(`    Detection Confidence: ${(face.detectionConfidence * 100).toFixed(1)}%`)
          console.log(`    Joy Likelihood: ${face.joyLikelihood}`)
          console.log(`    Sorrow Likelihood: ${face.sorrowLikelihood}`)
          console.log(`    Anger Likelihood: ${face.angerLikelihood}`)
          console.log(`    Surprise Likelihood: ${face.surpriseLikelihood}`)
          console.log(`    Under Exposed: ${face.underExposedLikelihood}`)
          console.log(`    Blurred: ${face.blurredLikelihood}`)
          console.log(`    Headwear: ${face.headwearLikelihood}`)
        })
      } else {
        console.log('\n  No faces detected')
      }
      
      // Also check for person detection using label detection
      console.log('\n🏷️  Label Detection (checking for "person" labels):')
      const [labelResult] = await client.labelDetection(image.url)
      const labels = labelResult.labelAnnotations || []
      
      const personLabels = labels.filter(label => 
        label.description.toLowerCase().includes('person') ||
        label.description.toLowerCase().includes('people') ||
        label.description.toLowerCase().includes('human') ||
        label.description.toLowerCase().includes('man') ||
        label.description.toLowerCase().includes('woman')
      )
      
      if (personLabels.length > 0) {
        personLabels.forEach(label => {
          console.log(`    - ${label.description}: ${(label.score * 100).toFixed(1)}% confidence`)
        })
      } else {
        console.log('    No person-related labels found')
      }
      
      // Check logo detection
      console.log('\n🔍 Logo Detection:')
      const [logoResult] = await client.logoDetection(image.url)
      const logos = logoResult.logoAnnotations || []
      
      if (logos.length > 0) {
        logos.forEach(logo => {
          console.log(`    - ${logo.description}: ${(logo.score * 100).toFixed(1)}% confidence`)
        })
      } else {
        console.log('    No logos detected')
      }
      
    } catch (error) {
      console.error('❌ API Error:', error.message)
      if (error.code) console.error('   Error Code:', error.code)
      if (error.details) console.error('   Details:', error.details)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Test Complete')
  console.log('='.repeat(60) + '\n')
}

testVisionAPI()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
