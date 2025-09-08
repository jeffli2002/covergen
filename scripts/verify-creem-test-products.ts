#!/usr/bin/env node

const https = require('https')

// Load environment variables
require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') })

const apiKey = process.env.CREEM_SECRET_KEY || process.env.CREEM_API_KEY || ''
const productIds = {
  pro: process.env.CREEM_PRO_PLAN_ID || 'prod_7HHnnUgLVjiHBQOGQyKPKO',
  pro_plus: process.env.CREEM_PRO_PLUS_PLAN_ID || 'prod_5FSXAIuhm6ueniFPAbaOoS'
}

console.log('🔍 Verifying Creem Test Products\n')
console.log('API Key Type:', apiKey.startsWith('creem_test_') ? 'TEST' : 'PRODUCTION')
console.log('Product IDs to check:')
console.log('  Pro:', productIds.pro)
console.log('  Pro Plus:', productIds.pro_plus)
console.log('')

async function checkProduct(productId, planName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.creem.io',
      port: 443,
      path: `/v1/products/${productId}`,
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        console.log(`\n${planName} Plan (${productId}):`)
        console.log('  Status Code:', res.statusCode)
        
        if (res.statusCode === 200) {
          try {
            const product = JSON.parse(data)
            console.log('  ✅ Product Found!')
            console.log('  Name:', product.name)
            console.log('  Status:', product.status)
            console.log('  Mode:', product.mode || 'Not specified')
            console.log('  Price:', product.price ? `$${product.price / 100}` : 'Not set')
          } catch (e) {
            console.log('  ❌ Failed to parse response')
          }
        } else if (res.statusCode === 404) {
          console.log('  ❌ Product NOT FOUND in Creem')
          console.log('  This product ID does not exist in your Creem account')
        } else {
          console.log('  ❌ Error Response:', data)
        }
        
        resolve()
      })
    })
    
    req.on('error', (error) => {
      console.error(`\n${planName} Plan: Network Error:`, error.message)
      resolve()
    })
    
    req.end()
  })
}

async function main() {
  await checkProduct(productIds.pro, 'Pro')
  await checkProduct(productIds.pro_plus, 'Pro Plus')
  
  console.log('\n\n📋 DIAGNOSIS:')
  console.log('If products are not found (404), you need to:')
  console.log('1. Create the products in your Creem test dashboard')
  console.log('2. OR update the product IDs in your .env.local file')
  console.log('3. OR switch to production mode if these are production product IDs')
  console.log('\nNote: Product IDs that start with "prod_" might be production IDs.')
  console.log('Test product IDs might have a different format.')
}

main()