#!/usr/bin/env node

const TEST_PROMPT = 'A beautiful sunset over the ocean with waves gently rolling onto a sandy beach'

async function testSoraAPI() {
  console.log('🧪 Testing Sora 2 API Integration\n')
  
  console.log('Step 1: Creating task...')
  const createResponse = await fetch('http://localhost:3001/api/sora/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: TEST_PROMPT,
      aspect_ratio: 'landscape',
      quality: 'standard'
    })
  })
  
  const createData = await createResponse.json()
  
  if (!createResponse.ok) {
    console.error('❌ Create task failed:', createData.error)
    console.error('Response:', JSON.stringify(createData, null, 2))
    process.exit(1)
  }
  
  const taskId = createData.taskId
  console.log('✅ Task created:', taskId)
  
  console.log('\nStep 2: Querying task status...')
  const queryResponse = await fetch(`http://localhost:3001/api/sora/query?taskId=${taskId}`)
  const queryData = await queryResponse.json()
  
  if (!queryResponse.ok) {
    console.error('❌ Query task failed:', queryData.error)
    process.exit(1)
  }
  
  console.log('✅ Task status:', queryData.state)
  console.log('Task info:', JSON.stringify(queryData, null, 2))
  
  if (queryData.state === 'waiting' || queryData.state === 'processing') {
    console.log('\n⏳ Task is in progress. Poll /api/sora/query?taskId=' + taskId + ' to check status.')
  } else if (queryData.state === 'success') {
    const result = JSON.parse(queryData.resultJson)
    console.log('\n🎉 Video generated successfully!')
    console.log('📹 Video URL:', result.resultUrls[0])
  } else if (queryData.state === 'fail') {
    console.log('\n❌ Generation failed:', queryData.failMsg)
  }
  
  console.log('\n✅ API integration test completed successfully!')
}

testSoraAPI().catch(error => {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
})
