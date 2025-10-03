#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:3001/api/sora'
const KIE_API_KEY = '9ed11e892b19798118cbe9610c0bea7c'

const TEST_CASES = [
  {
    name: 'Standard Landscape Video',
    input: {
      prompt: 'A beautiful sunset over the ocean with waves gently rolling onto a sandy beach',
      aspect_ratio: 'landscape',
      quality: 'standard'
    }
  },
  {
    name: 'HD Portrait Video',
    input: {
      prompt: 'A cat playing with a ball of yarn in a cozy living room',
      aspect_ratio: 'portrait',
      quality: 'hd'
    }
  },
  {
    name: 'Default Prompt Test',
    input: {
      prompt: 'A professor stands at the front of a lively classroom, enthusiastically giving a lecture. On the blackboard behind him are colorful chalk diagrams. With an animated gesture, he declares to the students: "Sora 2 is now available on Kie AI, making it easier than ever to create stunning videos." The students listen attentively, some smiling and taking notes.',
      aspect_ratio: 'landscape',
      quality: 'standard'
    }
  }
]

async function createTask(input) {
  console.log('\n📤 Creating task...')
  console.log('Input:', JSON.stringify(input, null, 2))
  
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Create task failed: ${data.error || response.statusText}`)
  }
  
  console.log('✅ Task created:', data.taskId)
  return data.taskId
}

async function queryTask(taskId) {
  const response = await fetch(`${API_BASE_URL}/query?taskId=${taskId}`)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Query task failed: ${data.error || response.statusText}`)
  }
  
  return data
}

async function pollTask(taskId, maxAttempts = 60, intervalMs = 5000) {
  console.log(`\n🔄 Polling task status (max ${maxAttempts} attempts, ${intervalMs/1000}s interval)...`)
  
  for (let i = 0; i < maxAttempts; i++) {
    const taskInfo = await queryTask(taskId)
    
    console.log(`📊 Attempt ${i + 1}/${maxAttempts}: Status = ${taskInfo.state}`)
    
    if (taskInfo.state === 'success') {
      console.log('✅ Task completed successfully!')
      const result = JSON.parse(taskInfo.resultJson)
      console.log('📹 Video URL:', result.resultUrls[0])
      console.log('⏱️  Cost time:', taskInfo.costTime, 'ms')
      return {
        success: true,
        taskInfo,
        videoUrl: result.resultUrls[0]
      }
    }
    
    if (taskInfo.state === 'fail') {
      console.log('❌ Task failed!')
      console.log('Error code:', taskInfo.failCode)
      console.log('Error message:', taskInfo.failMsg)
      return {
        success: false,
        taskInfo,
        error: taskInfo.failMsg
      }
    }
    
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  }
  
  console.log('⏰ Task timeout!')
  return {
    success: false,
    error: 'Polling timeout'
  }
}

async function runTest(testCase) {
  console.log('\n' + '='.repeat(80))
  console.log(`🧪 Test Case: ${testCase.name}`)
  console.log('='.repeat(80))
  
  try {
    const taskId = await createTask(testCase.input)
    const result = await pollTask(taskId)
    
    if (result.success) {
      console.log('\n✅ TEST PASSED')
      return { ...testCase, passed: true, result }
    } else {
      console.log('\n❌ TEST FAILED')
      return { ...testCase, passed: false, result }
    }
  } catch (error) {
    console.log('\n❌ TEST ERROR:', error.message)
    return { ...testCase, passed: false, error: error.message }
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting Sora 2 API Automated Tests')
  console.log('API Base URL:', API_BASE_URL)
  console.log('Total test cases:', TEST_CASES.length)
  
  const results = []
  
  for (const testCase of TEST_CASES) {
    const result = await runTest(testCase)
    results.push(result)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(80))
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  console.log(`\nTotal: ${results.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  
  if (failed > 0) {
    console.log('\nFailed tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error || r.result?.error || 'Unknown error'}`)
    })
  }
  
  console.log('\n' + '='.repeat(80))
  
  process.exit(failed > 0 ? 1 : 0)
}

if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = { createTask, queryTask, pollTask, runTest }
