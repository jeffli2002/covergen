#!/usr/bin/env node

// Direct test of Sora API to see real error message

async function testDirectSoraApi() {
  const fetch = (await import('node-fetch')).default
  
  const apiKey = process.env.KIE_API_KEY || '9ed11e892b19798118cbe9610c0bea7c'
  
  console.log('Testing Sora API with example image from API docs...\n')
  
  // Use the exact example from API documentation
  const request = {
    "model": "sora-2-image-to-video",
    "input": {
      "prompt": "A claymation conductor passionately leads a claymation orchestra",
      "image_urls": ["https://file.aiquickdraw.com/custom-page/akr/section-images/17594315607644506ltpf.jpg"],
      "aspect_ratio": "landscape",
      "quality": "standard"
    }
  }
  
  console.log('Request:', JSON.stringify(request, null, 2))
  console.log('\nCalling Sora API...\n')
  
  const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(request)
  })
  
  const responseText = await response.text()
  console.log('HTTP Status:', response.status)
  console.log('Response:', responseText)
  
  try {
    const data = JSON.parse(responseText)
    console.log('\nParsed response:', JSON.stringify(data, null, 2))
    
    if (data.code !== 200) {
      console.log('\n❌ ERROR DETAILS:')
      console.log('  Code:', data.code)
      console.log('  Message:', data.msg)
    } else {
      console.log('\n✅ SUCCESS - Task ID:', data.data.taskId)
    }
  } catch (e) {
    console.error('Failed to parse JSON')
  }
}

testDirectSoraApi().catch(console.error)
