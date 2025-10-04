#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const API_BASE_URL = 'http://localhost:3001/api/sora'

async function testImageToVideo() {
  console.log('\n🧪 Testing Image-to-Video Generation Flow')
  console.log('='.repeat(80))

  try {
    // Step 1: Upload test image
    console.log('\n📤 Step 1: Uploading test image...')
    
    // Check if test image exists
    const testImagePath = path.join(__dirname, 'images/wechatdemo.png')
    if (!fs.existsSync(testImagePath)) {
      console.error('❌ Test image not found:', testImagePath)
      console.log('Please create a test image or update the path')
      process.exit(1)
    }

    const FormData = (await import('node-fetch')).FormData
    const fetch = (await import('node-fetch')).default
    
    const formData = new FormData()
    formData.append('image', fs.createReadStream(testImagePath))

    const uploadResponse = await fetch(`${API_BASE_URL}/upload-image`, {
      method: 'POST',
      body: formData
    })

    const uploadData = await uploadResponse.json()
    
    if (!uploadResponse.ok) {
      console.error('❌ Image upload failed:', uploadData)
      process.exit(1)
    }

    console.log('✅ Image uploaded successfully!')
    console.log('📸 Image URL:', uploadData.imageUrl)
    console.log('📊 File info:', {
      name: uploadData.fileName,
      size: `${(uploadData.fileSize / 1024).toFixed(2)} KB`,
      type: uploadData.fileType
    })

    // Step 2: Verify image URL is accessible
    console.log('\n🔍 Step 2: Verifying image URL is publicly accessible...')
    
    const imageCheckResponse = await fetch(uploadData.imageUrl, { method: 'HEAD' })
    
    if (!imageCheckResponse.ok) {
      console.error('❌ Image URL not accessible:', imageCheckResponse.status)
      console.error('This will cause the video generation to fail')
      process.exit(1)
    }
    
    console.log('✅ Image URL is publicly accessible')
    console.log('📋 Content-Type:', imageCheckResponse.headers.get('content-type'))

    // Step 3: Create video generation task
    console.log('\n🎬 Step 3: Creating video generation task...')
    
    const createResponse = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'image-to-video',
        image_url: uploadData.imageUrl,
        prompt: 'Camera slowly zooms in, cinematic lighting, smooth motion',
        aspect_ratio: 'landscape',
        quality: 'standard'
      })
    })

    const createData = await createResponse.json()
    
    if (!createResponse.ok) {
      console.error('❌ Task creation failed:', createData)
      process.exit(1)
    }

    console.log('✅ Task created successfully!')
    console.log('🎫 Task ID:', createData.taskId)

    // Step 4: Poll for result
    console.log('\n⏳ Step 4: Polling for video generation result...')
    console.log('(This may take several minutes)')
    
    let attempts = 0
    const maxAttempts = 60
    const pollInterval = 5000

    while (attempts < maxAttempts) {
      attempts++
      
      const queryResponse = await fetch(`${API_BASE_URL}/query?taskId=${createData.taskId}`)
      const queryData = await queryResponse.json()

      console.log(`📊 Attempt ${attempts}/${maxAttempts}: Status = ${queryData.state}`)

      if (queryData.state === 'success') {
        console.log('\n✅ VIDEO GENERATION SUCCESSFUL!')
        const result = JSON.parse(queryData.resultJson)
        console.log('📹 Video URL:', result.resultUrls[0])
        console.log('⏱️  Generation time:', queryData.costTime, 'ms')
        console.log('\n' + '='.repeat(80))
        console.log('✅ IMAGE-TO-VIDEO TEST PASSED')
        console.log('='.repeat(80))
        process.exit(0)
      } else if (queryData.state === 'fail') {
        console.error('\n❌ VIDEO GENERATION FAILED!')
        console.error('Error code:', queryData.failCode)
        console.error('Error message:', queryData.failMsg)
        console.error('Request params:', queryData.param)
        console.log('\n' + '='.repeat(80))
        console.log('❌ IMAGE-TO-VIDEO TEST FAILED')
        console.log('='.repeat(80))
        process.exit(1)
      }

      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }

    console.error('\n⏰ Polling timeout after', maxAttempts * pollInterval / 1000, 'seconds')
    process.exit(1)

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

if (require.main === module) {
  testImageToVideo()
}

module.exports = { testImageToVideo }
