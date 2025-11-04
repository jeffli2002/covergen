#!/usr/bin/env tsx
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function checkDNSPropagation() {
  console.log('🔍 Checking DNS Propagation for covergen.pro')
  console.log('=' .repeat(60))
  console.log('')

  try {
    // Check nameservers
    console.log('📡 Checking Nameservers...')
    const { stdout: nsOutput } = await execAsync('nslookup -type=NS covergen.pro')
    
    const isVercel = nsOutput.includes('vercel-dns.com') || 
                     nsOutput.includes('ns1.vercel') || 
                     nsOutput.includes('ns2.vercel')
    
    const isSpaceship = nsOutput.includes('spaceship.net')
    
    if (isVercel) {
      console.log('✅ DNS 已传播到 Vercel nameservers!')
      console.log('')
      console.log('🎉 您现在可以在 Vercel Dashboard 中添加 DNS 记录了！')
      console.log('')
      console.log('📋 下一步：')
      console.log('1. 访问：https://vercel.com/jeff-lees-projects-92a56a05/covergen/settings/domains')
      console.log('2. 点击 covergen.pro 旁边的 "Edit" 按钮')
      console.log('3. 查找 "DNS Records" 或 "Add Record" 选项')
      console.log('4. 添加 Resend 的 3 条 TXT 记录')
      console.log('')
      console.log('或者使用 Vercel CLI：')
      console.log('   vercel dns add covergen.pro @ TXT "v=spf1 include:_spf.resend.com ~all"')
      
      return true
    } else if (isSpaceship) {
      console.log('⏳ DNS 还在传播中...')
      console.log('   当前仍然指向 Spaceship nameservers')
      console.log('')
      console.log('⏰ DNS 传播通常需要：')
      console.log('   • 最快：1-2 小时')
      console.log('   • 通常：4-8 小时')
      console.log('   • 最多：24-48 小时')
      console.log('')
      console.log('💡 建议：')
      console.log('   • 每隔 1-2 小时运行此脚本检查进度')
      console.log('   • 或者使用：npm run check:dns')
      console.log('   • 在此期间，您可以先在 Resend 添加域名获取 DNS 记录')
      
      return false
    } else {
      console.log('⚠️  未能识别 nameservers:')
      console.log(nsOutput)
      return false
    }
  } catch (error: any) {
    console.error('❌ 检查失败:', error.message)
    return false
  }
}

// Run check
checkDNSPropagation().then(success => {
  process.exit(success ? 0 : 1)
})

