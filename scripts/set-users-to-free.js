// Script to set users to free tier
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const emailsToSetFree = [
  'jefflee2002@gmail.com',
  '994235892@qq.com'
]

async function setUserToFree(email) {
  console.log(`\n处理用户: ${email}`)
  
  try {
    // 1. 获取用户ID
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error(`❌ 获取用户列表失败:`, authError.message)
      return false
    }
    
    const user = authData.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ 未找到用户: ${email}`)
      return false
    }
    
    console.log(`✓ 找到用户ID: ${user.id}`)
    
    // 2. 更新或插入订阅信息到 subscriptions_consolidated 表
    const { data: subData, error: subError } = await supabase
      .from('subscriptions_consolidated')
      .upsert({
        user_id: user.id,
        tier: 'free',
        status: 'active',
        daily_limit: 3,
        trial_started_at: null,
        trial_ended_at: null,
        trial_days: null,
        paid_started_at: null,
        canceled_at: null,
        expires_at: null,
        current_period_start: null,
        current_period_end: null,
        next_billing_date: null,
        creem_customer_id: null,
        creem_subscription_id: null,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        cancel_at_period_end: false,
        previous_tier: null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
    
    if (subError) {
      console.error(`❌ 更新订阅失败:`, subError.message)
      return false
    }
    
    console.log(`✓ 订阅已更新为免费用户`)
    
    // 3. 验证更新结果
    const { data: verifyData, error: verifyError } = await supabase
      .from('subscriptions_consolidated')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (verifyError) {
      console.error(`❌ 验证失败:`, verifyError.message)
      return false
    }
    
    console.log(`✓ 验证成功:`)
    console.log(`  - 等级: ${verifyData.tier}`)
    console.log(`  - 状态: ${verifyData.status}`)
    console.log(`  - 每日限额: ${verifyData.daily_limit}`)
    
    // 4. 检查生成限制
    const { data: limitData, error: limitError } = await supabase
      .rpc('check_generation_limit', {
        p_user_id: user.id
      })
    
    if (limitError) {
      console.error(`⚠️  检查生成限制失败:`, limitError.message)
    } else {
      console.log(`✓ 生成限制检查:`)
      console.log(`  - 可以生成: ${limitData.can_generate}`)
      console.log(`  - 每日使用: ${limitData.daily_usage}/${limitData.daily_limit}`)
      console.log(`  - 每月使用: ${limitData.monthly_usage}/${limitData.monthly_limit}`)
    }
    
    return true
    
  } catch (error) {
    console.error(`❌ 处理用户时出错:`, error.message)
    return false
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('将用户设置为免费用户')
  console.log('='.repeat(60))
  
  let successCount = 0
  let failCount = 0
  
  for (const email of emailsToSetFree) {
    const success = await setUserToFree(email)
    if (success) {
      successCount++
    } else {
      failCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('处理完成')
  console.log('='.repeat(60))
  console.log(`✓ 成功: ${successCount}`)
  console.log(`✗ 失败: ${failCount}`)
  console.log('='.repeat(60))
}

main().catch(console.error)

