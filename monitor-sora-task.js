#!/usr/bin/env node

const taskId = process.argv[2] || 'e466a1afd20749ca364aaad08f067662'

async function monitorTask() {
  console.log(`🔍 Monitoring task: ${taskId}\n`)
  
  let attempts = 0
  const maxAttempts = 120
  const interval = 5000
  
  while (attempts < maxAttempts) {
    attempts++
    
    const response = await fetch(`http://localhost:3001/api/sora/query?taskId=${taskId}`)
    const data = await response.json()
    
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[${timestamp}] Attempt ${attempts}/${maxAttempts} - State: ${data.state}`)
    
    if (data.state === 'success') {
      console.log('\n✅ GENERATION COMPLETE!')
      const result = JSON.parse(data.resultJson)
      console.log('📹 Video URL:', result.resultUrls[0])
      console.log('⏱️  Generation time:', data.costTime, 'ms')
      console.log('📊 Created:', new Date(data.createTime).toLocaleString())
      console.log('📊 Completed:', new Date(data.completeTime).toLocaleString())
      break
    }
    
    if (data.state === 'fail') {
      console.log('\n❌ GENERATION FAILED!')
      console.log('Error code:', data.failCode)
      console.log('Error message:', data.failMsg)
      break
    }
    
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n⏰ Monitoring timeout reached')
  }
}

monitorTask().catch(error => {
  console.error('❌ Monitoring error:', error.message)
  process.exit(1)
})
